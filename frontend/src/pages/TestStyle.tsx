import { VStack, Heading, Text, Button } from "@chakra-ui/react";

const TestStyle = () => {
  return (
    <VStack gap={6} p={10}>
      <Heading size="heading1">Heading 1</Heading>
      <Heading size="heading2">Heading 2</Heading>
      <Heading size="heading3">Heading 3</Heading>

      <Text size="body">Dette er brødtekst</Text>

      <Text size="body" color="primary.red">
        Primary-red
      </Text>
      <Text size="body" color="primary.black">
        Primary-black
      </Text>
      <Text size="body" color="secondary.blue">
        Secondary-blue
      </Text>
      <Text size="body" color="secondary.green">
        Secondary-green
      </Text>

      <Button variant="solidRed">Aflys</Button>
      <Button variant="solidGreen">Bekræft</Button>
      <Button variant="outlineWhite">Læs mere</Button>
      <Button variant="solidBlack">Send</Button>
    </VStack>
  );
};

export default TestStyle;
