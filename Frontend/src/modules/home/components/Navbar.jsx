import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../auth/hook/useAuth";
import CartWidget from "./CartWidget";

function Navbar() {
    const { isAuthenticated, setAuth } = useAuth();
    const navigate = useNavigate();

    const logout = () => {
        setAuth({
            isAuthenticated: false,
            user: null,
            token: null,
        });
        localStorage.removeItem("token");
        navigate("/");
    };

    const goToCart = () => navigate("/cart");

    return (
        <nav className="
            flex items-center justify-between 
            px-6 py-4 
            bg-black 
            border-b border-[#df4861]/30 
            sticky top-0 z-50
        ">
            {/* LOGO */}
           <NavLink to="/" className="flex items-center">
  <img 
    src="logo.png"   // ← poné tu imagen aquí
    alt="Repuestera El Chorolqui"
    className="h-10 w-auto hover:opacity-80 transition-opacity"
  />
</NavLink>

            <div className="flex gap-4 items-center">
                
                {/* CARRITO */}
                <button
                    onClick={goToCart}
                    className="
                        relative px-4 py-2 
                        bg-[#161616] 
                        hover:bg-[#272727]
                        text-[#df4861] 
                        border border-[#df4861]/40 
                        rounded 
                        transition-colors 
                        font-bold text-sm uppercase tracking-wide
                    "
                >
                    <span className="flex items-center gap-2">
                        🛒 Carrito
                    </span>
                    <CartWidget />
                </button>

                {/* LOGIN / LOGOUT */}
                {isAuthenticated ? (
                    <button
                        onClick={logout}
                        className="
                            px-4 py-2 
                            bg-[#df4861] hover:bg-[#ffffff] 
                            text-white 
                            rounded 
                            font-bold text-sm uppercase 
                            transition-colors 
                            shadow-lg shadow-[#df4861]/20
                        "
                    >
                        Salir
                    </button>
                ) : (
                    <button
                        onClick={() => navigate("/login")}
                        className="
                            px-4 py-2 
                            bg-[#df4861] hover:bg-[#c43c54] 
                            text-white 
                            rounded 
                            font-bold text-sm uppercase 
                            transition-colors 
                            shadow-lg shadow-[#df4861]/20
                        "
                    >
                        Ingresar
                    </button>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
