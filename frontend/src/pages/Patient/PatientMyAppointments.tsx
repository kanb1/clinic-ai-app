import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Spinner,
  Stack,
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
import AppointmentCard from "@/components/patient/MyPage/AppointmentCard";
import PrescriptionCard from "@/components/patient/MyPage/PrescriptionCard";
import MessageCard from "@/components/patient/MyPage/MessageCard";

import { useUpcomingAppointments } from "@/hooks/patient/mypageHooks/useUpcomingAppointments";
import { usePrescriptions } from "@/hooks/patient/mypageHooks/usePrescriptions";
import { useUnreadMessages } from "@/hooks/patient/mypageHooks/useUnreadMessages";
import { useConfirmAppointment } from "@/hooks/patient/mypageHooks/useConfirmAppointment";
import { useCancelAppointment } from "@/hooks/patient/mypageHooks/useCancelAppointment";
import { useMarkMessageAsRead } from "@/hooks/patient/mypageHooks/useMarkMessageAsRead";

import { useState } from "react";
import { IMessage } from "@/types/message.types";
import { IAppointment } from "@/types/appointment.types";
import { useAuth } from "@/context/AuthContext";

const PatientMyAppointments = () => {
  const toast = useToast();
  const { isAuthReady, user } = useAuth();

  const patientId = isAuthReady && user ? user._id : undefined;

  // Appointments
  const { data: appointments = [], isLoading: loadingAppointments } =
    useUpcomingAppointments();
  const { mutate: confirmAppointment, isPending: isConfirming } =
    useConfirmAppointment();
  const { mutate: cancelAppointment, isPending: isCancelling } =
    useCancelAppointment();

  // Prescriptions – kun når patientId er klar
  const { data: prescriptions = [], isLoading: loadingPrescriptions } =
    usePrescriptions(patientId, !!patientId);

  // Messages
  const {
    data: messages = [],
    isLoading: loadingMessages,
    refetch,
  } = useUnreadMessages();
  const { mutate: markAsRead } = useMarkMessageAsRead();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedMessage, setSelectedMessage] = useState<IMessage | null>(null);

  const handleOpenMessage = (msg: any) => {
    setSelectedMessage(msg);
    onOpen();

    markAsRead(msg._id, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  if (!isAuthReady) {
    return (
      <Layout>
        <Box p={10}>
          <Spinner />
        </Box>
      </Layout>
    );
  }

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
            {appointments.map((appt: IAppointment) => (
              <AppointmentCard
                key={appt._id}
                appt={appt}
                onConfirm={(id) =>
                  confirmAppointment(id, {
                    onSuccess: () =>
                      toast({
                        title: "Aftale bekræftet.",
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                      }),
                  })
                }
                onCancel={(id) =>
                  cancelAppointment(id, {
                    onSuccess: () =>
                      toast({
                        title: "Aftale aflyst.",
                        status: "info",
                        duration: 3000,
                        isClosable: true,
                      }),
                  })
                }
                isLoading={isConfirming || isCancelling}
              />
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
              <PrescriptionCard key={rx._id} prescription={rx} />
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
              <MessageCard
                key={msg._id}
                msg={msg}
                onOpenMessage={handleOpenMessage}
              />
            ))}
          </Stack>
        )}

        {/* Modal */}
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
