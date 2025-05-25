// globalStyles blev aldrig konfigureret rigtigt i min theme.ts
// Her bruger chakra etCSS-ssytem kaldet emotion til at sætte styles i stedet for
// import {global} from emotion: Sæt mine styles ind i head på dokumentet med det samme — som globale styles -> Bliver sendt direkte til browseren hvor devtools viste en manuel margin: 8
import { Global } from "@emotion/react";

// Det bliver loaded først, og det overskriver browserens "user agent stylesheet" - standard
const GlobalStyles = () => (
  <Global
    styles={{
      html: {
        height: "100%",
        width: "100%",
        margin: 0,
        padding: 0,
        overflowX: "hidden",
      },
      body: {
        height: "100%",
        width: "100%",
        margin: 0,
        padding: 0,
        overflowX: "hidden",
      },
      "#root": {
        height: "100%",
        minHeight: "100vh",
        width: "100%",
      },
    }}
  />
);

export default GlobalStyles;
