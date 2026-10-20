import { instance } from '../../shared/api/axiosInstance';

export const updateProduct = async (formData) => {
    if (!formData.id) {
        throw new Error("Product ID is missing.");
    }

    await instance.put(`/api/products/${formData.id}`, {
        sku: formData.sku,
        internalCode: formData.cui,
        name: formData.name,
        description: formData.description,
        currentUnitPrice: formData.price,
        stockQuantity: formData.stock,
    });
};

