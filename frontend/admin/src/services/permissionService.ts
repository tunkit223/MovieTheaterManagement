import httpClient from "@/configurations/httpClient";

export interface Permission {
  name: string;
  description: string;
}

export interface PermissionRequest {
  name: string;
  description: string;
}

export interface ApiResponse<T> {
  code: number;
  message?: string;
  result: T;
}

// Get all permissions
export const getAllPermissions = async (): Promise<Permission[]> => {
  const response = await httpClient.get<ApiResponse<Permission[]>>(
    "/permissions"
  );
  return response.data.result;
};

// Create permission
export const createPermission = async (
  request: PermissionRequest
): Promise<Permission> => {
  const response = await httpClient.post<ApiResponse<Permission>>(
    "/permissions",
    request
  );
  return response.data.result;
};

// Delete permission
export const deletePermission = async (permissionId: string): Promise<void> => {
  await httpClient.delete(`/permissions/${permissionId}`);
};
