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
}

// Opretter selve konteksten
// starter undefined (ingen data) -> sikkerhedsting hvis jeg glemmer authprivider rundt om appen, får fejlbesked i stedet for app crasher
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// laver wrapperkomponent som placeres rundt om hele appen i main (gør user og token osv tilgængelig for resten af appen)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<IUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const navigate = useNavigate();

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
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setUserState(JSON.parse(savedUser));
      setTokenState(savedToken);
    }
  }, []);

  // når jeg logger ind og kalder setUser gemmes det både is tate og i localstorage, når logger ud fjernes det fra localstorage
  const setUser = (user: IUser | null) => {
    setUserState(user);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
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

  // FALLBACK - Så selv hvis localStorage fejler, kan vi genskabe user fra JWT
  // når siden refresher, kan React miste den aktuelle bruger i memory - eller være langsom
  // men jeg har stadig JWT-token i localStorage, så jeg kan bruge det til at hente brugeren
  // ekstra useEffect--> auto loader user og token fra backend (via token) efter et refresh
  // altså hvis user mangler, men token findes, henter vi brugerinfo fra serveren, så appen stadig virker efter refresh
  // vi kalder /api/auth/me for at få brugerinfo fra token og genskabe state
  //specielt brugt til hooks hvor den kræver user._id og hvor det kan være forsinket
  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    // Hvis vi har token, men ingen brugerinfo, så hent den
    if (savedToken && !user) {
      fetch("http://localhost:3001/api/auth/me", {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.user) {
            setUser(data.user);
            setToken(savedToken); // for at sætte det i memory også
          }
        })
        .catch((err) => {
          console.error("Kunne ikke hente brugerinfo:", err);
          logout(); // hvis token er ugyldig
        });
    }
  }, [user]);

  // returner hele konteksten til childrene
  // alt pakkes ind og gives videre som value
  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, logout }}>
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
