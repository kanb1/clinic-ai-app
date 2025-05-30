import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  breakpoints: {
    base: "0px",
    sm: "480px",
    md: "768px",
    lg: "992px",
    xl: "1280px",
    "2xl": "1536px",
  },

  colors: {
    primary: {
      red: "#B20D1C",
      black: "#000000",
    },
    secondary: {
      blue: "#0006b8",
      green: "#1c5e3a",
    },
  },

  fonts: {
    heading: "'Poppins', sans-serif",
    body: "'Inter', sans-serif",
  },

  fontWeights: {
    extrathin: 100,
    thin: 200,
    normal: 400,
    medium: 500,
    bold: 700,
    extrabold: 800,
  },

  components: {
    Heading: {
      baseStyle: {
        fontFamily: "'Poppins', sans-serif",
        lineHeight: "120%",
      },
      sizes: {
        heading1: {
          fontSize: {
            base: "30px",
            sm: "36px",
            md: "48px",
            lg: "48px",
            xl: "50px",
          },
          fontWeight: "bold",
        },
        heading2: {
          fontSize: {
            base: "24px",
            sm: "28px",
            md: "38px",
            lg: "40px",
            xl: "40px",
          },
          fontWeight: "medium",
        },
        heading3: {
          fontSize: {
            base: "22px",
            sm: "26px",
            md: "32px",
            lg: "32px",
            xl: "32px",
          },
          fontWeight: "thin",
          fontStyle: "italic",
        },
      },
    },

    Text: {
      baseStyle: {
        fontFamily: "'Inter', sans-serif",
        lineHeight: "160%",
      },
      sizes: {
        body: {
          fontSize: {
            base: "16px",
            sm: "18px",
            md: "16px",
            lg: "16px",
            xl: "16px",
          },
          fontWeight: "normal",
        },
      },
    },

    Button: {
      baseStyle: {
        borderRadius: "full",
        fontFamily: "'Poppins', sans-serif",
        px: 4,
        py: 7,
      },
      variants: {
        solidRed: {
          bg: "#B20D1C",
          color: "white",
          fontWeight: "600",
          minWidth: "10rem",
          maxWidth: "20rem",
          borderRadius: "2rem",
          fontSize: "1rem",
          _hover: { bg: "#9e0b18" },
        },
        solidGreen: {
          bg: "#1c5e3a",
          color: "white",
          fontWeight: "600",
          minWidth: "10rem",
          maxWidth: "20rem",
          borderRadius: "2rem",
          fontSize: "1rem",
          _hover: { bg: "#14552e" },
        },
        outlineWhite: {
          bg: "white",
          color: "black",
          fontWeight: "600",
          minWidth: "10rem",
          maxWidth: "20rem",
          borderRadius: "2rem",
          fontSize: "1rem",
          border: "2px solid black",
          _hover: { bg: "gray.100" },
        },
        solidBlack: {
          bg: "black",
          color: "white",
          fontWeight: "600",
          minWidth: "10rem",
          w: "13rem",
          maxWidth: "20rem",
          borderRadius: "2rem",
          fontSize: "1rem",
          _hover: { bg: "#1a1a1a" },
        },
      },
    },
  },
});

export default theme;
