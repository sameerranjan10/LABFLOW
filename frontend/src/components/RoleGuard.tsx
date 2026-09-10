"use client";

import React from "react";
import { LabRole, LAB_ROLES_PERMISSIONS, RolePermissions } from "@/lib/roles";

interface RoleGuardProps {
  currentRole: LabRole;
  permission?: keyof RolePermissions;
  allowedRoles?: LabRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  currentRole,
  permission,
  allowedRoles,
  fallback = null,
  children,
}) => {
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <>{fallback}</>;
  }

  if (permission && !LAB_ROLES_PERMISSIONS[currentRole][permission]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
