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
  FormLabel,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { IUser } from "@/types/user.types";
import { useUpdateSecretary } from "../../../hooks/admin/admin-secretaryHooks/useUpdateSecretary";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  secretary: IUser | null;
}

const EditSecretaryModal = ({ isOpen, onClose, secretary }: Props) => {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const { mutate: updateSecretary, isPending } = useUpdateSecretary();

  useEffect(() => {
    if (secretary) {
      setEmail(secretary.email || "");
      setPhone(secretary.phone || "");
    }
  }, [secretary]);

  const handleSave = () => {
    if (!secretary) return;
    updateSecretary(
      { id: secretary._id, email, phone },
      {
        onSuccess: () => {
          toast({
            title: "Sekretær opdateret",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          onClose();
        },
        onError: () => {
          toast({
            title: "Noget gik galt",
            description: "Kunne ikke opdatere sekretæren",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Redigér sekretær</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormLabel>Email</FormLabel>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />

            <FormLabel>Telefon</FormLabel>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3} variant="ghost">
            Annuller
          </Button>
          <Button colorScheme="blue" onClick={handleSave} isLoading={isPending}>
            Gem
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditSecretaryModal;
