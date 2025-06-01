// src/pages/Doctor/PatientJournalPage.tsx
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
import JournalModal from "@/components/doctor/Journals/JournalModal";
import AddJournalEntryModal from "@/components/doctor/Journals/AddJournalEntryModal";
import { useOrCreateJournal } from "@/hooks/doctor/journalHooks/useOrCreateJournal";
import AppointmentBox from "@/components/doctor/Journals/AppointmentBox";
import { usePrescriptions } from "@/hooks/doctor/journalHooks/usePrescriptions";
import PrescriptionBox from "@/components/doctor/Journals/PrescriptionBox";

const PatientJournalPage = () => {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("id") || "";

  const { data: journalMeta } = useOrCreateJournal(patientId);
  const journalId = journalMeta?.journalId || "";
  const { data: prescriptions = [], isLoading: isLoadingRx } =
    usePrescriptions(patientId);

  const {
    data = [],
    isLoading,
    refetch,
  } = usePatientJournalAppointments(patientId);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] =
    useState<string>("");

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
    <Box maxW="6xl" mx="auto" p={6}>
      <Heading mb={6}>Journal for patient</Heading>
      {!isLoadingRx && <PrescriptionBox prescriptions={prescriptions} />}

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
    </Box>
  );
};

export default PatientJournalPage;
