export interface RolFormPermission {
  id: number;
  roleId: number;
  formId: number;
  permissionId: number;
  role: string;
  form: string;
  permission: string;
  state?: boolean; // Estado activo/inactivo
}
