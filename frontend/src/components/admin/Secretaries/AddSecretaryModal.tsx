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
import { useState } from "react";
import { useCreateSecretary } from "@/hooks/admin/admin-secretaryHooks/useCreateSecretary";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CreateSecretaryModal = ({ isOpen, onClose }: Props) => {
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: createSecretary, isPending } = useCreateSecretary();

  const handleCreate = () => {
    if (!name || !email || !password) {
      toast({
        title: "Alle felter er påkrævede",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    createSecretary(
      { name, email, password },
      {
        onSuccess: () => {
          toast({
            title: "Sekretær oprettet",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          setName("");
          setEmail("");
          setPassword("");
          onClose();
        },
        onError: () => {
          toast({
            title: "Fejl",
            description: "Kunne ikke oprette sekretær",
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
        <ModalHeader>Opret ny sekretær</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormLabel>Navn</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <FormLabel>Email</FormLabel>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            <FormLabel>Adgangskode</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3} variant="ghost">
            Annullerx
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleCreate}
            isLoading={isPending}
          >
            Opret
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateSecretaryModal;
