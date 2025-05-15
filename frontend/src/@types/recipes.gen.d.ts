import type { RecipeDefinition, SlotRecipeDefinition, SystemRecipeFn, SystemSlotRecipeFn } from "../recipe.types"
import type { ConditionalValue } from "../css.types"

export interface ButtonVariant {
  theme?: "solidRed" | "solidGreen" | "outlineWhite" | "solidBlack"
}

export type ButtonVariantProps = {
  [K in keyof ButtonVariant]?: ConditionalValue<ButtonVariant[K]> | undefined
}

export type ButtonVariantMap = {
  [K in keyof ButtonVariant]: Array<ButtonVariant[K]>
}

export interface ConfigRecipes {
  Button: SystemRecipeFn<ButtonVariantProps, ButtonVariantMap>
}

export interface ConfigSlotRecipes {
  [key: string]: SystemSlotRecipeFn<string, any>
}

export interface ConfigRecipeSlots {
  [key: string]: string
}

export type SlotRecipeRecord<T, K> = T extends keyof ConfigRecipeSlots ? Record<ConfigRecipeSlots[T], K> : Record<string, K>

export type SlotRecipeProps<T> = T extends keyof ConfigSlotRecipes
  ? ConfigSlotRecipes[T]["__type"] & { recipe?: SlotRecipeDefinition }
  : { recipe?: SlotRecipeDefinition }

export type RecipeProps<T> = T extends keyof ConfigRecipes ? ConfigRecipes[T]["__type"] & { recipe?: RecipeDefinition } : { recipe?: RecipeDefinition }
