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
  FormErrorMessage,
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

  const [errors, setErrors] = useState({
    medicationName: "",
    dosage: "",
    instructions: "",
  });

  const validateForm = () => {
    const newErrors = { medicationName: "", dosage: "", instructions: "" };
    let isValid = true;

    if (medicationName.trim().length < 2) {
      newErrors.medicationName = "Medicin-navn skal være mindst 2 tegn";
      isValid = false;
    }
    if (dosage.trim().length < 2) {
      newErrors.dosage = "Dosering skal være mindst 2 tegn";
      isValid = false;
    }
    if (instructions.trim().length < 2) {
      newErrors.instructions = "Instruktioner skal være mindst 2 tegn";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

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
          toast({
            title: "Kunne ikke oprette recept",
            description: "Tjek at alle felter er korrekt udfyldt.",
            status: "error",
          });
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
          <FormControl isInvalid={!!errors.medicationName} mb={3}>
            <FormLabel>Medicin</FormLabel>
            <Input
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
            />
            <FormErrorMessage>{errors.medicationName}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.dosage} mb={3}>
            <FormLabel>Dosering</FormLabel>
            <Input value={dosage} onChange={(e) => setDosage(e.target.value)} />
            <FormErrorMessage>{errors.dosage}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.instructions}>
            <FormLabel>Instruktioner</FormLabel>
            <Input
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <FormErrorMessage>{errors.instructions}</FormErrorMessage>
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
