function CartItem({ item, updateQty, removeItem }) {
    return (
        <div
            className="
                bg-[#161616]
                p-4
                rounded-lg
                shadow-lg
                border border-[#df4861]/20
                flex flex-col sm:flex-row
                justify-between
                items-center
                gap-4
                hover:border-[#df4861]/40
                transition-all
            "
        >
            {/* INFO */}
            <div className="text-center sm:text-left w-full sm:w-auto">
                <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                    {item.name}
                </h2>
                <p className="text-[#df4861] font-black">
                    ${item.price}
                    <span className="text-slate-400 text-xs font-normal"> / unidad</span>
                </p>
            </div>

            {/* CONTROLES */}
            <div className="flex items-center gap-3 bg-[#0d0d0d] p-3 rounded-lg border border-slate-700">
                
                {/* - */}
                <button
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="
                        w-8 h-8
                        flex items-center justify-center
                        bg-[#1c1c1c] 
                        text-white font-bold 
                        rounded
                        hover:bg-[#df4861]
                        hover:shadow-[#df4861]/40
                        transition
                    "
                >
                    -
                </button>

                {/* Cantidad */}
                <span className="w-10 text-center font-bold text-white">
                    {item.quantity}
                </span>

                {/* + */}
                <button
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="
                        w-8 h-8
                        flex items-center justify-center
                        bg-[#1c1c1c]
                        text-white font-bold
                        rounded
                        hover:bg-[#df4861]
                        hover:shadow-[#df4861]/40
                        transition
                    "
                >
                    +
                </button>

                <div className="w-px h-6 bg-slate-700 mx-1"></div>

                {/* ELIMINAR */}
                <button
                    onClick={() => removeItem(item.id)}
                    className="
                        w-8 h-8
                        flex items-center justify-center
                        bg-[#df4861]/20 
                        text-[#df4861] 
                        rounded
                        hover:bg-[#df4861]
                        hover:text-white
                        transition-all
                        font-black
                    "
                    title="Eliminar producto"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

export default CartItem;
