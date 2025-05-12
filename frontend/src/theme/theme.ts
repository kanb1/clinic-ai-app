import {
  createSystem,
  defaultBaseConfig,
  defineConfig,
  defineSlotRecipe,
} from "@chakra-ui/react";

// defienSlotRecipe -> bruges til at lave komponentvarianter med slots, fx Button

export const buttonRecipe = defineSlotRecipe({
  className: "button",
  // slots -> en del af en komponent som kan styles indiivduelt, fx har Button et ikon og en label og selve knappen (root)
  slots: ["root"],
  base: {
    root: {
      fontWeight: "bold",
      borderRadius: "full",
      fontFamily: "'Inter', sans-serif",
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
          _hover: {
            bg: "#9e0b18",
          },
        },
      },
      solidGreen: {
        root: {
          bg: "#1c5e3a",
          color: "white",
          _hover: {
            bg: "#14552e",
          },
        },
      },
      outlineWhite: {
        root: {
          bg: "white",
          color: "black",
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
          500: { value: "#B20D1C" },
          900: { value: "#000000" },
        },
        secondary: {
          500: { value: "#0006b8" },
          600: { value: "#1c5e3a" },
        },
      },
      fontSizes: {
        h1: { value: "48px" },
        h2: { value: "40px" },
        h3: { value: "33px" },
        body: { value: "16px" },
      },
      fonts: {
        heading: { value: "'Poppins', sans-serif" },
        body: { value: "'Inter', sans-serif" },
      },
    },
    recipes: {
      Button: buttonRecipe, //kombinerer med mine knap-varianter
    },
  },
});

// createsystem -> kombinerer min config emd grundlæggende chak system
// defautlBaseConfig -> udgangspunkt for chakra v3s nye theme arkitektur
export const system = createSystem(defaultBaseConfig, customConfig);
