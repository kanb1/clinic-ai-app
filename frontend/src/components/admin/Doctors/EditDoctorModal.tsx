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
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const { mutate: updateDoctor } = useUpdateDoctor();

  // error states
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [nameError, setNameError] = useState("");
  const [addressError, setAddressError] = useState("");

  useEffect(() => {
    if (doctor) {
      setEmail(doctor.email || "");
      setPhone(doctor.phone || "");
      setAddress(doctor.address || "");
      setName(doctor.name || "");
    }
  }, [doctor]);

  const handleSave = () => {
    if (!doctor) return;

    // reset errors
    setEmailError("");
    setPhoneError("");
    setNameError("");
    setAddressError("");

    // validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d+\s-]{6,20}$/;
    const nameRegex = /^[a-zA-ZÆØÅæøå\s]+$/;

    let hasError = false;

    if (!name.trim() || name.length < 2) {
      setNameError("Navn skal være mindst 2 tegn");
      hasError = true;
    } else if (!nameRegex.test(name)) {
      setNameError("Navnet må kun indeholde bogstaver og mellemrum");
      hasError = true;
    }

    if (!emailRegex.test(email)) {
      setEmailError("Ugyldig email-adresse");
      hasError = true;
    }

    if (phone && !phoneRegex.test(phone)) {
      setPhoneError("Ugyldigt telefonnummer");
      hasError = true;
    }

    if (address && address.trim().length < 5) {
      setAddressError("Adressen skal være mindst 5 tegn");
      hasError = true;
    }

    if (hasError) return;

    // send request
    updateDoctor(
      { id: doctor._id, email, phone, name, address },
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
            <FormControl isInvalid={!!nameError}>
              <FormLabel>Navn</FormLabel>
              <Input
                placeholder="Indtast navn"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {nameError && (
                <Text fontSize="sm" color="red.500">
                  {nameError}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!emailError}>
              <FormLabel>Email</FormLabel>
              <Input
                placeholder="Indtast email"
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
                placeholder="Indtast telefonnummer"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {phoneError && (
                <Text fontSize="sm" color="red.500">
                  {phoneError}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!addressError}>
              <FormLabel>Adresse</FormLabel>
              <Input
                placeholder="Indtast adresse"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              {addressError && (
                <Text fontSize="sm" color="red.500">
                  {addressError}
                </Text>
              )}
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter mt={4}>
          <Button
            onClick={onClose}
            mr={3}
            backgroundColor="black"
            color="white"
          >
            Annuller
          </Button>
          <Button onClick={handleSave} backgroundColor="#1c5e3a" color="white">
            Gem
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditDoctorModal;
