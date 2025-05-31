import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Spinner,
  Stack,
  Button,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";

import Layout from "@/components/layout/Layout";
import { useUpcomingAppointments } from "@/hooks/patient/mypageHooks/useUpcomingAppointments";
import { usePrescriptions } from "@/hooks/patient/mypageHooks/usePrescriptions";
import { useUnreadMessages } from "@/hooks/patient/mypageHooks/useUnreadMessages";
import { useConfirmAppointment } from "@/hooks/patient/mypageHooks/useConfirmAppointment";
import { useCancelAppointment } from "@/hooks/patient/mypageHooks/useCancelAppointment";
import { useMarkMessageAsRead } from "@/hooks/patient/mypageHooks/useMarkMessageAsRead";
import moment from "moment";
import { useState } from "react";

const PatientMyAppointments = () => {
  const toast = useToast();

  // Appointments
  const { data: appointments = [], isLoading: loadingAppointments } =
    useUpcomingAppointments();
  const { mutate: confirmAppointment, isPending: isConfirming } =
    useConfirmAppointment();
  const { mutate: cancelAppointment, isPending: isCancelling } =
    useCancelAppointment();

  // Prescriptions
  const { data: prescriptions = [], isLoading: loadingPrescriptions } =
    usePrescriptions();

  // Messages
  const {
    data: messages = [],
    isLoading: loadingMessages,
    refetch,
  } = useUnreadMessages();
  const { mutate: markAsRead } = useMarkMessageAsRead();

  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const handleOpenMessage = (msg: any) => {
    setSelectedMessage(msg);
    onOpen();

    // Markér som læst direkte
    markAsRead(msg._id, {
      onSuccess: () => {
        refetch(); // refetch beskeder
      },
    });
  };

  return (
    <Layout>
      <Box p={10}>
        <Heading size="lg" mb={6}>
          Mine aftaler
        </Heading>

        {/* Aftaler */}
        <Heading size="md" mb={2}>
          Kommende aftaler
        </Heading>
        {loadingAppointments ? (
          <Spinner />
        ) : appointments.length === 0 ? (
          <Text>Du har ingen kommende aftaler.</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {appointments.map((appt: any) => (
              <Box key={appt._id} borderWidth="1px" p={4} borderRadius="md">
                <Text fontWeight="bold">
                  {moment(appt.date).format("DD/MM/YYYY")} – {appt.time}
                </Text>
                <Text>Behandler: {appt.doctor_id.name}</Text>
                <Text>Status: {appt.status}</Text>

                {appt.status === "venter" && (
                  <Stack direction="row" mt={3}>
                    <Button
                      colorScheme="green"
                      size="sm"
                      onClick={() =>
                        confirmAppointment(appt._id, {
                          onSuccess: () =>
                            toast({
                              title: "Aftale bekræftet.",
                              status: "success",
                              duration: 3000,
                              isClosable: true,
                            }),
                        })
                      }
                      isLoading={isConfirming}
                    >
                      Bekræft
                    </Button>
                    <Button
                      colorScheme="red"
                      size="sm"
                      onClick={() =>
                        cancelAppointment(appt._id, {
                          onSuccess: () =>
                            toast({
                              title: "Aftale aflyst.",
                              status: "info",
                              duration: 3000,
                              isClosable: true,
                            }),
                        })
                      }
                      isLoading={isCancelling}
                    >
                      Aflys
                    </Button>
                  </Stack>
                )}

                {appt.status === "bekræftet" && (
                  <Button
                    colorScheme="red"
                    size="sm"
                    mt={3}
                    onClick={() =>
                      cancelAppointment(appt._id, {
                        onSuccess: () =>
                          toast({
                            title: "Aftale aflyst.",
                            status: "info",
                            duration: 3000,
                            isClosable: true,
                          }),
                      })
                    }
                    isLoading={isCancelling}
                  >
                    Aflys
                  </Button>
                )}
              </Box>
            ))}
          </SimpleGrid>
        )}

        {/* Recepter */}
        <Heading size="md" mt={10} mb={2}>
          Mine recepter
        </Heading>
        {loadingPrescriptions ? (
          <Spinner />
        ) : prescriptions.length === 0 ? (
          <Text>Ingen aktive recepter.</Text>
        ) : (
          <Stack spacing={3}>
            {prescriptions.map((rx: any) => (
              <Box key={rx._id} borderWidth="1px" p={4} borderRadius="md">
                <Text fontWeight="bold">{rx.title}</Text>
                <Text>Beskrivelse: {rx.description}</Text>
                <Text>
                  Udløber: {moment(rx.expires).format("DD/MM/YYYY")} –{" "}
                  <strong>{rx.status}</strong>
                </Text>
              </Box>
            ))}
          </Stack>
        )}
        {/* Beskeder */}
        <Heading size="md" mt={10} mb={2}>
          Nye beskeder
        </Heading>

        {loadingMessages ? (
          <Spinner />
        ) : messages.length === 0 ? (
          <Text>Ingen nye beskeder.</Text>
        ) : (
          <Stack spacing={3}>
            {messages.map((msg: any) => (
              <Box key={msg._id} borderWidth="1px" p={4} borderRadius="md">
                <Text fontWeight="semibold" isTruncated>
                  {msg.content}
                </Text>
                <Button
                  colorScheme="blue"
                  size="sm"
                  mt={2}
                  onClick={() => handleOpenMessage(msg)}
                >
                  Åben
                </Button>
              </Box>
            ))}
          </Stack>
        )}

        {/* Modal som mark as read*/}
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Ny besked</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Text whiteSpace="pre-line">
                {selectedMessage?.content || "Ingen besked valgt."}
              </Text>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Layout>
  );
};

export default PatientMyAppointments;
