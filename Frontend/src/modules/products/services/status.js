import { instance } from '../../shared/api/axiosInstance';

export const updateProductStatus = async (productId, status) => {
    try {
        const response = await instance.patch(`/api/products/${productId}`, {
            isActive: status,
        });
        console.log("Respuesta del backend:", response.data); 
    } catch (error) {
        console.error("Error al actualizar el estado del producto", error);
        throw error; 
    }
};

