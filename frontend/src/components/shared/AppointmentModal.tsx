import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  VStack,
  HStack,
  Text,
  Divider,
  Button,
} from "@chakra-ui/react";
import moment from "moment";
import { IAppointment } from "@/types/appointment.types";

// Detaljer om lægeaftale

// Komponent modtager 3 props
interface Props {
  isOpen: boolean;
  onClose: () => void;
  appointment: IAppointment | null; //objekt med info om bestemt aftale/null
}

// destruct direkte props i parameterlisten
// vi forventer props af typen Props
const AppointmentDetailsModal = ({ isOpen, onClose, appointment }: Props) => {
  if (!appointment) return null;

  return (
    // parent bestemmer hvornår modal skal vises og med hvilkend data
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      {/* gråt lag i baggrunden */}
      <ModalOverlay />
      <ModalContent borderRadius="lg" p={2}>
        <ModalHeader textAlign="center">Aftaledetaljer</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={5} align="stretch" mt={2} mb={2} fontSize="sm">
            <HStack justify="space-between">
              <Text color="gray.500">Patient</Text>
              <Text fontWeight="medium">
                {appointment.patient_id?.name || "Ukendt"}
              </Text>
            </HStack>
            <Divider />

            <HStack justify="space-between">
              <Text color="gray.500">Læge</Text>
              <Text fontWeight="medium">
                {appointment.doctor_id?.name || "Ukendt"}
              </Text>
            </HStack>
            <Divider />

            <HStack justify="space-between">
              <Text color="gray.500">Dato</Text>
              <Text fontWeight="medium">
                {moment(appointment.date).format("dddd D/M")}
              </Text>
            </HStack>
            <Divider />

            <HStack justify="space-between">
              <Text color="gray.500">Tidspunkt</Text>
              <Text fontWeight="medium">
                {appointment.time} – {appointment.end_time || "?"}
              </Text>
            </HStack>
            <Divider />

            <HStack justify="space-between">
              <Text color="gray.500">Status</Text>
              <Text fontWeight="medium">{appointment.status || "Ukendt"}</Text>
            </HStack>
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

export default AppointmentDetailsModal;
