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
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      margin: "0 auto", // Centrerer horisontalt
      width: "100%",
      maxWidth: "380px",
    },

    content: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    },
  },
} as const);
