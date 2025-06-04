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
  Text,
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

  // errorestates:
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const validateForm = () => {
    const newErrors = { name: "", email: "", phone: "", password: "" };
    let isValid = true;

    if (form.name.trim().length < 2) {
      newErrors.name = "Navn er påkrævet og skal være mindst 2 tegn";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      newErrors.email = "Ugyldig email-adresse";
      isValid = false;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/;
    if (!passwordRegex.test(form.password)) {
      newErrors.password =
        "Adgangskoden skal være mindst 12 tegn og indeholde store og små bogstaver, tal og specialtegn";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!validateForm()) return;

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
        setErrors({ name: "", email: "", phone: "", password: "" });
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
            <FormControl isInvalid={!!errors.name}>
              <FormLabel fontWeight="bold">Navn</FormLabel>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Indtast navn"
              />
              {errors.name && (
                <Text fontSize="sm" color="red.500">
                  {errors.name}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.email}>
              <FormLabel fontWeight="bold">Email</FormLabel>
              <Input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                placeholder="Indtast email"
              />
              {errors.email && (
                <Text fontSize="sm" color="red.500">
                  {errors.email}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.phone}>
              <FormLabel fontWeight="bold">Telefon</FormLabel>
              <Input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                type="tel"
                placeholder="Indtast telefonnummer"
              />
              {errors.phone && (
                <Text fontSize="sm" color="red.500">
                  {errors.phone}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel fontWeight="bold">Adgangskode</FormLabel>
              <Input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Vælg adgangskode"
              />
              {errors.password && (
                <Text fontSize="sm" color="red.500">
                  {errors.password}
                </Text>
              )}
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
