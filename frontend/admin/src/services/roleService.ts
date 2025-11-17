import httpClient from "@/configurations/httpClient";
import type { Permission } from "./permissionService";

export interface Role {
  name: string;
  description: string;
  permissions: Permission[];
}

export interface RoleRequest {
  name: string;
  description: string;
  permissions: string[]; // Array of permission names
}

export interface ApiResponse<T> {
  code: number;
  message?: string;
  result: T;
}

// Get all roles
export const getAllRoles = async (): Promise<Role[]> => {
  const response = await httpClient.get<ApiResponse<Role[]>>("/roles");
  return response.data.result;
};

// Create role
export const createRole = async (request: RoleRequest): Promise<Role> => {
  const response = await httpClient.post<ApiResponse<Role>>("/roles", request);
  return response.data.result;
};

// Update role
export const updateRole = async (
  roleId: string,
  request: RoleRequest
): Promise<Role> => {
  const response = await httpClient.put<ApiResponse<Role>>(
    `/roles/${roleId}`,
    request
  );
  return response.data.result;
};

// Delete role
export const deleteRole = async (roleId: string): Promise<void> => {
  await httpClient.delete(`/roles/${roleId}`);
};
