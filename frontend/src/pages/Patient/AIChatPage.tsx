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
  Flex,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useStartChatSession } from "@/hooks/patient/chatHooks/useStartChatSession";
import ChatBox from "@/components/patient/Chatbot/ChatBox";
import Layout from "@/components/layout/Layout";
import { useDisclosure } from "@chakra-ui/react";
import SaveChatModal from "@/components/patient/Chatbot/SaveChatModal";
import AutoResizeTextarea from "@/components/patient/Chatbot/AutoResizeTextarea";
import TypingDots from "@/components/patient/Chatbot/TypingDots";

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
    // Det forhindrer både tomme beskeder og beskeder med kun mellemrum.
    // forhidnrer spam/fejl i input
    const trimmedMessage = message.trim();

    // andre valideringsregler
    if (!trimmedMessage) {
      toast({
        title: "Besked mangler",
        description: "Du skal skrive noget før du sender.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (trimmedMessage.length < 5) {
      toast({
        title: "Beskeden er for kort",
        description: "Beskeden skal være mindst 5 tegn.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const wordCount = trimmedMessage.split(/\s+/).length;
    if (wordCount > 100) {
      toast({
        title: "For mange ord",
        description: "Beskeden må maksimalt være 100 ord.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const userMessage = message.trim();

    sendChatMessage(
      // payload -> objekt der sendes med post
      { message: userMessage },
      {
        // data er serverens JSON-svar (reply)
        onSuccess: (data) => {
          setChatHistory((prev) => [
            ...prev,
            // tilføjer et nyt element til chatHistory
            // består af user: besked brugeren skrive, og aisvar
            { user: userMessage, ai: data.reply },
          ]);
          // ryd inputfeltet efter
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

      // user er "" -> ingen brugermeddelelser -> kun ai taler
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
        minH="100vh"
        p={{ base: 1, md: 6 }}
        pt={{ base: 1, md: 6 }}
        display="flex"
        flexDirection="column"
        maxW="container.md"
        mx="auto"
      >
        <Flex align="center" mb={4} wrap="wrap" flexDirection="column">
          <Heading size="heading1" mb={4} textAlign={"center"}>
            Snak med vores AI assistent
          </Heading>

          <Text textAlign={"center"} size={"body"}>
            Klinika assistenten vil forberede både dig og lægen inden
            konsultationen.
          </Text>

          <SaveChatModal
            isOpen={isOpen}
            onClose={onClose}
            messages={chatHistory}
          />
        </Flex>

        {/* Chat-indhold */}
        <Box
          flex="1"
          overflowY="auto"
          bg="white"
          borderRadius="md"
          p={{ base: 3, md: 4 }}
          boxShadow="sm"
          mb={4}
        >
          {" "}
          <ChatBox chatHistory={chatHistory} />
          {/* Skrivende AI */}
          {isPending && (
            <HStack mt={3} pl={4}>
              <TypingDots />
            </HStack>
          )}
        </Box>

        {/* input i bunden */}
        <Box
          position="sticky"
          bottom="0"
          bg="white"
          px={{ base: 3, md: 6 }}
          py={4}
          borderTop="1px solid"
          borderColor="gray.200"
          zIndex={2}
          boxShadow="sm"
        >
          <Flex direction="column" gap={3}>
            {/* <Input
              placeholder="Skriv din besked..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              isDisabled={isPending}
            /> */}
            <AutoResizeTextarea
              placeholder="Skriv din besked..."
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const text = e.target.value;
                // max-grænse på 100 ord
                const wordCount = text.trim().split(/\s+/).length;
                if (wordCount <= 100) {
                  setMessage(text);
                }
              }}
              isDisabled={isPending}
              fontSize="sm"
              bg="white"
              borderColor="gray.300"
              focusBorderColor="blue.400"
            />
            <Button
              onClick={handleSubmit}
              isLoading={isPending}
              bg="blue.600"
              color="white"
              _hover={{ bg: "blue.700" }}
              fontWeight="medium"
              fontSize="sm"
              py={2}
              px={4}
              rounded="2xl"
              w="full"
            >
              Send besked
            </Button>
            <Button
              variant="outline"
              borderColor="blue.600"
              color="blue.700"
              _hover={{ bg: "blue.50" }}
              fontWeight="medium"
              fontSize="sm"
              py={2}
              px={4}
              rounded="2xl"
              w="full"
              onClick={openDialog}
            >
              Start ny samtale
            </Button>
          </Flex>
        </Box>

        {/* Del samtale sektion */}
        <Box
          bg="gray.50"
          rounded="xl"
          p={{ base: 5, md: 6 }}
          mt={{ base: 6 }}
          w="full"
          boxShadow="sm"
        >
          {" "}
          <Text textAlign={"center"} size={"body"}>
            Vil du dele denne samtale med din læge?
          </Text>
          <Flex justify="center" mt={{ base: 3, sm: 1 }}>
            <Button
              mt={{ base: 3 }}
              backgroundColor="primary.red"
              color="white"
              _hover={{ bg: "red.600" }}
              fontSize="sm"
              fontWeight="medium"
              rounded="2xl"
              px={4}
              py={2}
              w="full"
              maxW="16rem"
              onClick={onOpen}
            >
              Del samtale
            </Button>
          </Flex>
        </Box>
      </Box>

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
