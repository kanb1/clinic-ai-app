import { StrictMode } from "react"; //bedre fejl-rapportering
import { createRoot } from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import App from "./App.tsx";
import theme from "../src/theme/theme";
import "@fontsource/poppins/100.css"; // extra thin
import "@fontsource/poppins/200.css"; // thin
import "@fontsource/poppins/400.css"; // regular
import "@fontsource/poppins/500.css"; // medium
import "@fontsource/poppins/700.css"; // bold
import "@fontsource/poppins/800.css"; // extrabold
import "@fontsource/inter/400.css"; // normal
import "@fontsource/inter/600.css"; // semi-bold
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import GlobalStyles from "./theme/GlobalStyles.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* tanstack query */}
    <QueryClientProvider client={queryClient}>
      {/* routing */}
      <BrowserRouter>
        {/* designsystem */}
        <ChakraProvider theme={theme}>
          <GlobalStyles />
          {/* global login state */}
          <AuthProvider>
            <App />
          </AuthProvider>
        </ChakraProvider>
      </BrowserRouter>
      {/* react query developer tools */}
      <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>
  </StrictMode>
);
