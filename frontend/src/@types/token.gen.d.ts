export type Token =
  | "colors.primary.red"
  | "colors.primary.black"
  | "colors.secondary.blue"
  | "colors.secondary.green"
  | "fontSizes.h1"
  | "fontSizes.h2"
  | "fontSizes.h3"
  | "fontSizes.body"
  | "fonts.heading"
  | "fonts.body"
  | "fontWeights.extrathin"
  | "fontWeights.thin"
  | "fontWeights.normal"
  | "fontWeights.medium"
  | "fontWeights.bold"
  | "fontWeights.extrabold"
  | "colors.colorPalette.red"
  | "colors.colorPalette.black"
  | "colors.colorPalette.blue"
  | "colors.colorPalette.green"

export type ColorPalette = "primary" | "secondary"

export type ColorsToken =
  | "primary.red"
  | "primary.black"
  | "secondary.blue"
  | "secondary.green"
  | "colorPalette.red"
  | "colorPalette.black"
  | "colorPalette.blue"
  | "colorPalette.green"

export type FontSizesToken = "h1" | "h2" | "h3" | "body"

export type FontsToken = "heading" | "body"

export type FontWeightsToken = "extrathin" | "thin" | "normal" | "medium" | "bold" | "extrabold"

export type Tokens = {
  colors: ColorsToken
  fontSizes: FontSizesToken
  fonts: FontsToken
  fontWeights: FontWeightsToken
} & { [token: string]: never }
