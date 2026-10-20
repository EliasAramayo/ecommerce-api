import { useState, useEffect } from "react"; 
import { Link } from "react-router-dom";
import useProductsList from "../helpers/useProductsList";
import { getAdminProducts } from "../services/list";
import { updateProductStatus } from "../services/status";
import ProductsTable from "../components/ProductsTable";

function ListProductsAdminPage() {
  const { products, pagination, loading, fetchProducts } = useProductsList(getAdminProducts);
  
  const [searchInput, setSearchInput] = useState(""); 
  const [searchTerm, setSearchTerm] = useState("");   
  
  const [productList, setProductList] = useState([]); 
  const [statusFilter, setStatusFilter] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(5); 

  useEffect(() => {
    setProductList(products); 
  }, [products]); 

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    fetchProducts(1, searchInput, statusFilter, itemsPerPage);
  };

  const handleClear = () => {
    setSearchInput("");
    setSearchTerm("");
    fetchProducts(1, "", statusFilter, itemsPerPage);
  };

  const handleItemsPerPageChange = (e) => {
    const newSize = Number(e.target.value);
    setItemsPerPage(newSize);
    fetchProducts(1, searchTerm, statusFilter, newSize);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    fetchProducts(1, searchTerm, e.target.value, itemsPerPage); 
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    const newStatus = !currentStatus; 

    setProductList((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, isActive: newStatus } : product
      )
    );

    try {
      await updateProductStatus(productId, newStatus);
      fetchProducts(pagination.pageNumber, searchTerm, statusFilter, itemsPerPage); 
    } catch (error) {
      console.error("Error al actualizar el estado", error);
      setProductList((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId ? { ...product, isActive: currentStatus } : product
        )
      );
      alert("Error al actualizar el estado.");
    }
  };

  const filteredProducts = productList.filter((product) => {
    if (statusFilter === "all") return true; 
    if (statusFilter === "active") return product.isActive === true; 
    if (statusFilter === "inactive") return product.isActive === false; 
    return true;
  });

  const searchedProducts = filteredProducts.filter((product) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchTermLower) ||
      product.sku.toLowerCase().includes(searchTermLower)
    );
  });

  if (loading) return (
      <div className="flex justify-center items-center h-64">
          <p className="text-white text-lg animate-pulse">Cargando catálogo...</p>
      </div>
  );

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-[#df4861]/40 pb-4">
        <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider">
                Productos <span className="text-slate-500 text-lg font-normal">(Admin)</span>
            </h1>
            <p className="text-slate-400 text-sm">Gestiona el inventario de la tienda</p>
        </div>
        
        <Link
          to="/admin/products/create"
          className="
            bg-[#df4861] hover:bg-[#c43c54]
            text-white font-bold uppercase text-sm tracking-wide
            px-6 py-3 rounded shadow-lg shadow-[#df4861]/30
            transition-all active:scale-95
            flex items-center gap-2
          "
        >
          <span>+</span> Nuevo Producto
        </Link>
      </div>

      <div className="bg-[#161616] p-4 rounded-lg border border-[#df4861]/20 shadow-lg flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
        
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto flex-grow max-w-2xl">
            <input
                type="text"
                placeholder="Buscar por Nombre o SKU..."
                className="
                    w-full
                    bg-black 
                    text-white 
                    border border-[#df4861]/40 
                    rounded 
                    px-4 py-2 
                    focus:outline-none focus:border-[#df4861] focus:ring-1 focus:ring-[#df4861]
                    placeholder-slate-500
                "
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
                type="submit"
                className="bg-[#df4861] hover:bg-[#c43c54] text-white px-4 py-2 rounded font-bold uppercase text-sm transition-colors"
            >
                Buscar
            </button>
            {(searchInput || searchTerm) && (
                <button
                type="button"
                onClick={handleClear}
                className="bg-[#222] hover:bg-[#333] text-slate-300 px-4 py-2 rounded font-bold uppercase text-sm transition-colors border border-[#df4861]/30"
                >
                ✕
                </button>
            )}
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-slate-300 text-sm font-bold whitespace-nowrap" htmlFor="statusFilter">
                Estado:
            </label>
            <select
                id="statusFilter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="
                    bg-black
                    text-white 
                    border border-[#df4861]/40
                    rounded 
                    px-3 py-2 
                    focus:outline-none focus:border-[#df4861]
                    cursor-pointer
                    w-full md:w-40
                "
            >
                <option value="all">Todos</option>
                <option value="active">Habilitados</option>
                <option value="inactive">Deshabilitados</option>
            </select>
        </div>
      </div>

      <ProductsTable
        products={searchedProducts} 
        onToggleStatus={handleToggleStatus} 
      />

      <div className="bg-[#161616] p-4 rounded-lg border border-[#df4861]/20 shadow-lg flex flex-col sm:flex-row gap-4 justify-between items-center">
        
        <div className="flex items-center gap-3 text-sm text-slate-300 font-medium">
          <span>Mostrar:</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="bg-black border border-[#df4861]/40 text-white rounded p-1 outline-none focus:border-[#df4861] cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex gap-2 items-center">
          <button
            disabled={pagination.pageNumber === 1}
            onClick={() => fetchProducts(pagination.pageNumber - 1, searchTerm, statusFilter, itemsPerPage)}
            className="
                px-4 py-2 
                bg-[#222] text-white 
                rounded 
                hover:bg-[#df4861] 
                disabled:opacity-50 disabled:hover:bg-[#222] disabled:cursor-not-allowed
                transition-colors 
                text-xs font-bold uppercase
            "
          >
            Anterior
          </button>

          <span className="text-sm text-white font-bold px-4">
            {pagination.pageNumber} <span className="text-slate-500 font-normal">de</span> {pagination.totalPages}
          </span>

          <button
            disabled={pagination.pageNumber === pagination.totalPages}
            onClick={() => fetchProducts(pagination.pageNumber + 1, searchTerm, statusFilter, itemsPerPage)}
            className="
                px-4 py-2 
                bg-[#222] text-white 
                rounded 
                hover:bg-[#df4861] 
                disabled:opacity-50 disabled:hover:bg-[#222] disabled:cursor-not-allowed
                transition-colors 
                text-xs font-bold uppercase
            "
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

export default ListProductsAdminPage;
