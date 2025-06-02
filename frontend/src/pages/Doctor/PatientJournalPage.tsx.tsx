import { useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Spinner,
  Text,
  VStack,
  Stack,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import { usePatientJournalAppointments } from "@/hooks/doctor/journalHooks/usePatientJournalAppointments";
import { useState } from "react";
import JournalModal from "@/components/doctor/Journals/History/JournalModal";
import AddJournalEntryModal from "@/components/doctor/Journals/History/AddJournalEntryModal";
import { useOrCreateJournal } from "@/hooks/doctor/journalHooks/useOrCreateJournal";
import AppointmentBox from "@/components/doctor/Journals/History/AppointmentBox";
import { usePrescriptions } from "@/hooks/doctor/journalHooks/usePrescriptions";
import PrescriptionBox from "@/components/doctor/Journals/Prescriptions/PrescriptionBox";
import AddPrescriptionModal from "@/components/doctor/Journals/Prescriptions/AddPrescriptionModal";
import PrescriptionModal from "@/components/doctor/Journals/Prescriptions/PrescriptionModal";
import { useDoctorTestResults } from "@/hooks/doctor/journalHooks/useDoctorTestResults";
import TestResultBox from "@/components/doctor/Journals/Testresults/TestResultBox";
import Layout from "@/components/layout/Layout";

const PatientJournalPage = () => {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("id") || "";

  const { data: journalMeta } = useOrCreateJournal(patientId);
  const journalId = journalMeta?.journalId || "";

  const {
    data = [],
    isLoading,
    refetch,
  } = usePatientJournalAppointments(patientId);

  const {
    data: prescriptions = [],
    isLoading: isLoadingRx,
    refetch: refetchPrescriptions,
  } = usePrescriptions(patientId);

  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] =
    useState<string>("");
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [showAddPrescription, setShowAddPrescription] = useState(false);

  const { data: testResults = [], isLoading: isLoadingTests } =
    useDoctorTestResults(patientId);

  if (isLoading) return <Spinner size="xl" />;

  return (
    <Layout>
      <Stack spacing={6} w="full" p={{ base: 2, md: 4 }} overflowX="hidden">
        <Heading size="heading1" textAlign={{ base: "center" }}>
          Journal for patient
        </Heading>

        {!isLoadingTests && <TestResultBox results={testResults} />}

        {/* Recepter + Tidligere aftaler side om side */}
        <Flex
          direction={{ base: "column", xl: "row" }}
          gap={{ base: 12, sm: 14, xl: 6 }}
          align="start"
          wrap="wrap"
          w="full"
        >
          {/* Recepter */}
          {!isLoadingRx && (
            <Box flex={1} minW={0} maxW="100%" w="full">
              <Heading size="heading2" mb={3}>
                Recepter
              </Heading>
              <VStack align="stretch" spacing={4}>
                {prescriptions.map((r: any) => (
                  <PrescriptionBox
                    key={r._id}
                    prescription={r}
                    onView={() => setSelectedPrescription(r)}
                  />
                ))}
                <Button
                  onClick={() => setShowAddPrescription(true)}
                  variant={"solidBlack"}
                  alignSelf="end"
                >
                  + Tilføj recept
                </Button>
              </VStack>
            </Box>
          )}

          {/* Tidligere aftaler med scrollbar */}
          <Box flex={1} minW={0} maxW="100%" w="full">
            <Heading size="heading2" mb={3}>
              Tidligere aftaler
            </Heading>
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
              <VStack spacing={4} align="stretch">
                {data.map((appt) => (
                  <AppointmentBox
                    key={appt._id}
                    appt={appt}
                    journalId={journalId}
                    refetch={refetch}
                  />
                ))}
              </VStack>
            </Box>
          </Box>
        </Flex>

        {/* Modals */}
        {selectedEntry && (
          <JournalModal
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
          />
        )}

        {selectedAppointmentId && (
          <AddJournalEntryModal
            appointmentId={selectedAppointmentId}
            journalId={journalId}
            onClose={() => setSelectedAppointmentId("")}
            onSuccess={() => {
              refetch();
              setSelectedAppointmentId("");
            }}
          />
        )}

        {showAddPrescription && (
          <AddPrescriptionModal
            patientId={patientId}
            onClose={() => setShowAddPrescription(false)}
            onSuccess={refetchPrescriptions}
          />
        )}

        {selectedPrescription && (
          <PrescriptionModal
            prescription={selectedPrescription}
            onClose={() => setSelectedPrescription(null)}
          />
        )}
      </Stack>
    </Layout>
  );
};

export default PatientJournalPage;
