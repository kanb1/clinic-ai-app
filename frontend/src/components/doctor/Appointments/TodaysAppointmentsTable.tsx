import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Spinner,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useToast } from "@chakra-ui/react";

import { useTodaysDetailedAppointments } from "@/hooks/doctor/appointmentsHooks/useTodaysDetailedAppointments";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

const TodaysAppointmentsTable = () => {
  const toast = useToast();

  const { data = [], isLoading, error } = useTodaysDetailedAppointments();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [appointmentToCancel, setAppointmentToCancel] = useState<{
    id: string;
    patientName: string;
    time: string;
  } | null>(null);
  const cancelDialogRef = useRef(null);
  const {
    isOpen: isCancelOpen,
    onOpen: onCancelOpen,
    onClose: onCancelClose,
  } = useDisclosure();

  const { mutate: cancelAppointment } = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/doctors/appointments/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todays-appointments-detailed"],
      });
    },
  });

  if (isLoading) return <Spinner />;
  if (error) return <Text color="red.500">Kunne ikke hente aftaler.</Text>;

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Patient</Th>
            <Th>Fødselsdato</Th>
            <Th>Tidspunkt</Th>
            <Th>Symptomer</Th>
            <Th>Journal</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data
            .filter((appt) => appt.status === "bekræftet")
            .map((appt) => (
              <Tr key={appt.id}>
                <Td>{appt.patientName}</Td>
                <Td>{new Date(appt.birthDate).toLocaleDateString("da-DK")}</Td>
                <Td>{appt.time}</Td>
                <Td>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedSymptoms(appt.symptoms);
                      onOpen();
                    }}
                    variant="outline"
                    colorScheme="blue"
                  >
                    Åben
                  </Button>
                </Td>
                <Td>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() =>
                      navigate(`/doctor/patient-journal?id=${appt.patientId}`)
                    }
                  >
                    Vis
                  </Button>
                </Td>
                <Td>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => {
                      setAppointmentToCancel({
                        id: appt.id,
                        patientName: appt.patientName,
                        time: appt.time,
                      });
                      onCancelOpen();
                    }}
                    isDisabled={appt.status === "aflyst"}
                  >
                    Aflys
                  </Button>
                </Td>
              </Tr>
            ))}
        </Tbody>
      </Table>
      {/* Sekretær note vises */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Symptomer</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text whiteSpace="pre-wrap">{selectedSymptoms}</Text>
          </ModalBody>
        </ModalContent>
      </Modal>
      {/* aflys aftale bekrfætelsesmodal */}
      <AlertDialog
        isOpen={isCancelOpen}
        leastDestructiveRef={cancelDialogRef}
        onClose={onCancelClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Bekræft aflysning</AlertDialogHeader>
            <AlertDialogBody>
              Er du sikker på, at du vil aflyse aftalen med{" "}
              <strong>{appointmentToCancel?.patientName}</strong> kl.{" "}
              {appointmentToCancel?.time}?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelDialogRef} onClick={onCancelClose}>
                Annuller
              </Button>
              <Button
                colorScheme="red"
                ml={3}
                onClick={() => {
                  if (appointmentToCancel) {
                    cancelAppointment(appointmentToCancel.id, {
                      onSuccess: () => {
                        toast({
                          title: "Aftale aflyst",
                          description: `Aftalen med ${appointmentToCancel.patientName} er aflyst.`,
                          status: "success",
                          duration: 4000,
                          isClosable: true,
                        });
                        onCancelClose();
                        setAppointmentToCancel(null);
                      },
                    });
                  }
                }}
              >
                Aflys aftale
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default TodaysAppointmentsTable;
