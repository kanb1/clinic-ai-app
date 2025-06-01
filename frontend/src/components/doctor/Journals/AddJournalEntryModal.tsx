import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  Box,
  Text,
  Button,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAiNotes } from "@/hooks/doctor/journalHooks/useAiNotes";
import { useCreateJournalEntry } from "@/hooks/doctor/journalHooks/useCreateJournalEntry";

interface AddJournalEntryModalProps {
  appointmentId: string;
  journalId: string;
  onClose: () => void;
}

const AddJournalEntryModal = ({
  appointmentId,
  journalId,
  onClose,
}: AddJournalEntryModalProps) => {
  const toast = useToast();
  const { data, isLoading } = useAiNotes(appointmentId);
  const { mutate, isPending: isSaving } = useCreateJournalEntry();

  const aiNote = data?.messages?.[0]?.content || "";
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    mutate(
      { journalId, appointmentId, notes },
      {
        onSuccess: () => {
          toast({
            title: "Notat gemt",
            status: "success",
            duration: 2000,
            isClosable: true,
          });
          onClose();
        },
        onError: () => {
          toast({ title: "Kunne ikke gemme notat", status: "error" });
        },
      }
    );
  };

  if (isLoading) return <Spinner size="xl" />;

  return (
    <Modal isOpen onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Tilføj journalnotat</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Textarea
            placeholder="Skriv noter her..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            mb={4}
            minHeight="120px"
          />
          <Box bg="gray.100" p={3} borderRadius="md">
            <Text fontWeight="bold">Noter fra AI-bot:</Text>
            <Text fontSize="sm" mt={2}>
              {aiNote || "Ingen AI-noter fundet"}
            </Text>
            <Button
              mt={3}
              size="sm"
              onClick={() => setNotes(aiNote)}
              isDisabled={!aiNote}
              variant="outline"
            >
              Tilføj til tekstfelt
            </Button>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            colorScheme="blue"
            mr={3}
          >
            Gem
          </Button>
          <Button onClick={onClose} variant="ghost">
            Luk
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddJournalEntryModal;
