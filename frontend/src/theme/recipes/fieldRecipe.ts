import { defineSlotRecipe } from "@chakra-ui/react";

export const fieldRecipe = defineSlotRecipe({
  className: "field",
  slots: ["root", "label", "input"],
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
      padding: "0.8rem",
    },
    label: {
      fontFamily: "body",
      fontWeight: "medium",
      fontSize: "body",
      color: "gray.700",
    },
    input: {
      borderRadius: "5px",
      border: "2px solid",
      borderColor: "gray",
      padding: "0.75rem",
    },
  },
} as const);

export default fieldRecipe;
