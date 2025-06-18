import axios from "axios"; //http requests til min backend

// for at slippe for hele tiden at skrive http..//localhost:

// definerer min baseURL
const API_BASE_URL =
  // import.meta... -> Vite’s måde at læse env på
  // min localhost som fallback/lokal udvikling
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// opretter axios-instans med create -> sætter baseURL til ^
// = fx api.get("/users")  -> vil auto kalde http://localhost:3001/api/users
export const api = axios.create({
  baseURL: API_BASE_URL,
});

//Interceptor -> sætter automatisk Authorization header hvis token findes
// kører før hvert request
// Vigtigt fordi backend-API bruger JWT-baseret autentificering
api.interceptors.request.use((config) => {
  // henter token fra localst
  const token = localStorage.getItem("token");
  // Hvis token findes, tilføjes det til request-headeren (Aithroization headeren)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // returnerer request-objekt, så Axios kan sende det til serveren
  return config;

  // await api.get("/patients") behøver ik manuelt at sætte token, gøres automatisk
});
