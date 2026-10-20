import { useEffect, useState } from "react";
import useAuth from "../../auth/hook/useAuth";
import CartItem from "../components/CartItem";
import { createOrder } from "../../orders/services/createOrder";
import { useNavigate } from "react-router-dom";
import Navbar from "../../home/components/Navbar";

function CartPage() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [cart, setCart] = useState([]);

    const [shippingAddress, setShippingAddress] = useState("");
    const [billingAddress, setBillingAddress] = useState("");

    const [errorMessage, setErrorMessage] = useState(""); 

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(saved);
    }, []);

    const updateQty = (id, newQty) => {
        if (newQty < 1) return;
        const updated = cart.map((p) => p.id === id ? { ...p, quantity: newQty } : p);
        setCart(updated);
        localStorage.setItem("cart", JSON.stringify(updated));
    };

    const removeItem = (id) => {
        const updated = cart.filter((p) => p.id !== id);
        setCart(updated);
        localStorage.setItem("cart", JSON.stringify(updated));
    };

    const total = cart.reduce((acc, p) => acc + p.price * p.quantity, 0);

    const finishOrder = async () => {
        setErrorMessage("");

        if (!isAuthenticated) {
            setErrorMessage("Debes iniciar sesión para finalizar la compra.");
            return; 
        }

        if (!shippingAddress.trim() || !billingAddress.trim()) {
            setErrorMessage("Por favor, completa las direcciones de envío y facturación.");
            return;
        }

        const currentUserId = user?.id || JSON.parse(localStorage.getItem("user"))?.id;
        if (!currentUserId) {
            setErrorMessage("Error de sesión. Por favor sal de tu cuenta y vuelve a entrar.");
            return;
        }

        const order = {
            customerId: currentUserId,
            shippingAddress: shippingAddress,
            billingAddress: billingAddress,
            orderItems: cart.map((p) => ({
                productId: p.id,
                quantity: p.quantity
            }))
        };

        const { data, error } = await createOrder(order);

        if (error) {
            console.error("Error al crear orden:", error);
            
            const serverMsg = error.response?.data?.message || error.message || error;
            
            if (typeof serverMsg === 'string') {
                setErrorMessage(serverMsg);
            } else {
                setErrorMessage("Ocurrió un error al procesar la orden (Stock insuficiente o error de servidor).");
            }
            return;
        }

        alert("¡Compra realizada con éxito!");
        localStorage.removeItem("cart");
        setCart([]);
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-[#0b0b0b]">
            <Navbar /> 

            <div className="p-6 max-w-4xl mx-auto w-full">
                <h1 className="text-3xl font-black mb-8 text-white uppercase tracking-widest border-b border-[#df4861]/40 pb-4">
                    Tu Carrito
                </h1>

                {cart.length === 0 ? (
                    <div className="text-center py-20 bg-[#161616] rounded-lg border border-dashed border-slate-700">
                        <p className="text-xl text-slate-400 font-medium">Tu carrito está vacío.</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="mt-4 text-[#df4861] hover:text-[#c43c54] underline underline-offset-4"
                        >
                            Volver al catálogo
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        
                        {/* ITEMS */}
                        <div className="flex flex-col gap-4">
                            {cart.map((item) => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    updateQty={updateQty}
                                    removeItem={removeItem}
                                />
                            ))}
                        </div>

                        {/* DIRECCIONES */}
                        <div className="bg-[#161616] p-6 rounded-lg shadow-lg border border-[#df4861]/30">
                            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                📍 Datos de Entrega
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                        Dirección de Envío
                                    </label>
                                    <input 
                                        type="text"
                                        className="bg-black border border-slate-700 text-white rounded p-3 focus:border-[#df4861] outline-none placeholder-slate-500"
                                        placeholder="Calle, Número, Ciudad..."
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                        Dirección de Facturación
                                    </label>
                                    <input 
                                        type="text"
                                        className="bg-black border border-slate-700 text-white rounded p-3 focus:border-[#df4861] outline-none placeholder-slate-500"
                                        placeholder="Calle, Número, Ciudad..."
                                        value={billingAddress}
                                        onChange={(e) => setBillingAddress(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="sameAddress"
                                    className="accent-[#df4861] w-4 h-4 cursor-pointer"
                                    onChange={(e) => { if(e.target.checked) setBillingAddress(shippingAddress); }}
                                />
                                <label htmlFor="sameAddress" className="text-slate-400 text-sm cursor-pointer select-none">
                                    Usar la misma dirección para facturación
                                </label>
                            </div>
                        </div>

                        {/* ERROR */}
                        {errorMessage && (
                            <div className="bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded flex items-start gap-3 animate-pulse">
                                <span className="text-xl">⚠️</span>
                                <div>
                                    <p className="font-bold">No se pudo completar la compra</p>
                                    <p className="text-sm opacity-90">{errorMessage}</p>
                                </div>
                            </div>
                        )}

                        {/* TOTAL */}
                        <div className="bg-[#161616] p-6 rounded-lg shadow-xl border-t-4 border-[#df4861] flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-center sm:text-left">
                                <p className="text-slate-400 text-sm uppercase font-bold">Total a pagar</p>
                                <p className="text-3xl font-black text-white">${total.toFixed(2)}</p>
                            </div>

                            <button
                                onClick={finishOrder}
                                className="w-full sm:w-auto bg-[#df4861] text-white px-8 py-4 rounded font-bold uppercase tracking-wider shadow-lg shadow-[#df4861]/20 hover:bg-[#c43c54] transition-all active:scale-95"
                            >
                                Finalizar compra
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CartPage;
