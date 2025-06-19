import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
  Stack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useUpdateMyProfile } from "@/hooks/patient/settingHooks/useUpdateMyProfile";
import { useAuth } from "@/context/AuthContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialEmail: string;
  initialPhone?: string;
}

const EditPatientInfoModal = ({ isOpen, onClose }: Props) => {
  const toast = useToast();
  const { user, setUser } = useAuth();

  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const [errors, setErrors] = useState({ email: "", phone: "" });

  const { mutate: updateProfile, isPending } = useUpdateMyProfile();

  // pre-udfylder felterne med patientens data
  useEffect(() => {
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setErrors({ email: "", phone: "" });
    // (når user-data (fx ny patient) ændres og ved åbning)
  }, [user, isOpen]);

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
    if (!validateForm()) return;

    updateProfile(
      { email, phone },
      {
        onSuccess: (data) => {
          toast({
            title: "Oplysninger opdateret",
            status: "success",
            duration: 3000,
            isClosable: true,
          });

          setUser(data.user);
          onClose();
        },
        onError: () => {
          toast({
            title: "Noget gik galt",
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
          Redigér dine oplysninger
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
                value={user?.name || ""}
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
                value={user?.cpr_number || ""}
                isReadOnly
                bg="gray.100"
                color="gray.600"
                border="1px solid"
                borderColor="gray.200"
              />
            </FormControl>

            <FormControl isDisabled>
              <FormLabel>Adresse</FormLabel>
              <Input
                value={user?.address || ""}
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
                  user?.birth_date
                    ? new Date(user.birth_date).toLocaleDateString("da-DK")
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
                placeholder="Indtast nyt telefonnummer"
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
          <Button onClick={onClose} variant="ghost" mr={3}>
            Annuller
          </Button>
          <Button
            colorScheme="green"
            onClick={handleSave}
            isLoading={isPending}
          >
            Gem ændringer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditPatientInfoModal;
