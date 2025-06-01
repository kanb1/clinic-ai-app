import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
} from "@chakra-ui/react";
import { FC } from "react";

interface JournalModalProps {
  entry: {
    notes: string;
    createdByAI: boolean;
    appointmentDate?: string;
    doctorName?: string;
  };
  onClose: () => void;
}

const JournalModal: FC<JournalModalProps> = ({ entry, onClose }) => {
  return (
    <Modal isOpen onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Journalnotat</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontWeight="bold" mb={2}>
            {entry.createdByAI
              ? "Notat genereret af AI"
              : "Notat skrevet af lægen"}
          </Text>
          {entry.appointmentDate && (
            <Text fontSize="sm" color="gray.500" mb={2}>
              Aftale: {entry.appointmentDate} — {entry.doctorName}
            </Text>
          )}
          <Text whiteSpace="pre-wrap" fontSize="md">
            {entry.notes}
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Luk</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default JournalModal;
