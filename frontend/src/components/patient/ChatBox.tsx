import { Box, VStack, Text } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

interface ChatMessage {
  user: string;
  ai: string;
}

interface ChatBoxProps {
  chatHistory: ChatMessage[];
}

const ChatBox = ({ chatHistory }: ChatBoxProps) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll til bunden når chatten opdateres
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <Box
      maxH="60vh"
      overflowY="auto"
      p={4}
      borderWidth="1px"
      borderRadius="md"
      bg="white"
    >
      {chatHistory.map((msg, i) => (
        <VStack key={i} spacing={3} align="stretch" mb={2}>
          {/* Brugerens spg */}
          <Box
            alignSelf="flex-end"
            bg="blue.100"
            p={3}
            borderRadius="lg"
            maxW="70%"
          >
            <Text fontSize="sm" color="gray.600">
              Du
            </Text>
            <Text>{msg.user}</Text>
          </Box>

          {/* AI's svar */}
          <Box
            alignSelf="flex-start"
            bg="gray.100"
            p={3}
            borderRadius="lg"
            maxW="70%"
          >
            <Text fontSize="sm" color="gray.600">
              AI
            </Text>
            <Text whiteSpace="pre-line">{msg.ai}</Text>
          </Box>
        </VStack>
      ))}
      <div ref={bottomRef} />
    </Box>
  );
};

export default ChatBox;
