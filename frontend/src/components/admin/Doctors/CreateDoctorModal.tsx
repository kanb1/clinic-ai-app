// src/components/admin/Doctors/AddDoctorModal.tsx
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  FormLabel,
  VStack,
  useToast,
  FormControl,
} from "@chakra-ui/react";
import { useState } from "react";
import { useCreateDoctor } from "../../../hooks/admin/admin-doctorHooks/useCreateDoctor";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AddDoctorModal = ({ isOpen, onClose }: Props) => {
  const toast = useToast();
  const { mutate: addDoctor, isPending } = useCreateDoctor();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    addDoctor(form, {
      onSuccess: () => {
        toast({
          title: "Læge oprettet",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
        setForm({ name: "", email: "", phone: "", password: "" });
      },
      onError: () => {
        toast({
          title: "Noget gik galt",
          description: "Kunne ikke oprette lægen",
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
          Opret læge
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

export default AddDoctorModal;
