import { instance } from "../../shared/api/axiosInstance";

export const getAdminOrders = async () => {
  try {
    const response = await instance.get("/api/orders");

    return {
      data: response.data,
      error: null,
    };

  } catch (error) {
    return {
      data: null,
      error: error.response ? error.response.data : error,
    };
  }
};
