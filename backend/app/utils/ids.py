import datetime
import random
import string


def generate_patient_uid() -> str:
    """Generate unique patient identifier, e.g., PAT-2026-837492"""
    year = datetime.datetime.now().year
    rand_digits = "".join(random.choices(string.digits, k=6))
    return f"PAT-{year}-{rand_digits}"


def generate_order_uid() -> str:
    """Generate unique human-readable order identifier, e.g., LAB-2026-000184"""
    year = datetime.datetime.now().year
    rand_digits = "".join(random.choices(string.digits, k=6))
    return f"LAB-{year}-{rand_digits}"


def generate_sample_uid() -> str:
    """Generate unique sample identifier, e.g., SMP-2026-492018"""
    year = datetime.datetime.now().year
    rand_digits = "".join(random.choices(string.digits, k=6))
    return f"SMP-{year}-{rand_digits}"


def generate_report_uid() -> str:
    """Generate unique report identifier, e.g., RPT-2026-102948"""
    year = datetime.datetime.now().year
    rand_digits = "".join(random.choices(string.digits, k=6))
    return f"RPT-{year}-{rand_digits}"
