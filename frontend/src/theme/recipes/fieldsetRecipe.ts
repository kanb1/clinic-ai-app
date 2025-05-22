import { defineSlotRecipe } from "@chakra-ui/react";

export const fieldsetRecipe = defineSlotRecipe({
  className: "fieldset",
  slots: ["root", "content"],
  base: {
    root: {
      border: "none",
      backgroundColor: "rgb(240,240,240)",
      boxShadow: "1px 8px 2px 1px rgb(300,250,248)",
      borderRadius: "30px",
      paddingX: "3.5rem",
      paddingY: "1.8rem",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      margin: "0 auto", // Centrerer horisontalt
      width: "100%",
      w: "full", // fylder parent-container
    },

    content: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      width: "100%", // sikrer at children fylder containeren
    },
  },
} as const);
