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

  //   funktion der bliver kaldt når besked bliver sendt
  const handleSend = () => {
    // før jeg sender noget, tjekker jeg om brugeren har skrevet noget i tekstfeltet
    if (!content.trim()) {
      toast({ title: "Besked kan ikke være tom.", status: "warning" });
      return;
    }

    // brug af mutate
    // kalder mutate() og giver den et objekt (payload) med beskeddata
    // Dette objekt bliver sendt direkte videre til din mutationFn i hooken: hvor vi kalder api.post
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
          {/* Når brugeren klikker på knappen, kaldes handleSend() som i sidste ende kalder mutate(). */}
          <Button onClick={handleSend} isLoading={isPending} colorScheme="blue">
            Send
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MessageModal;
