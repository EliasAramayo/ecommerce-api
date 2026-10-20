import { instance } from "../../shared/api/axiosInstance";

export const registerUser = async (data) => {
    try {
        const response = await instance.post("/api/auth/register", {
            username: data.username,
            email: data.email,
            password: data.password,
        });

        return { success: true, data: response.data, error: null };

    } catch (error) {
        console.error("Error en servicio register:", error);
        return { success: false, error: error.response?.data || error };
    }
};