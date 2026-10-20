import { useEffect, useState } from "react";

export default function useProductsList(serviceFn) {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ 
        pageNumber: 1, 
        totalPages: 1, 
        pageSize: 5, 
        totalCount: 0 
    });
    const [loading, setLoading] = useState(true);

    const fetchProducts = async (page = 1, search = null, status = "all", pageSize = 5) => {
        setLoading(true);

        const { data, error } = await serviceFn({
            pageNumber: page,
            pageSize: pageSize, 
            search,
            status: status,     
        });

        if (error || !data) {
            setProducts([]);
            setLoading(false);
            return;
        }

        const safeItems = data.items || data.Items || [];

        setProducts(safeItems); 

        setPagination({
            totalCount: data.totalCount,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalPages: data.totalPages,
        });

        setLoading(false);
    };

    useEffect(() => {
        fetchProducts(1);
    }, []);

    return { products, pagination, loading, fetchProducts };
}