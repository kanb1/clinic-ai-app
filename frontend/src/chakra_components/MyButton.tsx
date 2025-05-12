"use client";

import {
  chakra,
  createSlotRecipeContext,
  type HTMLChakraProps,
  type RecipeVariantProps,
} from "@chakra-ui/react";
import { buttonRecipe } from "../theme/theme";

const { withProvider } = createSlotRecipeContext({
  recipe: buttonRecipe,
});

type ButtonVariantProps = RecipeVariantProps<typeof buttonRecipe>;

export interface MyButtonProps
  extends HTMLChakraProps<"button", ButtonVariantProps> {}

export const MyButton = withProvider<"button", MyButtonProps>(
  "button",
  "root" // this is my slot name
);
