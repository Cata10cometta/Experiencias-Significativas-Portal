import axios from "axios";
import { DataSelectRequest } from "../../shared/types/HelperTypes";

const API_URL = "https://localhost:7263/api/Helper"; // URL de tu backend

export const getEnum = async (
  enumName: string,
  
): Promise<DataSelectRequest[]> => {
  try {
    const response = await axios.get(`${API_URL}/${enumName}`, {

    });

    if (response.data) {
      return response.data.data;
    } else {
      console.error("No se encontraron registros:", response.data.message);
      return [];
    }
  } catch (error: any) {
    console.error("Error al obtener el enum:", error.response?.data || error.message);
    return [];
  }
};
