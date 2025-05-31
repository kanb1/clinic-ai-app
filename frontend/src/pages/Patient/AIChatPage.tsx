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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useStartChatSession } from "@/hooks/patient/chatHooks/useStartChatSession";
import ChatBox from "@/components/patient/ChatBox";
import Layout from "@/components/layout/Layout";
import { useDisclosure } from "@chakra-ui/react";
import SaveChatModal from "@/components/patient/SaveChatModal";

const AIChatPage = () => {
  const toast = useToast();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { user: string; ai: string }[]
  >([]);
  const { mutate: sendChatMessage, isPending } = useStartChatSession();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    isOpen: isDialogOpen,
    onOpen: openDialog,
    onClose: closeDialog,
  } = useDisclosure();

  const cancelRef = useRef(null);

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

  useEffect(() => {
    // Hvis der ingen beskeder er, vis åbningsbeskeden fra AI - betaler ik for openAI-token
    if (chatHistory.length === 0) {
      const introMessage =
        "Hej! Hvordan har du det i dag? Del gerne dine symptomer eller bekymringer – så hjælper jeg dig med at forberede dig til din aftale.";

      setChatHistory([{ user: "", ai: introMessage }]);
    }
  }, []);

  const handleConfirmStartNewChat = () => {
    const introMessage =
      "Hej! Hvordan har du det i dag? Del gerne dine symptomer eller bekymringer – så hjælper jeg dig med at forberede dig til din aftale.";
    setChatHistory([{ user: "", ai: introMessage }]);
    setMessage("");
    closeDialog();
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

        <Button
          size="sm"
          variant="outline"
          colorScheme="blue"
          mb={4}
          onClick={openDialog}
        >
          Start ny chat
        </Button>

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
      <Button onClick={onOpen}>Gem samtale</Button>
      <SaveChatModal isOpen={isOpen} onClose={onClose} messages={chatHistory} />

      <AlertDialog
        isOpen={isDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeDialog}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Start ny chat?</AlertDialogHeader>
            <AlertDialogBody>
              Hvis du starter en ny chat, slettes den nuværende samtale
              (medmindre du har gemt den).
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeDialog}>
                Annullér
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleConfirmStartNewChat}
                ml={3}
              >
                Start ny chat
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Layout>
  );
};

export default AIChatPage;
