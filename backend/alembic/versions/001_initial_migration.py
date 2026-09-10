"""Initial Migration - LabFlow Core Schema

Revision ID: 001_initial_migration
Revises: 
Create Date: 2026-09-10 21:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_migration'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Users
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True, index=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), unique=True, index=True, nullable=False),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), nullable=False, index=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # 2. Patients
    op.create_table(
        'patients',
        sa.Column('id', sa.String(36), primary_key=True, index=True),
        sa.Column('patient_uid', sa.String(50), unique=True, index=True, nullable=False),
        sa.Column('name', sa.String(255), index=True, nullable=False),
        sa.Column('age', sa.Integer(), nullable=False),
        sa.Column('gender', sa.String(20), nullable=False),
        sa.Column('phone', sa.String(50), index=True, nullable=False),
        sa.Column('email', sa.String(255), index=True, nullable=True),
        sa.Column('address', sa.String(500), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # 3. Tests
    op.create_table(
        'tests',
        sa.Column('id', sa.String(36), primary_key=True, index=True),
        sa.Column('test_code', sa.String(50), unique=True, index=True, nullable=False),
        sa.Column('name', sa.String(255), index=True, nullable=False),
        sa.Column('category', sa.String(100), index=True, nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('sample_type', sa.String(100), index=True, nullable=False),
        sa.Column('normal_range', sa.String(255), nullable=True),
        sa.Column('unit', sa.String(50), nullable=True),
        sa.Column('price', sa.Float(), nullable=False, default=0.0),
        sa.Column('expected_tat_minutes', sa.Integer(), nullable=False, default=120),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # 4. Orders
    op.create_table(
        'orders',
        sa.Column('id', sa.String(36), primary_key=True, index=True),
        sa.Column('order_uid', sa.String(50), unique=True, index=True, nullable=False),
        sa.Column('patient_id', sa.String(36), sa.ForeignKey('patients.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('requested_by', sa.String(255), nullable=True),
        sa.Column('priority', sa.String(20), nullable=False, index=True),
        sa.Column('status', sa.String(30), nullable=False, index=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('ordered_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expected_completion_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # 5. Order Tests
    op.create_table(
        'order_tests',
        sa.Column('id', sa.String(36), primary_key=True, index=True),
        sa.Column('order_id', sa.String(36), sa.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('test_id', sa.String(36), sa.ForeignKey('tests.id', ondelete='RESTRICT'), nullable=False, index=True),
        sa.Column('status', sa.String(30), nullable=False, default='PENDING'),
        sa.Column('assigned_to', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # 6. Samples
    op.create_table(
        'samples',
        sa.Column('id', sa.String(36), primary_key=True, index=True),
        sa.Column('sample_uid', sa.String(50), unique=True, index=True, nullable=False),
        sa.Column('order_id', sa.String(36), sa.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('sample_type', sa.String(100), nullable=False),
        sa.Column('collection_status', sa.String(30), nullable=False, index=True),
        sa.Column('collected_by', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('collected_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('received_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejected_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # 7. Results
    op.create_table(
        'results',
        sa.Column('id', sa.String(36), primary_key=True, index=True),
        sa.Column('order_test_id', sa.String(36), sa.ForeignKey('order_tests.id', ondelete='CASCADE'), unique=True, nullable=False, index=True),
        sa.Column('value', sa.Text(), nullable=False),
        sa.Column('numeric_value', sa.Float(), nullable=True),
        sa.Column('unit', sa.String(50), nullable=True),
        sa.Column('reference_range', sa.String(255), nullable=True),
        sa.Column('flag', sa.String(20), nullable=False, default='NORMAL'),
        sa.Column('entered_by', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('entered_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('verified_by', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(30), nullable=False, index=True),
        sa.Column('comments', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # 8. Reports
    op.create_table(
        'reports',
        sa.Column('id', sa.String(36), primary_key=True, index=True),
        sa.Column('report_uid', sa.String(50), unique=True, index=True, nullable=False),
        sa.Column('order_id', sa.String(36), sa.ForeignKey('orders.id', ondelete='CASCADE'), unique=True, nullable=False, index=True),
        sa.Column('generated_by', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('generated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('verified_by', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(30), nullable=False, index=True),
        sa.Column('report_url', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # 9. Audit Logs
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(36), primary_key=True, index=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('action', sa.String(100), nullable=False, index=True),
        sa.Column('entity_type', sa.String(50), nullable=False, index=True),
        sa.Column('entity_id', sa.String(100), nullable=False, index=True),
        sa.Column('old_value', sa.JSON(), nullable=True),
        sa.Column('new_value', sa.JSON(), nullable=True),
        sa.Column('ip_address', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # 10. Notifications
    op.create_table(
        'notifications',
        sa.Column('id', sa.String(36), primary_key=True, index=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=True, index=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('type', sa.String(50), nullable=False, default='INFO'),
        sa.Column('is_read', sa.Boolean(), nullable=False, default=False, index=True),
        sa.Column('reference_entity_type', sa.String(50), nullable=True),
        sa.Column('reference_entity_id', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('notifications')
    op.drop_table('audit_logs')
    op.drop_table('reports')
    op.drop_table('results')
    op.drop_table('samples')
    op.drop_table('order_tests')
    op.drop_table('orders')
    op.drop_table('tests')
    op.drop_table('patients')
    op.drop_table('users')
