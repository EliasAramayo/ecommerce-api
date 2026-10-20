import { useEffect, useState } from "react";

export default function CartWidget() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const updateCount = () => {
            try {
                const cart = JSON.parse(localStorage.getItem("cart") || "[]");
                const total = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
                setCount(total);
            } catch (error) {
                console.error("Error leyendo carrito:", error);
                setCount(0);
            }
        };

        updateCount();

        window.addEventListener("storage", updateCount);

        window.addEventListener("cart-updated", updateCount);

        return () => {
            window.removeEventListener("storage", updateCount);
            window.removeEventListener("cart-updated", updateCount);
        };
    }, []);

    if (count === 0) return null;

    return (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-pulse">
            {count > 99 ? "99+" : count}
        </span>
    );
}