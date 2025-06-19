import { Box, Button, Text, Badge, Flex, Stack } from "@chakra-ui/react";
import { useAiNoteByAppointment } from "@/hooks/doctor/aiHooks/useAiNoteByAppointment";
import { useState } from "react";
import AddJournalEntryModal from "./AddJournalEntryModal";
import JournalModal from "./JournalModal";

interface AppointmentBoxProps {
  appt: any;
  onViewJournal: (entry: any) => void;
  onCreateNote: (appointmentId: string) => void;
}

// appt: aftaleobjekt med date, time, entries[entry1, entry2 ] osv
// journalid: bruges hvis nyt notat oprettes
// gives fra parent og bruges efter oprettelse til ny hetnning af data
const AppointmentBox = ({
  appt,
  onViewJournal,
  onCreateNote,
}: AppointmentBoxProps) => {
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

        {/* Condiitonal rendering: Opret notat/vis journal/gennemse ai-noter */}
        <Flex mt={2} gap={2} flexWrap="wrap">
          {/* findes journal, lavet af AI? -> åben addJournalEntryModal for at se det */}
          {appt.journalEntry?.created_by_ai ? (
            <Button
              size="sm"
              onClick={() => onCreateNote(appt._id)}
              colorScheme="purple"
              variant="outline"
            >
              Gennemse AI-noter
            </Button>
          ) : appt.journalEntry ? (
            //Hvis der findes oprettet notat (journalentry) → åbner JournalModal
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
              // callback her, så vi ved hvilken journal der skal åbnes
              // trigger modalen JournalModal i parent
              onClick={() => onViewJournal(appt.journalEntry)}
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
              // callback her, så vi ved hvilken journal der skal åbnes
              // trigger modalen AddJournalEntryModal i parent
              onClick={() => onCreateNote(appt._id)}
            >
              Opret notat
            </Button>
          )}
        </Flex>
      </Stack>
    </Box>
  );
};

export default AppointmentBox;
