import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        setIsAuthenticated(true);

        const userData = await authService.getUserData();

        if (userData) {
          setUser(userData);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (cpf, senha) => {
    const result = await authService.login(cpf, senha);

    if (result.success) {
      setIsAuthenticated(true);

      const userData = await authService.getUserData();

      if (userData) {
        setUser(userData);
      }

      navigate("/home");
    }

    return result;
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login");
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    isTokenExpiringSoon: authService.isTokenExpiringSoon,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
