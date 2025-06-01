import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  Stack,
} from "@chakra-ui/react";
import { IUser } from "@/types/user.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patient: IUser | null;
}

const PatientDetailsModal = ({ isOpen, onClose, patient }: Props) => {
  if (!patient) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Patientdetaljer</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={2}>
            <Text>
              <strong>Navn:</strong> {patient.name}
            </Text>
            <Text>
              <strong>CPR:</strong> {patient.cpr_number || "Ikke oplyst"}
            </Text>
            <Text>
              <strong>Fødselsdato:</strong>{" "}
              {patient.birth_date
                ? new Date(patient.birth_date).toLocaleDateString("da-DK")
                : "Ukendt"}
            </Text>
            <Text>
              <strong>Email:</strong> {patient.email}
            </Text>
            <Text>
              <strong>Telefon:</strong> {patient.phone || "Ikke oplyst"}
            </Text>
            <Text>
              <strong>Adresse:</strong> {patient.address || "Ikke oplyst"}
            </Text>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PatientDetailsModal;
