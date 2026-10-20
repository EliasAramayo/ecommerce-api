import { instance } from "../../shared/api/axiosInstance";

export const getDashboardCounts = async () => {
    try {
        const prodResponse = await instance.get("/api/products/admin", {
            params: { PageNumber: 1, PageSize: 1 }
        });

        const orderResponse = await instance.get("/api/orders");

        return {
            products: prodResponse.data.totalCount ?? prodResponse.data.length ?? 0,
            orders: orderResponse.data.length ?? 0,
            error: null
        };

    } catch (error) {
        return {
            products: 0,
            orders: 0,
            error
        };
    }
};
