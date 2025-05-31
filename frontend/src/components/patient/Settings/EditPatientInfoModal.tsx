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
  const { user, setUser } = useAuth(); // henter bruger og setUser fra kontekst
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const { mutate: updateProfile, isPending } = useUpdateMyProfile();

  useEffect(() => {
    // Når modal åbner, sæt default værdier
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
  }, [user, isOpen]);

  const handleSave = () => {
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

          setUser(data.user); // opdater AuthContext med nye oplysninger
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
          <FormControl mb={4}>
            <FormLabel>Email</FormLabel>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Telefonnummer</FormLabel>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
            />
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
