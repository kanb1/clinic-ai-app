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
import { useAiNoteByAppointment } from "@/hooks/doctor/aiHooks/useAiNoteByAppointment";
import { useCreateJournalEntry } from "@/hooks/doctor/journalHooks/useCreateJournalEntry";

interface AddJournalEntryModalProps {
  appointmentId: string;
  journalId: string;
  onClose: () => void;
  onSuccess?: () => void; // valgfri callback
}

const AddJournalEntryModal = ({
  appointmentId,
  journalId,
  onClose,
  onSuccess,
}: AddJournalEntryModalProps) => {
  const toast = useToast();
  const { data, isLoading } = useAiNoteByAppointment(appointmentId);
  const { mutate, isPending: isSaving } = useCreateJournalEntry();

  // får adgang til symmary_for_doctor -> AI har lavet notater
  const aiNote = data?.summary_for_doctor || "Ingen AI-noter fundet";

  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!notes.trim()) {
      toast({ title: "Notat kan ikke være tomt.", status: "warning" });
      return;
    }

    if (notes.trim().length < 5) {
      toast({
        title: "Notatet er for kort.",
        description: "Skriv lidt mere detaljeret.",
        status: "warning",
      });
      return;
    }
    if (notes.trim().length > 1000) {
      toast({
        title: "Notatet er for langt.",
        description: "Skriv et kortere notat (maks 1000 tegn).",
        status: "warning",
      });

      return;
    }
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
          if (onSuccess) onSuccess(); //kald parentens refetch
          else onClose(); // fallback
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
            //feltet styres af useState (notes) -> kig i næste button
            value={notes}
            //sæt ellers hvad læge skriver ind i tekstfeltet
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
              //sætter AI-notes i "notes" via setNotes
              //det vil overskrive det nuværende indhold i tekstfeltet med AI's note/vises med det samme
              // fordi texarea bruger value={notes}
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
            // validerer og send notes til backend
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
