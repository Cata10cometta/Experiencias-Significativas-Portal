import axios from "axios";

export const createExperience = async (data: any) => {
  const token = localStorage.getItem("token"); 
  const response = await axios.post("/api/Experience/register", 
  data,
  {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
);
  return response.data;
};
