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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Redigér læge</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel>Email</FormLabel>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Telefon</FormLabel>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3}>
            Annuller
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            Gem
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditDoctorModal;
