import { Box, VStack, Text } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

interface ChatMessage {
  user: string;
  ai: string;
}

interface ChatBoxProps {
  chatHistory: ChatMessage[];
}

// chathistory som prop -> liste af chatmessage fra parent: AIChatPage
const ChatBox = ({ chatHistory }: ChatBoxProps) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll til bunden når chatten opdateres
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <Box
      maxH={{ base: "60vh", md: "70vh" }}
      overflowY="auto"
      p={{ base: 3, md: 4 }}
      borderWidth="1px"
      borderRadius="lg"
      bg="white"
      boxShadow="sm"
    >
      {/* går igennem hver besked i chatHistory */}
      {chatHistory.map((msg, i) => (
        // vertial stak af elementer med spacing: bruger + ai-svar
        // i er hver telement i chatHistory
        <VStack key={i} spacing={3} align="stretch" mb={2}>
          {/* Brugerens spg */}
          <Box
            alignSelf="flex-end"
            bg="blue.50"
            p={3}
            borderRadius="lg"
            maxW="80%"
            boxShadow="xs"
          >
            <Text fontSize="xs" color="blue.700" fontWeight="semibold" mb={1}>
              Dig
            </Text>
            <Text fontSize="sm" lineHeight="1.5" color="gray.800">
              {msg.user}
            </Text>
          </Box>

          {/* AI's svar */}
          <Box
            alignSelf="flex-start"
            bg="gray.50"
            p={3}
            borderRadius="lg"
            maxW="80%"
            boxShadow="xs"
          >
            <Text fontSize="xs" color="gray.600" fontWeight="semibold" mb={1}>
              Klinika Assistent
            </Text>
            <Text
              fontSize="sm"
              lineHeight="1.6"
              color="gray.700"
              whiteSpace="pre-line"
            >
              {msg.ai}
            </Text>
          </Box>
        </VStack>
      ))}
      <div ref={bottomRef} />
    </Box>
  );
};

export default ChatBox;
