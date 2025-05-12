import type { SlotRecipeVariantRecord } from "@chakra-ui/react";

declare module "@chakra-ui/react" {
  export interface Recipes {
    Button: SlotRecipeVariantRecord<"root">;
  }
}
