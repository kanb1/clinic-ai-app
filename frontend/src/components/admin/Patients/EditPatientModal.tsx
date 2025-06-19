import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
  Stack,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { IUser } from "@/types/user.types";
import { useUpdatePatient } from "../../../hooks/admin/admin-patientHooks/useUpdatePatient";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patient: IUser | null;
}

const EditPatientModal = ({ isOpen, onClose, patient }: Props) => {
  const toast = useToast();
  const { mutate: updatePatient, isPending } = useUpdatePatient();

  // Gemmer redigerbare data
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Gemmer fejlmeddelelser til visning under inputfelter
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
  });

  // udfylder formular med patientens data
  useEffect(() => {
    if (patient) {
      setEmail(patient.email || "");
      setPhone(patient.phone || "");
    }
  }, [patient]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", phone: "" };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      newErrors.email = "Ugyldig email-adresse";
      isValid = false;
    }

    const phoneRegex = /^[\d+\s-]{6,20}$/;
    if (phone && !phoneRegex.test(phone)) {
      newErrors.phone = "Ugyldigt telefonnummer";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (!patient?._id) return;
    if (!validateForm()) return;

    updatePatient(
      { id: patient._id, email, phone },
      {
        onSuccess: () => {
          toast({
            title: "Patient opdateret",
            description: "Ændringerne er gemt.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          onClose();
        },
        onError: () => {
          toast({
            title: "Fejl ved opdatering",
            description: "Noget gik galt. Prøv igen.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent borderRadius="lg" p={2}>
        <ModalHeader fontSize="xl" fontWeight="bold">
          Redigér Patient
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Text fontSize="sm" color="gray.500" mb={6}>
            Navn, CPR og fødselsdato er skrivebeskyttede, da de simuleres som
            CPR-data.
          </Text>

          <Stack spacing={4}>
            <FormControl isDisabled>
              <FormLabel>Navn</FormLabel>
              <Input
                value={patient?.name || ""}
                isReadOnly
                bg="gray.100"
                color="gray.600"
                border="1px solid"
                borderColor="gray.200"
              />
            </FormControl>

            <FormControl isDisabled>
              <FormLabel>CPR-nummer</FormLabel>
              <Input
                value={patient?.cpr_number || ""}
                isReadOnly
                bg="gray.100"
                color="gray.600"
                border="1px solid"
                borderColor="gray.200"
              />
            </FormControl>

            <FormControl isDisabled>
              <FormLabel>Fødselsdato</FormLabel>
              <Input
                value={
                  patient?.birth_date
                    ? new Date(patient.birth_date).toLocaleDateString("da-DK")
                    : ""
                }
                isReadOnly
                bg="gray.100"
                color="gray.600"
                border="1px solid"
                borderColor="gray.200"
              />
            </FormControl>

            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Indtast ny email"
              />
              {errors.email && (
                <Text fontSize="sm" color="red.500">
                  {errors.email}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.phone}>
              <FormLabel>Telefonnummer</FormLabel>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Indtast nyt nummer"
              />
              {errors.phone && (
                <Text fontSize="sm" color="red.500">
                  {errors.phone}
                </Text>
              )}
            </FormControl>
          </Stack>
        </ModalBody>

        <ModalFooter mt={4}>
          <Button
            backgroundColor="black"
            color="white"
            onClick={onClose}
            mr={3}
          >
            Annuller
          </Button>
          <Button
            backgroundColor="#1c5e3a"
            color="white"
            onClick={handleSave}
            isLoading={isPending}
          >
            Gem
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditPatientModal;
