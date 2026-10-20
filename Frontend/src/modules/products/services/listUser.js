import { instance } from "../../shared/api/axiosInstance";

export const getUserProducts = async ({
    search = null,
    pageNumber = 1,
    pageSize = 10,
}) => {
    try {
        const params = {
            Search: search,
            PageNumber: pageNumber,
            PageSize: pageSize,
        };

        const response = await instance.get("/api/products", { params });

        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: error.response?.data ?? error,
        };
    }
};
