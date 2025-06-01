import { Box, Button, Text, Badge, Flex } from "@chakra-ui/react";
import { useAiNoteByAppointment } from "@/hooks/doctor/aiHooks/useAiNoteByAppointment";
import { useState } from "react";
import AddJournalEntryModal from "./AddJournalEntryModal";
import JournalModal from "./JournalModal";

const AppointmentBox = ({ appt, journalId, refetch }: any) => {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { data: aiNote } = useAiNoteByAppointment(appt._id);

  const hasAINote = !!aiNote;

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
      <Flex justify="space-between" align="center" mb={2}>
        <Text fontWeight="bold">
          {new Date(appt.date).toLocaleDateString()} kl. {appt.time}
        </Text>
        <Badge>{appt.status}</Badge>
      </Flex>

      <Text>
        <strong>Behandler:</strong> {appt.doctorName}
      </Text>
      <Text>
        <strong>Notat:</strong> {appt.secretaryNote || "Ingen sekretærnotat"}
      </Text>

      {hasAINote && (
        <Badge mt={2} colorScheme="purple">
          Klinika Assistent har forberedt noter
        </Badge>
      )}

      <Flex gap={2} mt={3}>
        {appt.journalEntry?.created_by_ai ? (
          <Button
            size="sm"
            onClick={() => setShowModal(true)}
            colorScheme="purple"
            variant="outline"
          >
            Gennemse AI-noter
          </Button>
        ) : appt.journalEntry ? (
          <Button size="sm" onClick={() => setSelectedEntry(appt.journalEntry)}>
            Vis journal
          </Button>
        ) : (
          <Button size="sm" onClick={() => setShowModal(true)}>
            Opret notat
          </Button>
        )}
      </Flex>

      {selectedEntry && (
        <JournalModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}

      {showModal && (
        <AddJournalEntryModal
          appointmentId={appt._id}
          journalId={journalId}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            refetch();
            setShowModal(false);
          }}
        />
      )}
    </Box>
  );
};

export default AppointmentBox;
