import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box,
  Text,
  VStack,
  HStack,
  Divider,
  Avatar,
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
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent borderRadius="lg" p={2}>
        <ModalHeader textAlign="center">Patientdetaljer</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={5} align="center" mt={4} mb={4}>
            <Box w="full">
              <VStack spacing={3} align="start" fontSize="sm">
                <HStack justify="space-between" w="full">
                  <Text color="gray.500">Navn</Text>
                  <Text fontWeight="medium">{patient.name}</Text>
                </HStack>
                <Divider />
                <HStack justify="space-between" w="full">
                  <Text color="gray.500">CPR</Text>
                  <Text fontWeight="medium">
                    {patient.cpr_number || "Ikke oplyst"}
                  </Text>
                </HStack>
                <Divider />
                <HStack justify="space-between" w="full">
                  <Text color="gray.500">Fødselsdato</Text>
                  <Text fontWeight="medium">
                    {patient.birth_date
                      ? new Date(patient.birth_date).toLocaleDateString("da-DK")
                      : "Ukendt"}
                  </Text>
                </HStack>
                <Divider />
                <HStack justify="space-between" w="full">
                  <Text color="gray.500">Email</Text>
                  <Text fontWeight="medium">{patient.email}</Text>
                </HStack>
                <Divider />
                <HStack justify="space-between" w="full">
                  <Text color="gray.500">Telefon</Text>
                  <Text fontWeight="medium">
                    {patient.phone || "Ikke oplyst"}
                  </Text>
                </HStack>
                <Divider />
                <HStack justify="space-between" w="full">
                  <Text color="gray.500">Adresse</Text>
                  <Text fontWeight="medium">
                    {patient.address || "Ikke oplyst"}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PatientDetailsModal;
