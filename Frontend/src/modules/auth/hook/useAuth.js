import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    context.setAuth({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  };

  return {
    auth: context.auth,
    setAuth: context.setAuth,
    isAuthenticated: context.auth.isAuthenticated,
    user: context.auth.user,
    token: context.auth.token,
    logout,
  };
};

export default useAuth;
