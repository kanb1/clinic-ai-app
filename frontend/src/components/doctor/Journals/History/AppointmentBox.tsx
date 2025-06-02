import { Box, Button, Text, Badge, Flex, Stack } from "@chakra-ui/react";
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
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={5}
      bg="white"
      shadow="sm"
      _hover={{ bg: "gray.50" }}
      w="full"
    >
      <Stack spacing={2}>
        <Flex justify="space-between" align="center">
          <Text fontWeight="medium">
            {new Date(appt.date).toLocaleDateString("da-DK")} kl. {appt.time}
          </Text>
          <Badge colorScheme="gray" textTransform="capitalize">
            {appt.status}
          </Badge>
        </Flex>

        <Text>
          <strong>Behandler:</strong> {appt.doctorName}
        </Text>
        <Text>
          <strong>Sekretærnotat:</strong> {appt.secretaryNote || "Ikke angivet"}
        </Text>

        {hasAINote && (
          <Badge mt={1} colorScheme="purple" w="fit-content">
            KLINIKA ASSISTENT INVOLVERET
          </Badge>
        )}

        <Flex mt={2} gap={2} flexWrap="wrap">
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
              onClick={() => setSelectedEntry(appt.journalEntry)}
            >
              Vis journal
            </Button>
          ) : (
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
              onClick={() => setShowModal(true)}
            >
              Opret notat
            </Button>
          )}
        </Flex>
      </Stack>

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
