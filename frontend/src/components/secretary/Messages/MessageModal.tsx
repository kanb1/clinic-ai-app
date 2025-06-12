import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  Button,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useSendMessage } from "../../../hooks/secretary/messageHooks/useSendMessage";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverScope: "patients" | "individual" | "staff" | "all";
  receiverId?: string; // Kun hvis individual
}

const MessageModal = ({
  isOpen,
  onClose,
  receiverScope,
  receiverId,
}: MessageModalProps) => {
  const [content, setContent] = useState("");
  const toast = useToast();
  const { mutate, isPending } = useSendMessage();

  const handleSend = () => {
    // før jeg sender noget, tjekker jeg om brugeren har skrevet noget i tekstfeltet
    if (!content.trim()) {
      toast({ title: "Besked kan ikke være tom.", status: "warning" });
      return;
    }

    if (content.length > 1000) {
      toast({
        title: "Beskeden er for lang.",
        description: "Maks. længde er 1000 tegn.",
        status: "warning",
      });
      return;
    }

    const wordCount = content.trim().split(/\s+/).length;

    if (wordCount < 5) {
      toast({
        title: "Beskeden er for kort.",
        description: "Skriv mindst 5 ord.",
        status: "warning",
      });
      return;
    }

    mutate(
      {
        content,
        receiver_scope: receiverScope,
        // receiver_id bliver kun sat hvis det er "individual", ellers bliver det undefined
        receiver_id: receiverScope === "individual" ? receiverId : undefined,
        type: "besked",
      },
      {
        onSuccess: () => {
          toast({ title: "Besked sendt", status: "success" });
          setContent("");
          onClose();
        },
        onError: () => {
          toast({ title: "Kunne ikke sende besked", status: "error" });
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Skriv venligst din besked</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Textarea
            placeholder="Skriv her..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleSend} isLoading={isPending} colorScheme="blue">
            Send
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MessageModal;
