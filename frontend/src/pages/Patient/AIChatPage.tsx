import {
  Box,
  Heading,
  VStack,
  Input,
  Button,
  useToast,
  Text,
  Spinner,
  HStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useStartChatSession } from "@/hooks/patient/chatHooks/useStartChatSession";
import ChatBox from "@/components/patient/ChatBox";
import Layout from "@/components/layout/Layout";

const AIChatPage = () => {
  const toast = useToast();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { user: string; ai: string }[]
  >([]);
  const { mutate: sendChatMessage, isPending } = useStartChatSession();

  const handleSubmit = () => {
    if (!message.trim()) return;

    const userMessage = message.trim();

    sendChatMessage(
      { message: userMessage },
      {
        onSuccess: (data) => {
          setChatHistory((prev) => [
            ...prev,
            { user: userMessage, ai: data.reply },
          ]);
          setMessage("");
        },
        onError: () => {
          toast({
            title: "Fejl",
            description: "Noget gik galt med at sende beskeden.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        },
      }
    );
  };

  return (
    <Layout>
      <Box
        position="relative"
        h="100vh"
        bg="gray.50"
        p={4}
        pt={6}
        display="flex"
        flexDirection="column"
      >
        <Heading size="md" mb={4}>
          Chat med AI
        </Heading>

        {/* Chat-indhold */}
        <Box flex="1" overflowY="auto">
          <ChatBox chatHistory={chatHistory} />

          {/* Loading-indikator for AI */}
          {isPending && (
            <HStack mt={3} pl={4}>
              <Spinner size="sm" color="blue.500" />
              <Text fontSize="sm" color="gray.500">
                AI skriver...
              </Text>
            </HStack>
          )}
        </Box>

        {/* Sticky input i bunden */}
        <Box
          mt={4}
          pt={2}
          borderTop="1px solid"
          borderColor="gray.200"
          position="sticky"
          bottom="0"
          bg="gray.50"
        >
          <VStack spacing={2}>
            <Input
              placeholder="Skriv din besked..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              isDisabled={isPending}
            />
            <Button
              onClick={handleSubmit}
              isLoading={isPending}
              colorScheme="blue"
              w="full"
            >
              Send
            </Button>
          </VStack>
        </Box>
      </Box>
    </Layout>
  );
};

export default AIChatPage;
