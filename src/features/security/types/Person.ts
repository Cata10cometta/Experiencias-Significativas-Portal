export interface Person {
  id: number;
  documentType: string;
  identificationNumber: string;
  firstName: string;
  middleName: string;
  firstLastName: string;
  secondLastName: string;
  fullName: string;
  codeDane: string;
  emailInstitutional: string;
  email: string;
  phone: number;
  state?: boolean; // Estado activo/inactivo
}