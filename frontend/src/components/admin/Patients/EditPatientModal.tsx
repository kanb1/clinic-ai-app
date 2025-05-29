// src/components/admin/EditPatientModal.tsx
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { IUser } from "@/types/user.types";
import { useUpdatePatient } from "../../../hooks/admin/admin-patientHooks/useUpdatePatient";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patient: IUser | null;
}

const EditPatientModal = ({ isOpen, onClose, patient }: Props) => {
  const toast = useToast();
  const { mutate: updatePatient, isPending } = useUpdatePatient();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (patient) {
      setEmail(patient.email || "");
      setPhone(patient.phone || "");
    }
  }, [patient]);

  const handleSave = () => {
    if (!patient?._id) return;

    updatePatient(
      {
        id: patient._id,
        email,
        phone,
      },
      {
        onSuccess: () => {
          toast({
            title: "Patient opdateret",
            description: "Ændringerne er gemt.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          onClose();
        },
        onError: () => {
          toast({
            title: "Fejl ved opdatering",
            description: "Noget gik galt. Prøv igen.",
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
      <ModalContent>
        <ModalHeader>Redigér Patient</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={4} fontSize="sm" color="gray.600">
            Navn, CPR og fødselsdato er skrivebeskyttede, da de simuleres som
            CPR-data.
          </Text>

          <FormControl isDisabled>
            <FormLabel fontWeight={"bold"}>
              Navn{" "}
              <Text as="span" color="gray.500">
                (Hentet fra CPR-registret)
              </Text>
            </FormLabel>
            <Input
              value={patient?.name || ""}
              isReadOnly
              bg="gray.100"
              color="gray.600"
              cursor="not-allowed"
            />
          </FormControl>

          <FormControl isDisabled>
            <FormLabel fontWeight={"bold"}>
              CPR-nummer{" "}
              <Text as="span" color="gray.500">
                (Hentet fra CPR-registret)
              </Text>
            </FormLabel>
            <Input
              value={patient?.cpr_number || ""}
              isReadOnly
              bg="gray.100"
              color="gray.600"
              cursor="not-allowed"
            />
          </FormControl>

          <FormControl isDisabled>
            <FormLabel fontWeight={"bold"}>
              Fødselsdato{" "}
              <Text as="span" color="gray.500">
                (Hentet fra CPR-registret)
              </Text>
            </FormLabel>
            <Input
              value={
                patient?.birth_date
                  ? new Date(patient.birth_date).toLocaleDateString("da-DK")
                  : ""
              }
              isReadOnly
              bg="gray.100"
              color="gray.600"
              cursor="not-allowed"
            />
          </FormControl>

          <FormControl mb={3}>
            <FormLabel fontWeight={"bold"}>Email</FormLabel>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight={"bold"}>Telefonnummer</FormLabel>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} mr={3}>
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

export default EditPatientModal;
