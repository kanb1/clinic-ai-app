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

  useEffect(() => {
    if (doctor) {
      setEmail(doctor.email || "");
      setPhone(doctor.phone || "");
    }
  }, [doctor]);

  const handleSave = () => {
    if (!doctor) return;
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
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                placeholder="Indtast ny email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Telefonnummer</FormLabel>
              <Input
                placeholder="Indtast nyt nummer"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
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
