import { addToCart } from "../helpers/cart";

function ProductsGrid({ products }) {
    const handleAdd = (product) => {
        addToCart(product);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => {
                const stock = p.stockQuantity || 0;
                const hasStock = stock > 0;

                return (
                    <div 
                        key={p.id}
                        className="
                            bg-[#161616]
                            rounded-lg
                            p-4
                            shadow-xl
                            border
                            border-[#df4861]/10
                            hover:border-[#df4861]
                            hover:shadow-[0_0_15px_#df486155]
                            transition-all
                            duration-300
                            flex
                            flex-col
                            justify-between
                            h-full
                            group
                        "
                    >
                        {/* Imagen */}
                        <div className="h-40 bg-[#0b0b0b] mb-4 rounded flex items-center justify-center text-[#df4861]/40 group-hover:text-[#df4861] transition-colors">
                            <span className="text-4xl">🚗</span>
                        </div>

                        {/* Título y descripción */}
                        <h3 className="font-bold text-white text-lg leading-tight mb-2 uppercase tracking-wide">
                            {p.name}
                        </h3>
                        
                        <p className="text-xs text-slate-400 line-clamp-3 mb-4 font-medium" title={p.description}>
                            {p.description}
                        </p>

                        {/* Precio y Stock */}
                        <div className="flex justify-between items-end mb-4 border-t border-[#df4861]/20 pt-3">
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Precio</p>
                                <p className="font-black text-2xl text-[#ffffff]">
                                    ${p.currentUnitPrice}
                                </p>
                            </div>

                            <span
                                className={`
                                    text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider
                                    ${hasStock
                                        ? "bg-green-900/40 text-green-300 border border-green-600/40"
                                        : "bg-red-900/40 text-red-300 border border-red-600/40"
                                    }
                                `}
                            >
                                {hasStock ? `${stock} Unidades` : "Sin Stock"}
                            </span>
                        </div>

                        {/* Botón */}
                        <button
                            disabled={!hasStock}
                            onClick={() => handleAdd(p)}
                            className={`
                                w-full
                                py-3
                                rounded
                                font-bold
                                uppercase
                                text-sm
                                tracking-wide
                                transition-all
                                duration-200
                                ${hasStock
                                    ? "bg-[#df4861] text-white hover:bg-[#c43c54] active:scale-95 shadow-lg shadow-[#df4861]/30"
                                    : "bg-[#3a3a3a] text-[#777] cursor-not-allowed"
                                }
                            `}
                        >
                            {hasStock ? "Comprar Ahora" : "Sin Stock"}
                        </button>

                    </div>
                );
            })}
        </div>
    );
}

export default ProductsGrid;
