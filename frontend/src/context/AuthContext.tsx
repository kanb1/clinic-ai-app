import { createContext, useContext, useState, ReactNode } from "react";
import { IUser } from "../types/user.types"; // Tilpas denne import til din user-type

type AuthContextType = {
  user: IUser | null;
  token: string | null;
  setUser: (user: IUser | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook til at bruge context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
