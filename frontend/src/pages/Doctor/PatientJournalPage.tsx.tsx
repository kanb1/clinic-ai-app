import { useJournalDetails } from "@/hooks/doctor/journalHooks/useJournalDetails";
import { useOrCreateJournal } from "@/hooks/doctor/journalHooks/useOrCreateJournal";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Box, Button, Flex, Heading, Spinner, Text } from "@chakra-ui/react";
import AddJournalEntryModal from "@/components/doctor/Journals/AddJournalEntryModal";
import JournalModal from "@/components/doctor/Journals/JournalModal";
import { IJournalEntry } from "@/types/journal.types";

const PatientJournalPage = () => {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("id") || "";

  const { data: journalData, isLoading: isJournalLoading } =
    useOrCreateJournal(patientId);
  const journalId = journalData?.journalId;

  const { data: journalEntries = [], isLoading } = useJournalDetails(
    journalId || ""
  );

  const [selectedEntry, setSelectedEntry] = useState<IJournalEntry | null>(
    null
  );
  const [selectedAppointmentId, setSelectedAppointmentId] =
    useState<string>("");

  if (isLoading || isJournalLoading) {
    return (
      <Flex justify="center" mt={10}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box maxW="800px" mx="auto" mt={6} px={4}>
      <Heading size="lg" mb={6}>
        Journal for patient
      </Heading>

      {journalEntries.length === 0 ? (
        <Text>Der er endnu ingen journalnotater for denne patient.</Text>
      ) : (
        journalEntries.map((entry) => (
          <Box key={entry.id} borderWidth="1px" borderRadius="md" p={4} mb={4}>
            <Text fontWeight="semibold" mb={1}>
              {entry.appointmentDate} – {entry.doctorName}
            </Text>
            <Text fontWeight="bold" color="gray.600" mb={2}>
              {entry.createdByAI ? "AI-notat" : "Læge-notat"}
            </Text>
            <Flex gap={3}>
              {entry.createdByAI ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setSelectedAppointmentId(entry.appointmentId || "")
                  }
                >
                  Gennemse AI-noter
                </Button>
              ) : (
                <Button size="sm" onClick={() => setSelectedEntry(entry)}>
                  Vis journal
                </Button>
              )}
            </Flex>
          </Box>
        ))
      )}

      {/* Modal til visning af lægens notat */}
      {selectedEntry && (
        <JournalModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}

      {/* Modal til tilføjelse af AI-notat til journal */}
      {selectedAppointmentId && journalId && (
        <AddJournalEntryModal
          appointmentId={selectedAppointmentId}
          journalId={journalId}
          onClose={() => setSelectedAppointmentId("")}
        />
      )}
    </Box>
  );
};

export default PatientJournalPage;
