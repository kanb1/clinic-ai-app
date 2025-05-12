export type Token =
  | "colors.primary.500"
  | "colors.primary.900"
  | "colors.secondary.500"
  | "colors.secondary.600"
  | "fontSizes.h1"
  | "fontSizes.h2"
  | "fontSizes.h3"
  | "fontSizes.body"
  | "fonts.heading"
  | "fonts.body"
  | "colors.colorPalette.500"
  | "colors.colorPalette.900"
  | "colors.colorPalette.600"

export type ColorPalette = "primary" | "secondary"

export type ColorsToken = "primary.500" | "primary.900" | "secondary.500" | "secondary.600" | "colorPalette.500" | "colorPalette.900" | "colorPalette.600"

export type FontSizesToken = "h1" | "h2" | "h3" | "body"

export type FontsToken = "heading" | "body"

export type Tokens = {
  colors: ColorsToken
  fontSizes: FontSizesToken
  fonts: FontsToken
} & { [token: string]: never }
