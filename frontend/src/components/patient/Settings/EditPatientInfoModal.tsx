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

  useEffect(() => {
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setErrors({ email: "", phone: "" });
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
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Rediger dine oplysninger</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isInvalid={!!errors.email} mb={4}>
            <FormLabel>Email</FormLabel>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Indtast din email"
            />
            {errors.email && (
              <Text fontSize="sm" color="red.500" mt={1}>
                {errors.email}
              </Text>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.phone}>
            <FormLabel>Telefonnummer</FormLabel>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="Indtast dit telefonnummer"
            />
            {errors.phone && (
              <Text fontSize="sm" color="red.500" mt={1}>
                {errors.phone}
              </Text>
            )}
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose} variant="ghost" mr={3}>
            Annuller
          </Button>
          <Button colorScheme="blue" onClick={handleSave} isLoading={isPending}>
            Gem ændringer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditPatientInfoModal;
