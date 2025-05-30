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
  Stack,
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
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent borderRadius="lg" p={2}>
        <ModalHeader fontSize="xl" fontWeight="bold">
          Redigér Sekretær
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

export default EditSecretaryModal;
