// src/components/admin/Secretaries/AddSecretaryModal.tsx

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
  FormControl,
} from "@chakra-ui/react";
import { useState } from "react";
import { useCreateSecretary } from "@/hooks/admin/admin-secretaryHooks/useCreateSecretary";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AddSecretaryModal = ({ isOpen, onClose }: Props) => {
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const { mutate: createSecretary, isPending } = useCreateSecretary();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = () => {
    const { name, email, password } = form;

    if (!name || !email || !password) {
      toast({
        title: "Alle felter er påkrævede",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    createSecretary(form, {
      onSuccess: () => {
        toast({
          title: "Sekretær oprettet",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setForm({ name: "", email: "", phone: "", password: "" });
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
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={{ base: "xs", sm: "md", md: "lg" }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="xl" fontWeight="bold">
          Opret sekretær
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel fontWeight="bold">Navn</FormLabel>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Indtast navn"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="bold">Email</FormLabel>
              <Input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                placeholder="Indtast email"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="bold">Telefon</FormLabel>
              <Input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                type="tel"
                placeholder="Indtast telefonnummer"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="bold">Adgangskode</FormLabel>
              <Input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Vælg adgangskode"
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose} variant="ghost" mr={3}>
            Annuller
          </Button>
          <Button
            colorScheme="green"
            onClick={handleCreate}
            isLoading={isPending}
          >
            Gem
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddSecretaryModal;
