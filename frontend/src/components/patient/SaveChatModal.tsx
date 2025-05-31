import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useUpcomingAppointments } from "@/hooks/patient/mypageHooks/useUpcomingAppointments";
import { useSaveChatHistory } from "@/hooks/patient/chatHooks/useSaveChatHistory";

interface SaveChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: { user: string; ai: string }[];
}

const SaveChatModal = ({ isOpen, onClose, messages }: SaveChatModalProps) => {
  const toast = useToast();
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const { data: appointments = [] } = useUpcomingAppointments();
  const { mutate: saveChat, isPending } = useSaveChatHistory();

  const handleSave = () => {
    if (!selectedAppointment) {
      toast({ status: "warning", description: "Vælg en aftale" });
      return;
    }

    saveChat(
      { messages, appointmentId: selectedAppointment },
      {
        onSuccess: () => {
          toast({ status: "success", description: "Samtale gemt!" });
          onClose();
        },
        onError: () => {
          toast({ status: "error", description: "Kunne ikke gemme samtalen" });
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Gem samtale</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Select
            placeholder="Vælg kommende aftale"
            value={selectedAppointment}
            onChange={(e) => setSelectedAppointment(e.target.value)}
          >
            {appointments.map((a) => (
              <option key={a._id} value={a._id}>
                {new Date(a.date).toLocaleDateString()} kl. {a.time}
              </option>
            ))}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleSave} isLoading={isPending} colorScheme="blue">
            Gem
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SaveChatModal;
