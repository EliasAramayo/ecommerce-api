import { instance } from "../../shared/api/axiosInstance";

export const listProducts = async (search = "") => {
    try {
        const params = {
            Search: search,
            Status: "enabled"
        };

        const response = await instance.get("api/products", { params });

        return {
            data: response.data,
            error: null
        };

    } catch (error) {
        return { data: null, error };
    }
};
