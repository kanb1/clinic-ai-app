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
      <VStack spacing={4} align="stretch">
        {data.map((appt) => (
          <Box
            key={appt._id}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            bg="gray.50"
            _hover={{ bg: "gray.100" }}
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontWeight="bold">
                {new Date(appt.date).toLocaleDateString()} kl. {appt.time}
              </Text>
              <Badge colorScheme={getStatusColor(appt.status)}>
                {appt.status}
              </Badge>
            </Flex>
            <Text mb={1}>
              <strong>Behandler:</strong> {appt.doctorName}
            </Text>
            <Text mb={3}>
              <strong>Notat:</strong>{" "}
              {appt.secretaryNote ? appt.secretaryNote : "Ingen sekretærnotat"}
            </Text>
            <Flex gap={3}>
              {appt.journalEntry?.created_by_ai ? (
                <Button
                  size="sm"
                  onClick={() => setSelectedAppointmentId(appt._id)}
                  colorScheme="purple"
                  variant="outline"
                >
                  Gennemse AI-noter
                </Button>
              ) : appt.journalEntry ? (
                <Button
                  size="sm"
                  onClick={() => setSelectedEntry(appt.journalEntry)}
                  colorScheme="blue"
                >
                  Vis journal
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setSelectedAppointmentId(appt._id)}
                  colorScheme="blue"
                >
                  Opret notat
                </Button>
              )}
            </Flex>
          </Box>
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
