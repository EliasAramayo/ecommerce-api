import { instance } from "../../shared/api/axiosInstance";

export const getAdminProducts = async ({
  search = null,
  status = "all",
  pageNumber = 1,
  pageSize = 10,
}) => {
  try {
    const params = {
      Search: search,
      Status: status === "all" ? null : status,
      PageNumber: pageNumber,
      PageSize: pageSize,
    };

    const response = await instance.get("/api/products/admin", { params });

    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data ?? error,
    };
  }
};
