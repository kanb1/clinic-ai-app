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

// definerer præcis hvad useAuth giver adgang til
// user og token (useState)
// setUser og setToken funktioner til at opdatere
// logout rydder alt og logger ud
interface AuthContextType {
  user: IUser | null;
  token: string | null;
  setUser: (user: IUser | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthReady: boolean;
}

// Opretter selve konteksten
// starter undefined (ingen data) -> sikkerhedsting hvis jeg glemmer authprivider rundt om appen, får fejlbesked i stedet for app crasher
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// laver wrapperkomponent som placeres rundt om hele appen i main (gør user og token osv tilgængelig for resten af appen)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<IUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false); //til fallback
  const navigate = useNavigate();

  // når jeg logger ind og kalder setUser gemmes det både is tate og i localstorage, når logger ud fjernes det fra localstorage
  const setUser = (user: IUser | null) => {
    if (user) {
      if (!user._id && !user.id) {
        throw new Error("Bruger mangler både _id og id");
      }

      // mongo bruger som standard feltet _id som den unikke identifikator for dokumenter
      // men! i min logincontroller måtte jeg returnere brugeren ved at angive id:user._id (backend sender id og ik _id) - ellers ville det give serialization- eller typefejl i frontend (skal bruge toString() hver gang) - da mongodb er det et objectId og ik bare en streng
      // frontend modtager altså user.id (ikke user._id)
      // når jeg gemmer brugeren i localStorage, så er det id, jeg gemmer –> men resten af appen forventer _id.
      // -> derfor normaliserer jeg det
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

  // samme som ovenfor men for jwt
  // wrapper omkring reacts usestate
  const setToken = (token: string | null) => {
    //opdaterer reacts state
    // Så hele min app (hvis den bruger useAuth()) opdager, at token er ændret.
    setTokenState(token);
    // sørger for at gemme eller rydde token i browserens storage så jeg stadig er logget ind efter refresh
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  };

  // nulstiller user og token og fjerner dem fra localstroage
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  // når jeg refresher, henter useEffect "user" og "token" tilbage
  // Så snart en komponent loader -> Henter user og token fra localstorage hvis de findes
  // Init: Genskab bruger og token fra localStorage eller fra backend via token
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

  // returner hele konteksten til childrene
  // alt pakkes ind og gives videre som value
  return (
    <AuthContext.Provider
      value={{ user, token, setUser, setToken, logout, isAuthReady }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// helper hook, så jeg nemt kan skrive const {user = useAuth} i mine komponenter
// hvis jeg glemmer at bruge authprovider rundt om app så får jeg en fejlbesked
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
