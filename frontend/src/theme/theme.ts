import {
  createSystem,
  defaultBaseConfig,
  defineConfig,
  defineSlotRecipe,
} from "@chakra-ui/react";

// baseconfig -> runtime logic - mens mine tokens er mine designværdier, så er baseConfig min hovedlogik ift hvad er hvad
// fx md betyder 30em og mine tokens er min opsætning
const baseConfig = {
  ...defaultBaseConfig,
  theme: {
    ...defaultBaseConfig.theme,
    // runtime responsiveness
    breakpoints: {
      base: "0em",
      sm: "30em",
      md: "48em",
      lg: "62em",
      xl: "80em",
      "2xl": "96em",
    },
  },
};

// defienSlotRecipe -> bruges til at lave komponentvarianter med slots, fx Button
export const buttonRecipe = defineSlotRecipe({
  className: "button",
  // slots -> en del af en komponent som kan styles indiivduelt, fx har Button et ikon og en label og selve knappen (root)
  slots: ["root"],
  base: {
    root: {
      borderRadius: "full",
      fontFamily: "'Poppins', sans-serif",
      px: "6",
      py: "3",
    },
  },
  variants: {
    theme: {
      solidRed: {
        root: {
          bg: "#B20D1C",
          color: "white",
          padding: "1rem 2rem",
          fontWeight: "500",
          minWidth: "10rem",
          borderRadius: "2rem",
          fontSize: "0.9rem",
          border: "none",
          _hover: {
            bg: "#9e0b18",
          },
        },
      },
      solidGreen: {
        root: {
          bg: "#1c5e3a",
          color: "white",
          padding: "1rem 2rem",
          fontWeight: "500",
          minWidth: "10rem",
          borderRadius: "2rem",
          fontSize: "0.9rem",
          border: "none",
          _hover: {
            bg: "#14552e",
          },
        },
      },
      outlineWhite: {
        root: {
          bg: "white",
          color: "black",
          padding: "1rem 2rem",
          fontWeight: "500",
          minWidth: "10rem",
          borderRadius: "2rem",
          fontSize: "0.9rem",
          border: "2px solid black",
          _hover: {
            bg: "gray.100",
          },
        },
      },
      solidBlack: {
        root: {
          bg: "black",
          color: "white",
          padding: "1rem 2rem",
          fontWeight: "500",
          minWidth: "10rem",
          borderRadius: "2rem",
          fontSize: "0.9rem",
          border: "none",

          _hover: {
            bg: "#1a1a1a",
          },
        },
      },
    },
  },
});

// defineConfig -> definerer min customized theme config
// samler det hele i min customConfig og laver ssytemet
export const customConfig = defineConfig({
  theme: {
    // token -> definerer mine design tokens, som jeg akn referere til overalt i komponenterne
    // fx fontSize="h1" -> chakra ved det 48px
    tokens: {
      colors: {
        primary: {
          red: { value: "#B20D1C" },
          black: { value: "#000000" },
        },
        secondary: {
          blue: { value: "#0006b8" },
          green: { value: "#1c5e3a" },
        },
      },

      fonts: {
        heading: { value: "'Poppins', sans-serif" },
        body: { value: "'Inter', sans-serif" },
      },
      fontWeights: {
        extrathin: { value: "100" },
        thin: { value: "200" },
        normal: { value: "400" },
        medium: { value: "500" },
        bold: { value: "700" },
        extrabold: { value: "800" },
      },
    },
    textStyles: {
      heading1: {
        description: "Responsiv heading 1",
        value: {
          fontSize: {
            base: "24px",
            md: "36px",
            lg: "48px",
          },
          fontWeight: "bold",
          lineHeight: "120%",
          fontFamily: "heading",
        },
      },
      heading2: {
        description: "Responsiv heading 2",
        value: {
          fontSize: {
            base: "20px",
            md: "30px",
            lg: "40px",
          },
          fontWeight: "bold",
          lineHeight: "120%",
          fontFamily: "heading",
        },
      },
      heading3: {
        description: "Responsiv heading 3",
        value: {
          fontSize: {
            base: "18px",
            md: "24px",
            lg: "32px",
          },
          fontWeight: "medium",
          lineHeight: "120%",
          fontFamily: "heading",
        },
      },
      body: {
        description: "Responsiv body text",
        value: {
          fontSize: {
            base: "14px",
            md: "16px",
            lg: "18px",
          },
          fontWeight: "normal",
          lineHeight: "160%",
          fontFamily: "body",
        },
      },
    },
    recipes: {
      Button: buttonRecipe, //kombinerer med mine knap-varianter
    },
  },
});

// createsystem -> kombinerer min config emd grundlæggende chak system
// defautlBaseConfig -> udgangspunkt for chakra v3s nye theme arkitektur
export const system = createSystem(baseConfig, customConfig);
