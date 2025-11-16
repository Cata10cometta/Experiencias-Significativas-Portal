// Api/Services/Register.ts
import configApi from "../Config/Config"; // tu instancia de Axios

// Register person
export const registerPerson = async (personPayload: any) => {
  console.log("Payload sent to /Person/create:", personPayload);
  const response = await configApi.post("/Person/create", personPayload);
  return response.data;
};



