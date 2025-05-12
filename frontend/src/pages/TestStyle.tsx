import { VStack, Heading, Text } from "@chakra-ui/react";
import { MyButton } from "../chakra_components/MyButton";

const TestStyle = () => {
  return (
    <VStack gap={6} p={10}>
      <Heading fontSize="h1" fontWeight="extrabold" fontFamily="heading">
        Heading 1
      </Heading>
      <Heading fontSize="h2" fontWeight="medium" fontFamily="heading">
        Heading 2
      </Heading>
      <Heading
        fontSize="h3"
        fontWeight="thin"
        fontFamily="heading"
        fontStyle="italic"
      >
        Heading 3
      </Heading>
      <Text fontSize="body" fontWeight="normal" fontFamily="body">
        This is body text
      </Text>
      <Text color="primary.red">Primary-red</Text>
      <Text color="primary.black">Primary-black</Text>
      <Text color="secondary.blue">Secondary-blue</Text>
      <Text color="secondary.green">Secondary-green</Text>

      <MyButton theme="solidRed">Aflys</MyButton>
      <MyButton theme="solidGreen">Bekræft</MyButton>
      <MyButton theme="outlineWhite">Læs mere</MyButton>
      <MyButton theme="solidBlack">Send</MyButton>
    </VStack>
  );
};

export default TestStyle;
