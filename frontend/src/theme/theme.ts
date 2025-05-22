import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  breakpoints: {
    base: "0em",
    sm: "30em", // 480px
    md: "48em", // 768px
    lg: "62em", // 992px
    xl: "80em", // 1280px
    "2xl": "96em", // 1536px
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
  textStyles: {
    heading1: {
      fontSize: { base: "24px", md: "36px", lg: "48px" },
      fontWeight: "bold",
      lineHeight: "120%",
      fontFamily: "heading",
    },
    heading2: {
      fontSize: { base: "20px", md: "30px", lg: "40px" },
      fontWeight: "bold",
      lineHeight: "120%",
      fontFamily: "heading",
    },
    heading3: {
      fontSize: { base: "18px", md: "24px", lg: "32px" },
      fontWeight: "medium",
      lineHeight: "120%",
      fontFamily: "heading",
    },
    body: {
      fontSize: { base: "16px", md: "18px", lg: "20px" },
      fontWeight: "normal",
      lineHeight: "160%",
      fontFamily: "body",
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "full",
        fontFamily: "'Poppins', sans-serif",
        px: 6,
        py: 3,
      },
      variants: {
        solidRed: {
          bg: "#B20D1C",
          color: "white",
          padding: "2rem 2rem",
          fontWeight: "600",
          minWidth: "10rem",
          borderRadius: "2rem",
          fontSize: "1rem",
          _hover: { bg: "#9e0b18" },
        },
        solidGreen: {
          bg: "#1c5e3a",
          color: "white",
          padding: "2rem 2rem",
          fontWeight: "600",
          minWidth: "10rem",
          borderRadius: "2rem",
          fontSize: "1rem",
          _hover: { bg: "#14552e" },
        },
        outlineWhite: {
          bg: "white",
          color: "black",
          padding: "2rem 2rem",
          fontWeight: "600",
          minWidth: "10rem",
          borderRadius: "2rem",
          fontSize: "1rem",
          border: "2px solid black",
          _hover: { bg: "gray.100" },
        },
        solidBlack: {
          bg: "black",
          color: "white",
          padding: "2rem 2rem",
          fontWeight: "600",
          minWidth: "10rem",
          borderRadius: "2rem",
          fontSize: "1rem",
          _hover: { bg: "#1a1a1a" },
        },
      },
    },
  },
});

export default theme;
