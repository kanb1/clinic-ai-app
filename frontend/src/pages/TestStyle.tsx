import { VStack, Heading, Text, Button } from "@chakra-ui/react";

const TestStyle = () => {
  return (
    <VStack gap={6} p={10}>
      <Heading textStyle="heading1">Heading 1</Heading>

      <Heading textStyle="heading2" fontWeight="medium">
        Heading 2
      </Heading>

      <Heading textStyle="heading3" fontWeight="thin" fontStyle="italic">
        Heading 3
      </Heading>

      <Text textStyle="body">This is body text</Text>

      <Text color="primary.red">Primary-red</Text>
      <Text color="primary.black">Primary-black</Text>
      <Text color="secondary.blue">Secondary-blue</Text>
      <Text color="secondary.green">Secondary-green</Text>

      <Button variant="solidRed">Aflys</Button>
      <Button variant="solidGreen">Bekræft</Button>
      <Button variant="outlineWhite">Læs mere</Button>
      <Button variant="solidBlack">Send</Button>
    </VStack>
  );
};

export default TestStyle;
