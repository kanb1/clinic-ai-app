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
  Flex,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useTodaysDetailedAppointments } from "@/hooks/doctor/appointmentsHooks/useTodaysDetailedAppointments";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/httpClient";

const TodaysAppointmentsTable = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useTodaysDetailedAppointments(page);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { mutate: cancelAppointment } = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/doctors/appointments/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todays-appointments-detailed", page],
      });
    },
  });

  const cancelRef = useRef(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const {
    isOpen: isAlertOpen,
    onOpen: openAlert,
    onClose: closeAlert,
  } = useDisclosure();

  const toast = useToast();

  const handleCancel = () => {
    if (selectedAppointmentId) {
      cancelAppointment(selectedAppointmentId, {
        onSuccess: () => {
          toast({
            title: "Aftale aflyst.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          closeAlert();
        },
      });
    }
  };

  if (isLoading || !data) return <Spinner />;
  if (error) return <Text color="red.500">Kunne ikke hente aftaler.</Text>;

  return (
    <Box overflowX="auto">
      <Table variant="simple" mb={4}>
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
          {data.data.map((appt) => (
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
                    setSelectedAppointmentId(appt.id);
                    openAlert();
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

      {/* Pagination UI */}
      <Flex justify="space-between" align="center">
        <Button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          isDisabled={page === 1}
        >
          Forrige
        </Button>
        <Text>
          Side {data.page} af {data.totalPages} — Viser {data.data.length} ud af{" "}
          {data.total} aftaler
        </Text>
        <Button
          onClick={() => setPage((prev) => Math.min(prev + 1, data.totalPages))}
          isDisabled={page === data.totalPages}
        >
          Næste
        </Button>
      </Flex>

      {/* Modal til symptomer */}
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

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeAlert}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Bekræft aflysning
            </AlertDialogHeader>

            <AlertDialogBody>
              Er du sikker på, at du vil aflyse denne aftale?
            </AlertDialogBody>

            {/* Alert dialog for bekræftelse på aflysning */}
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeAlert}>
                Annullér
              </Button>
              <Button
                colorScheme="red"
                onClick={handleCancel}
                ml={3}
                isDisabled={!selectedAppointmentId}
              >
                Aflys
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default TodaysAppointmentsTable;
