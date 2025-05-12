import { VStack, Heading, Text } from "@chakra-ui/react";
import { MyButton } from "../chakra_components/MyButton";

const TestStyle = () => {
  return (
    <VStack gap={6} p={10}>
      <Heading fontSize="h1">Heading 1</Heading>
      <Heading fontSize="h2">Heading 2</Heading>
      <Heading fontSize="h3">Heading 3</Heading>
      <Text fontSize="body">This is body text</Text>

      <MyButton theme="solidRed">Red Button</MyButton>
      <MyButton theme="solidGreen">Green Button</MyButton>
      <MyButton theme="outlineWhite">White Outline Button</MyButton>
      <MyButton theme="solidBlack">Black Button</MyButton>
    </VStack>
  );
};

export default TestStyle;
