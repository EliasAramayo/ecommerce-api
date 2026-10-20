import { instance } from '../../shared/api/axiosInstance';

export const updateOrderStatus = async (orderId, newStatus) => {
    try {
        const response = await instance.put(`/api/orders/${orderId}/status`, {
            // CORRECCIÓN: El backend pide explícitamente "newStatus"
            newStatus: newStatus 
        });
        
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error al actualizar el estado de la orden", error);
        
        if (error.response && error.response.data && error.response.data.errors) {
            console.log("CAMPOS REQUERIDOS POR EL BACKEND:", error.response.data.errors);
        }
        
        return { success: false, error };
    }
};