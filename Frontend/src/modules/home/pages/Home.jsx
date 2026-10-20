import useProductsList from "../../products/helpers/useProductsList";
import { getUserProducts } from "../../products/services/listUser";
import ProductsGrid from "../../products/components/ProductsGrid";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

function Home() {
    const [search, setSearch] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const {
        products,
        pagination,
        loading,
        fetchProducts
    } = useProductsList(getUserProducts);

    useEffect(() => {
        fetchProducts(1, "", "all", itemsPerPage);
    }, []);

    const handleInputChange = (e) => setSearch(e.target.value);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchProducts(1, search, "all", itemsPerPage);
    };

    const handleClear = () => {
        setSearch("");
        fetchProducts(1, "", "all", itemsPerPage);
    };

    const handleItemsPerPageChange = (e) => {
        const newSize = Number(e.target.value);
        setItemsPerPage(newSize);
        fetchProducts(1, search, "all", newSize);
    };

    const changePage = (newPage) => {
        fetchProducts(newPage, search, "all", itemsPerPage);
    };

    if (loading)
        return (
            <div className="min-h-screen bg-[#121212] text-white p-6 flex justify-center">
                <p className="animate-pulse">Cargando catálogo...</p>
            </div>
        );

    const hasProducts = products && products.length > 0;
    const safePagination = pagination ?? { pageNumber: 1, totalPages: 1 };

    return (
        <div className="min-h-screen bg-[#121212] flex flex-col">
            <Navbar />

            <div className="flex-grow p-6 max-w-7xl mx-auto w-full">

                {/* TITULAR */}
                <div className="mb-8 border-l-4 border-[#df4861] pl-4">
                    <h1 className="text-3xl font-black text-white uppercase tracking-widest">
                        Catálogo de Productos
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Encontrá lo mejor para tu auto al mejor precio.
                    </p>
                </div>

                {/* BUSCADOR */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="flex flex-col sm:flex-row gap-2 mb-8 bg-[#161616] p-4 rounded-lg shadow-xl border border-[#df4861]/20"
                >
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        value={search}
                        onChange={handleInputChange}
                        className="
                            flex-grow 
                            border border-slate-700 
                            bg-[#0d0d0d] 
                            text-white 
                            p-3 
                            rounded 
                            focus:ring-2 
                            focus:ring-[#df4861] 
                            outline-none 
                            placeholder-slate-500
                        "
                    />

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="
                                bg-[#df4861]
                                text-white
                                px-6 py-2
                                rounded
                                font-bold
                                uppercase
                                tracking-wider
                                hover:bg-[#c43c54]
                                transition-colors
                                shadow-lg shadow-[#df4861]/40
                            "
                        >
                            Buscar
                        </button>

                        <button
                            type="button"
                            onClick={handleClear}
                            className="
                                bg-[#2a2a2a]
                                text-slate-300
                                px-4 py-2
                                rounded
                                font-bold
                                hover:bg-[#3a3a3a]
                                border border-slate-600
                                transition-colors
                            "
                        >
                            X
                        </button>
                    </div>
                </form>

                {/* LISTADO */}
                {!hasProducts ? (
                    <div className="text-center py-20 text-slate-500 bg-[#161616]/80 rounded-lg border border-dashed border-slate-700">
                        <p className="text-xl font-medium">No se encontraron productos.</p>

                        {search && (
                            <p className="text-sm mt-2 text-slate-400">
                                Probá con otra búsqueda.
                            </p>
                        )}
                    </div>
                ) : (
                    <>
                        <ProductsGrid products={products} />

                        {/* PAGINADOR */}
                        <div className="
                            flex flex-col sm:flex-row 
                            gap-4 mt-10 
                            justify-between items-center
                            bg-[#161616]
                            p-4 
                            rounded-lg
                            border-t-4 border-[#df4861]
                            shadow-2xl
                        ">
                            {/* ITEMS PER PAGE */}
                            <div className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                                <span>Mostrar:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={handleItemsPerPageChange}
                                    className="
                                        border border-slate-600 
                                        p-1 rounded 
                                        bg-[#0c0c0c] 
                                        text-white 
                                        outline-none 
                                        focus:border-[#df4861]
                                    "
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            {/* BOTONES */}
                            <div className="flex gap-1 items-center">
                                <button
                                    disabled={safePagination.pageNumber === 1}
                                    onClick={() => changePage(safePagination.pageNumber - 1)}
                                    className="
                                        px-4 py-2 
                                        bg-[#2a2a2a] 
                                        text-white 
                                        rounded
                                        hover:bg-[#df4861]
                                        disabled:opacity-40 
                                        disabled:hover:bg-[#2a2a2a]
                                        transition-colors 
                                        text-sm font-bold
                                    "
                                >
                                    &lt; Ant
                                </button>

                                <span className="
                                    text-sm text-white font-bold 
                                    px-4 
                                    py-2
                                    rounded 
                                    bg-[#0d0d0d]
                                    border border-slate-700
                                ">
                                    {safePagination.pageNumber} / {safePagination.totalPages}
                                </span>

                                <button
                                    disabled={safePagination.pageNumber === safePagination.totalPages}
                                    onClick={() => changePage(safePagination.pageNumber + 1)}
                                    className="
                                        px-4 py-2 
                                        bg-[#2a2a2a] 
                                        text-white 
                                        rounded
                                        hover:bg-[#df4861]
                                        disabled:opacity-40 
                                        disabled:hover:bg-[#2a2a2a]
                                        transition-colors 
                                        text-sm font-bold
                                    "
                                >
                                    Sig &gt;
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Home;
