import { forwardRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Textarea, useStyleConfig } from "@chakra-ui/react";

// Automatisk resize textarea for bedre UI
// installeret react-txtarea-autorize
const AutoResizeTextarea = forwardRef((props: any, ref) => {
  const styles = useStyleConfig("Textarea", props);

  return (
    <Textarea
      as={TextareaAutosize}
      minRows={1}
      maxRows={6}
      resize="none"
      overflow="hidden"
      sx={styles}
      ref={ref}
      {...props}
    />
  );
});

export default AutoResizeTextarea;
