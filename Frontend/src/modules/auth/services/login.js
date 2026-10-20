import { instance } from "../../shared/api/axiosInstance";

export const login = async (data) => {
  try {
    const response = await instance.post("/api/auth/login", data);

    const { token, userInfo } = response.data;

    const normalizedUser = {
      id: userInfo.id,             
      username: userInfo.username, 
      email: userInfo.email,       
      role: userInfo.role          
    };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));

    return { token, user: normalizedUser, error: null };

  } catch (error) {
    console.error("Error en servicio login:", error);
    return { token: null, user: null, error };
  }
};