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
