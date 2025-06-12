import {
  Box,
  Heading,
  Text,
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
import PrescriptionCard from "@/components/patient/MyPage/PrescriptionCard";
import MessageCard from "@/components/patient/MyPage/MessageCard";

import { useUpcomingAppointments } from "@/hooks/patient/mypageHooks/useUpcomingAppointments";
import { usePrescriptions } from "@/hooks/patient/mypageHooks/usePrescriptions";
import { useUnreadMessages } from "@/hooks/patient/mypageHooks/useUnreadMessages";

import { useMarkMessageAsRead } from "@/hooks/patient/mypageHooks/useMarkMessageAsRead";

import { useState } from "react";
import { IMessage } from "@/types/message.types";
import { useAuth } from "@/context/AuthContext";
import PatientUpcomingAppointmentsCarousel from "@/components/patient/MyPage/PatientUpcomingAppointmentsCarousel";

const PatientMyAppointments = () => {
  const toast = useToast();
  const { isAuthReady, user } = useAuth();
  const patientId = isAuthReady && user ? user._id : undefined;

  const { data: appointments = [], isLoading: loadingAppointments } =
    useUpcomingAppointments();

  const { data: prescriptions = [], isLoading: loadingPrescriptions } =
    usePrescriptions(patientId, !!patientId);
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
    markAsRead(msg._id, { onSuccess: () => refetch() });
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
      <Stack spacing={6} w="full" p={{ base: 2, md: 4 }}>
        <Heading size="heading1" textAlign={{ base: "center" }}>
          Min side
        </Heading>
        <Box w="full" minW={0}>
          <Heading size="heading2" mb={3}>
            Kommende aftaler
          </Heading>
          {loadingAppointments ? (
            <Spinner />
          ) : appointments.length === 0 ? (
            <Text>Du har ingen kommende aftaler.</Text>
          ) : (
            <PatientUpcomingAppointmentsCarousel
              appointments={appointments}
              isLoading={loadingAppointments}
              refetch={refetch}
            />
          )}
        </Box>
        {/* Beskeder + Recepter */}
        <Stack
          direction={{ base: "column", xl: "row" }}
          spacing={{ base: 12, sm: 14, xl: 6 }}
          align="start"
          wrap="wrap"
          w="full"
          pt={{ base: 10, sm: 8, xl: 4 }}
        >
          {/* Nye beskeder */}
          <Box flex={1} minW={0} maxW="100%" w="full">
            <Heading size="heading2" mb={3}>
              Nye beskeder
            </Heading>

            {loadingMessages ? (
              <Spinner />
            ) : messages.length === 0 ? (
              <Text>Ingen nye beskeder.</Text>
            ) : (
              <Box
                maxH={{ base: "60vh", md: "70vh", xl: "55vh" }}
                overflowY="auto"
                pr={2}
                sx={{
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "gray.100",
                    borderRadius: "full",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "gray.400",
                    borderRadius: "full",
                  },
                }}
              >
                <Stack spacing={4}>
                  {messages.map((msg: any) => (
                    <MessageCard
                      key={msg._id}
                      msg={msg}
                      onOpenMessage={handleOpenMessage}
                      onMarkAsRead={(id) =>
                        markAsRead(id, {
                          onSuccess: async () => {
                            await refetch();
                            toast({
                              title: "Besked markeret som læst",
                              status: "success",
                            });
                          },
                        })
                      }
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>

          {/* Recepter */}
          <Box flex={1} minW={0} maxW="100%" w="full">
            <Heading size="heading2" mb={3}>
              Mine recepter
            </Heading>
            {loadingPrescriptions ? (
              <Spinner />
            ) : prescriptions.length === 0 ? (
              <Text>Ingen aktive recepter.</Text>
            ) : (
              <Box
                maxH={{ base: "60vh", md: "70vh", xl: "55vh" }}
                overflowY="auto"
                pr={2}
                sx={{
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "gray.100",
                    borderRadius: "full",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "gray.400",
                    borderRadius: "full",
                  },
                }}
              >
                <Stack spacing={3}>
                  {prescriptions.map((rx: any) => (
                    <PrescriptionCard key={rx._id} prescription={rx} />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Stack>
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
      </Stack>
    </Layout>
  );
};

export default PatientMyAppointments;
