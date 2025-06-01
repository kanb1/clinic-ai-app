import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  FormControl,
  FormLabel,
  Button,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useCreatePrescription } from "@/hooks/doctor/journalHooks/useCreatePrescription";

interface Props {
  patientId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddPrescriptionModal = ({ patientId, onClose, onSuccess }: Props) => {
  const toast = useToast();
  const { mutate, isPending } = useCreatePrescription();

  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");

  const handleSubmit = () => {
    mutate(
      {
        patient_id: patientId,
        medication_name: medicationName,
        dosage,
        instructions,
      },
      {
        onSuccess: () => {
          toast({ title: "Recept oprettet", status: "success" });
          if (onSuccess) onSuccess();
          onClose();
        },
        onError: () => {
          toast({ title: "Kunne ikke oprette recept", status: "error" });
        },
      }
    );
  };

  return (
    <Modal isOpen onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Opret ny recept</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>Medicin</FormLabel>
            <Input
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Dosering</FormLabel>
            <Input value={dosage} onChange={(e) => setDosage(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Instruktioner</FormLabel>
            <Input
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={handleSubmit}
            isLoading={isPending}
            colorScheme="blue"
            mr={3}
          >
            Gem recept
          </Button>
          <Button onClick={onClose} variant="ghost">
            Luk
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddPrescriptionModal;
