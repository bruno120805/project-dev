"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, UserAuth } from "../types/types";

// Definir el tipo para el contexto de autenticación
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  isLoading: boolean; // Estado de carga para manejar la experiencia del usuario
};

// Crear el contexto con un valor inicial undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Componente proveedor de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Estado de carga

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    const fetchUser = async () => {
      setIsLoading(true);
      try {
        let res;

        if (storedToken) {
          // Fetch usando JWT
          res = await fetch(`${API_URL}/auth/user`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
            credentials: "include",
          });
        } else {
          res = await fetch(`${API_URL}/auth/me`, {
            method: "GET",
            credentials: "include",
          });
        }

        if (!res.ok) {
          setUser(null);
          return;
        }

        const { data } = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Error al obtener usuario:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
