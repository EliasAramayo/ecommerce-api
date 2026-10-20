import { Link } from "react-router-dom";

function ProductsTable({ products = [], onToggleStatus }) { 
    return (
        <div className="overflow-x-auto rounded-lg shadow-xl border border-[#df4861]/20 bg-[#161616]">
            <table className="w-full text-sm text-left">
               <thead className="text-xs text-black uppercase bg-white font-black tracking-wider">
                    <tr>
                        <th className="px-6 py-4 border-r border-gray-300 text-center">SKU</th>
                        <th className="px-6 py-4 border-r border-gray-300">Nombre</th>
                        <th className="px-6 py-4 border-r border-gray-300">Precio</th>
                        <th className="px-6 py-4 border-r border-gray-300">Stock</th>
                        <th className="px-6 py-4 border-r border-gray-300">Estado</th>
                        <th className="px-6 py-4 text-center">Acciones</th>
                    </tr>
                </thead>

                <tbody className="bg-black divide-y divide-[#df4861]/20 text-slate-300">
                    {products && products.length > 0 ? (
                        products.map((p) => {
                            const isActive = p.isActive ?? p.IsActive;
                            const sku = p.sku || p.Sku;
                            const name = p.name || p.Name;
                            const price = p.currentUnitPrice || p.CurrentUnitPrice;
                            const stock = p.stockQuantity || p.StockQuantity;
                            const id = p.id || p.Id;

                            return (
                                <tr 
                                    key={id} 
                                    className="hover:bg-[#1b1b1b] transition-colors duration-200 group"
                                >
                                    <td className="px-6 py-4 font-mono text-slate-400 border-r border-[#df4861]/20 text-center">
                                        {sku}
                                    </td>

                                    <td className="px-6 py-4 font-bold text-white border-r border-[#df4861]/20">
                                        {name}
                                    </td>

                                    <td className="px-6 py-4 text-emerald-400 font-mono border-r border-[#df4861]/20">
                                        ${price}
                                    </td>

                                    <td className="px-6 py-4 border-r border-[#df4861]/20">
                                        {stock} u.
                                    </td>

                                    <td className="px-6 py-4 border-r border-[#df4861]/20">
                                        <span className={`${isActive ? 'text-white' : 'text-slate-500 italic'}`}>
                                            {isActive ? "Habilitado" : "Deshabilitado"}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-6 font-bold text-xs uppercase tracking-wide">

                                            {/* EDITAR */}
                                            <Link 
                                                to={`/admin/products/edit/${id}`} 
                                                className="text-[#df4861] hover:text-[#c43c54] transition-colors"
                                            >
                                                Editar
                                            </Link>
                                            
                                            {/* HABILITAR / DESHABILITAR */}
                                            <button
                                                onClick={() => onToggleStatus && onToggleStatus(id)}
                                                className="
                                                    text-[#ffffff] 
                                                    hover:text-[#c43c54] 
                                                    transition-colors
                                                "
                                            >
                                                {isActive ? "Deshabilitar" : "Habilitar"}
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                No hay productos para mostrar.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default ProductsTable;
