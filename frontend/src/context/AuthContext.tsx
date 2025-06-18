import {
  createContext,
  useContext, //læse værdi i context
  useState,
  useEffect,
  ReactNode, //typen for {children}, wrapper Provider omkring
} from "react";
import { IUser } from "../types/user.types";
import { useNavigate } from "react-router-dom";

// holde styr på login status (bruger og token)
// gemme brugerdata i localstorage, så de tik nulstilles ved refresh
// give adgang til login, logout, setUser og setToken globalt i appen

// definerer hvad min authcontext skal indeholde:
interface AuthContextType {
  user: IUser | null;
  token: string | null;
  setUser: (user: IUser | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  //flag -> indikerer alt hentet
  // undgår flickering v. refresh --> (hivs user stadig er null)
  isAuthReady: boolean;
}

// Selve konteksten oprettet
// undefined --> sikrer at brug af hook useAuth()
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Wrapperkomponent rundt om children (i reactnode form)
// alle har adgang --> via useAuth()
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<IUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  // bliver først true -> når localstorage læst
  // undgår forkert visning før data klar
  const [isAuthReady, setIsAuthReady] = useState(false); //til fallback

  const navigate = useNavigate();

  //****** */ Sætte user efter hvert login ******
  //****** */ Sætte user efter hvert login ******
  //****** */ Sætte user efter hvert login ******
  // user -> parameter til funktionen
  // ^user bliver nemlig givet til setUser(...) i useLogin-hook > backend
  // efter login i useLogin hook: setUser(response.data.user)
  const setUser = (user: IUser | null) => {
    if (user) {
      if (!user._id && !user.id) {
        throw new Error("Bruger mangler både _id og id");
      }

      // normalizedUser --> laver nyt user-objekt
      // sikrer altid _id -> uanset _id/id
      // forskelle ift JWT payload eller API
      const normalizedUser: IUser = {
        ...user,
        _id: (user._id || user.id) as string,
      };

      // gemmer i state
      setUserState(normalizedUser);
      // gemmer i localstorage
      localStorage.setItem("user", JSON.stringify(normalizedUser));
    } else {
      setUserState(null);
      localStorage.removeItem("user");
    }
  };

  //****** */ Sæt token efter hvert login ******
  //****** */ Sæt token efter hvert login ******
  //****** */ Sæt token efter hvert login ******
  // token er allerede sat i useLogin efter login
  // vi henter det og sætter det i vores setToken her også
  // så man kan
  const setToken = (token: string | null) => {
    // gemmer token i memory
    setTokenState(token);

    // gemmer i browseren
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  };

  //****** */ Ryd alt ved logout ******
  //****** */ Ryd alt ved logout ******
  //****** */ Ryd alt ved logout ******
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  //****** Gendan brugerdata ved page refresh ******
  //****** Gendan brugerdata ved page refresh ******
  //****** Gendan brugerdata ved page refresh ******
  useEffect(() => {
    // forsøger hente tidligere gemte login-data ^^^^
    const storedUser = localStorage.getItem("user"); //string med user
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      // konverter fra string med user --> til js-objekt
      const parsed = JSON.parse(storedUser);

      // Normaliser: vi har altid _id -> om vi får _id/id fra repsons
      const normalizedUser = {
        ...parsed,
        _id: parsed._id || parsed.id,
      };

      // bruger setUserState og setTokenState her
      // gemmer de hetnede værdier i react state -> vi har allerede setUser og setToken
      setUserState(normalizedUser);
      setTokenState(storedToken);
    }

    setIsAuthReady(true);
  }, []);

  return (
    // returnerer authprovider med værdierne
    <AuthContext.Provider
      value={{ user, token, setUser, setToken, logout, isAuthReady }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// helper hook --> returnerer hele AuthContext ^:
// kan nemt kan tilgå context-data i komponenter:
// const { user, token, logout, setUser } = useAuth();
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
