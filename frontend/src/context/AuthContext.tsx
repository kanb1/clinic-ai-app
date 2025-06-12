import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { IUser } from "../types/user.types";
import { useNavigate } from "react-router-dom";

// holde styr på login status (bruger og token)
// gemme brugerdata i localstorage, så de tik nulstilles ved refresh
// give adgang til login, logout, setUser og setToken globalt i appen

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  setUser: (user: IUser | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<IUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false); //til fallback
  const navigate = useNavigate();

  const setUser = (user: IUser | null) => {
    if (user) {
      if (!user._id && !user.id) {
        throw new Error("Bruger mangler både _id og id");
      }
      const normalizedUser: IUser = {
        ...user,
        _id: (user._id || user.id) as string,
      };
      setUserState(normalizedUser);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
    } else {
      setUserState(null);
      localStorage.removeItem("user");
    }
  };

  const setToken = (token: string | null) => {
    setTokenState(token);

    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      const parsed = JSON.parse(storedUser);

      // Normaliser: hvis _id mangler, brug id i stedet
      const normalizedUser = {
        ...parsed,
        _id: parsed._id || parsed.id,
      };

      setUserState(normalizedUser);
      setTokenState(storedToken);
    }

    setIsAuthReady(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, setUser, setToken, logout, isAuthReady }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// helper hook, så jeg nemt kan skrive const {user = useAuth} i mine komponenter

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
