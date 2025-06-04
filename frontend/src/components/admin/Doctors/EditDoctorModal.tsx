import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { IUser } from "@/types/user.types";
import { useUpdateDoctor } from "../../../hooks/admin/admin-doctorHooks/useUpdateDoctor";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  doctor: IUser | null;
}

const EditDoctorModal = ({ isOpen, onClose, doctor }: Props) => {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const { mutate: updateDoctor } = useUpdateDoctor();

  // error states:
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (doctor) {
      setEmail(doctor.email || "");
      setPhone(doctor.phone || "");
    }
  }, [doctor]);

  const handleSave = () => {
    if (!doctor) return;

    setEmailError("");
    setPhoneError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Ugyldig email-adresse");
      return;
    }

    const phoneRegex = /^[\d+\s-]{6,20}$/; // tillader +45 12345678 eller 123-456-7890 osv.
    if (phone && !phoneRegex.test(phone)) {
      setPhoneError("Ugyldigt telefonnummer");
      return;
    }

    updateDoctor(
      { id: doctor._id, email, phone },
      {
        onSuccess: () => {
          toast({
            title: "Læge opdateret",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          onClose();
        },
      }
    );
  };

  if (!doctor) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent borderRadius="lg" p={2}>
        <ModalHeader fontSize="xl" fontWeight="bold">
          Redigér Læge
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <FormControl isInvalid={!!emailError}>
              <FormLabel>Email</FormLabel>
              <Input
                placeholder="Indtast ny email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && (
                <Text fontSize="sm" color="red.500">
                  {emailError}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!phoneError}>
              <FormLabel>Telefonnummer</FormLabel>
              <Input
                placeholder="Indtast nyt nummer"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {phoneError && (
                <Text fontSize="sm" color="red.500">
                  {phoneError}
                </Text>
              )}
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter mt={4}>
          <Button
            backgroundColor="black"
            color={"white"}
            onClick={onClose}
            mr={3}
          >
            Annuller
          </Button>
          <Button
            backgroundColor="#1c5e3a"
            color={"white"}
            onClick={handleSave}
          >
            Gem
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditDoctorModal;
