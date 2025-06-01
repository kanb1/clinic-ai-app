import { useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  VStack,
  Badge,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "udført":
        return "green";
      case "aflyst":
        return "red";
      case "bekræftet":
        return "orange";
      default:
        return "gray";
    }
  };

  if (isLoading) return <Spinner size="xl" />;

  return (
    <Layout>
      <Box maxW="6xl" mx="auto" p={6}>
        <Heading mb={6}>Journal for patient</Heading>

        {!isLoadingTests && <TestResultBox results={testResults} />}

        {!isLoadingRx && (
          <Box mb={10}>
            <Heading size="md" mb={4}>
              Recept
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
                colorScheme="blue"
                alignSelf="start"
              >
                + Tilføj recept
              </Button>
            </VStack>
          </Box>
        )}

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
              refetch(); // opdater journaldata efter nyt notat
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
      </Box>
    </Layout>
  );
};

export default PatientJournalPage;
