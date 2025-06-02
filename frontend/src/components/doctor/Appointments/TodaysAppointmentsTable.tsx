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
  Stack,
  useBreakpointValue,
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

  const isMobile = useBreakpointValue({ base: true, md: false });

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
    <Box>
      {isMobile ? (
        <Stack spacing={4}>
          {data.data.map((appt) => (
            <Box
              key={appt.id}
              borderWidth="1px"
              borderRadius="md"
              p={4}
              bg="gray.50"
            >
              <Flex flexDirection={"column"} alignItems={{ base: "center" }}>
                <Text fontWeight="bold">{appt.patientName}</Text>
                <Text>
                  Fødselsdato:{" "}
                  {new Date(appt.birthDate).toLocaleDateString("da-DK")}
                </Text>
                <Text>Tidspunkt: {appt.time}</Text>

                <Flex
                  mt={3}
                  gap={2}
                  wrap={"wrap"}
                  alignItems={{ base: "center" }}
                  justifyContent={"center"}
                >
                  <Button
                    backgroundColor="primary.red"
                    color="white"
                    _hover={{ bg: "red.600" }}
                    fontSize="sm"
                    fontWeight="medium"
                    rounded="2xl"
                    px={4}
                    py={2}
                    w="full"
                    maxW="16rem"
                    onClick={() => {
                      setSelectedSymptoms(appt.symptoms);
                      onOpen();
                    }}
                  >
                    Symptomer
                  </Button>
                  <Button
                    backgroundColor="primary.red"
                    color="white"
                    _hover={{ bg: "red.600" }}
                    fontSize="sm"
                    fontWeight="medium"
                    rounded="2xl"
                    px={4}
                    py={2}
                    w="full"
                    maxW="16rem"
                    onClick={() =>
                      navigate(`/doctor/patient-journal?id=${appt.patientId}`)
                    }
                  >
                    Vis journal
                  </Button>
                  <Button
                    borderColor="primary.red"
                    color="primary.red"
                    _hover={{ bg: "red.200" }}
                    fontSize="sm"
                    fontWeight="medium"
                    rounded="2xl"
                    px={4}
                    py={2}
                    w="full"
                    maxW="16rem"
                    variant="outline"
                    onClick={() => {
                      setSelectedAppointmentId(appt.id);
                      openAlert();
                    }}
                    isDisabled={appt.status === "aflyst"}
                  >
                    Aflys
                  </Button>
                </Flex>
                <Text mt={2}>Status: {appt.status}</Text>
              </Flex>
            </Box>
          ))}
        </Stack>
      ) : (
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
                  <Td>
                    {new Date(appt.birthDate).toLocaleDateString("da-DK")}
                  </Td>
                  <Td>{appt.time}</Td>
                  <Td>
                    <Button
                      backgroundColor="primary.red"
                      color="white"
                      _hover={{ bg: "red.600" }}
                      fontSize="sm"
                      fontWeight="medium"
                      rounded="2xl"
                      px={4}
                      py={2}
                      w="full"
                      maxW="10rem"
                      onClick={() => {
                        setSelectedSymptoms(appt.symptoms);
                        onOpen();
                      }}
                    >
                      Åben
                    </Button>
                  </Td>
                  <Td>
                    <Button
                      backgroundColor="primary.red"
                      color="white"
                      _hover={{ bg: "red.600" }}
                      fontSize="sm"
                      fontWeight="medium"
                      rounded="2xl"
                      px={4}
                      py={2}
                      w="full"
                      maxW="10rem"
                      onClick={() =>
                        navigate(`/doctor/patient-journal?id=${appt.patientId}`)
                      }
                    >
                      Vis
                    </Button>
                  </Td>
                  <Td>
                    <Button
                      borderColor="primary.red"
                      color="primary.red"
                      _hover={{ bg: "red.200" }}
                      fontSize="sm"
                      fontWeight="medium"
                      rounded="2xl"
                      variant={"outline"}
                      px={4}
                      py={2}
                      w="full"
                      maxW={{ md: "3rem", lg: "3.5rem" }}
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
        </Box>
      )}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify={{ base: "center", sm: "space-between" }}
        align="center"
        mt={6}
        gap={{ base: 4, sm: 0 }}
        textAlign="center"
      >
        <Button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          isDisabled={page === 1}
          w={{ base: "full", sm: "auto" }}
        >
          Forrige
        </Button>

        <Text fontSize={{ base: "sm", md: "md" }}>
          Side {data.page} af {data.totalPages} — Viser {data.data.length} ud af{" "}
          {data.total} aftaler
        </Text>

        <Button
          onClick={() => setPage((prev) => Math.min(prev + 1, data.totalPages))}
          isDisabled={page === data.totalPages}
          w={{ base: "full", sm: "auto" }}
        >
          Næste
        </Button>
      </Flex>

      {/* Symptomer Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
        <ModalOverlay />
        <ModalContent borderRadius="xl" px={4} py={2}>
          <ModalHeader fontSize="xl" fontWeight="bold" color="gray.700">
            Symptomer
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              bg="gray.50"
              borderRadius="md"
              p={4}
              border="1px solid"
              borderColor="gray.200"
            >
              <Text fontSize="md" color="gray.700" whiteSpace="pre-wrap">
                {selectedSymptoms && selectedSymptoms.trim() !== ""
                  ? selectedSymptoms
                  : "Ingen sekretær-note angivet"}
              </Text>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Aflysning Alert */}
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
