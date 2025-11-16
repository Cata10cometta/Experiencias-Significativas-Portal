import configApi from "../Config/Config";

export interface ChangePasswordRequest {
  userId: number;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const updatePassword = async (data: ChangePasswordRequest) => {
  const response = await configApi.put("/auth/UpdatePassword", data);
  return response.data;
};
