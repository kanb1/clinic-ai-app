import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  ModalFooter,
  Button,
} from "@chakra-ui/react";

interface Props {
  prescription: {
    medication_name: string;
    dosage: string;
    instructions: string;
    issued_date: string;
  };
  onClose: () => void;
}

const PrescriptionModal = ({ prescription, onClose }: Props) => {
  return (
    <Modal isOpen onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Receptdetaljer</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontWeight="bold">Medicin:</Text>
          <Text mb={2}>{prescription.medication_name}</Text>
          <Text fontWeight="bold">Dosering:</Text>
          <Text mb={2}>{prescription.dosage}</Text>
          <Text fontWeight="bold">Instruktioner:</Text>
          <Text mb={2}>{prescription.instructions}</Text>
          <Text fontWeight="bold">Udstedelsesdato:</Text>
          <Text>{new Date(prescription.issued_date).toLocaleDateString()}</Text>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Luk</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PrescriptionModal;
