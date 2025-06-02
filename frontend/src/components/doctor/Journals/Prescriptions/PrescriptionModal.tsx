import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
  Box,
  VStack,
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
    <Modal isOpen onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Receptdetaljer</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontSize="sm" color="gray.500">
                Medicin
              </Text>
              <Text fontWeight="medium">{prescription.medication_name}</Text>
            </Box>

            <Box>
              <Text fontSize="sm" color="gray.500">
                Dosering
              </Text>
              <Text fontWeight="medium">{prescription.dosage}</Text>
            </Box>

            <Box>
              <Text fontSize="sm" color="gray.500">
                Instruktioner
              </Text>
              <Text fontWeight="medium">{prescription.instructions}</Text>
            </Box>

            <Box>
              <Text fontSize="sm" color="gray.500">
                Udstedelsesdato
              </Text>
              <Text fontWeight="medium">
                {new Date(prescription.issued_date).toLocaleDateString("da-DK")}
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose} colorScheme="blue">
            Luk
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PrescriptionModal;
