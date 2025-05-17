import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Tilføjer token til alle requests, så det ik behøves at gøres manuelt hver gang
// api.interceptors.request.use: Hver gang jeg sender en request via min api-instans (Axios), skal du lige gøre noget først (en slags mellemstatus)
api.interceptors.request.use((config) => {
  //  tjekker om der ligger en JWT token gemt i localStorage fra tidligere login
  const token = localStorage.getItem("token");
  // hvis token: tilføjer en header med tokenet, så backend kan verificere brugeren
  if (token) {
    // Bearer: Fortæller HTTP Authorization header vi bruger JWT token
    config.headers.Authorization = `Bearer ${token}`;
  }
  // returnerer så request objektet så axios kan sende det videre som normalt
  return config;
});
