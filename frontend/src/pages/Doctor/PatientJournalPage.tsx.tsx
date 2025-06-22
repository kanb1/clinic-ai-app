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
import { useAuth } from "@/context/AuthContext";

// page her: styrer al global tilstand, holder styr på Modals
// childsene, boxene: får data og funktioner (props) og "beder" parent om at åbne modal via callback funktion
//modaler: vises kun hvis state har indhold

// Denne her side:
// viser patientesn navn og journal-relateret data (aftaler, recepter osv)
// viser modals, hivs vi har valgt noget

const PatientJournalPage = () => {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("id") || "";

  // hook finder/opretter en journal for denne patietn
  const { data: journalMeta } = useOrCreateJournal(patientId);
  const journalId = journalMeta?.journalId || "";

  // appointments med journalerne
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
          {journalMeta?.patientName || "Patient"}
        </Heading>

        {/* *******Boxes med knapper******* */}
        {/* *******Boxes med knapper******* */}
        {/* *******Boxes med knapper******* */}

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
              <Flex justify="space-between" align="center" mb={3}>
                <Heading size="heading2">Recepter</Heading>
                <Button
                  variant={"solidBlack"}
                  size="sm"
                  // vi sætter state setShowAddPrescription (true)
                  // kører AddPrescriptionModal længere nede
                  onClick={() => setShowAddPrescription(true)}
                >
                  + Opret recept
                </Button>
              </Flex>
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
                <VStack align="stretch" spacing={4}>
                  {prescriptions.map((r: any) => (
                    // box med knap "vis detaljer" -> onView
                    <PrescriptionBox
                      key={r._id}
                      // prescription-data
                      prescription={r}
                      // callback til children her: OnView()
                      // klikkes på knappen "Vis detaljer"(OnView)?
                      // setSelectedPrescription sætter værdi -> trigger AddPrescriptionBox modal længere nede
                      onView={() => setSelectedPrescription(r)}
                    />
                  ))}
                </VStack>
              </Box>
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
              {/* FORBEDRINGER - Sender onviewjou/oncreateno som props - styrer modaler kun i parent (her) */}
              <VStack spacing={4} align="stretch">
                {/* data: mapper liste med patientens tidligere aftaler */}
                {data.map((appt) => (
                  // appointments med "vis journal/opret notat"-knap
                  <AppointmentBox
                    key={appt._id}
                    //aftale-dato med sekretærnote, journal osv
                    appt={appt}
                    // når onViewJournal kaldes (via knap) i Appbox -> opdatereres selectedentry state
                    // aktiverer visning af modal længere nede
                    onViewJournal={(entry) => setSelectedEntry(entry)}
                    // samme her bare for AddJournalEntryModal
                    onCreateNote={(appointmentId) =>
                      setSelectedAppointmentId(appointmentId)
                    }
                  />
                  // disse bokse trigger forskellige mdoals længere nede!
                ))}
              </VStack>
            </Box>
          </Box>
        </Flex>

        {/* *******Modals******* */}
        {/* *******Modals******* */}
        {/* *******Modals******* */}

        {/* vises når man klikker "Vis journal" i app.box */}
        {/* selectedEntry bliver sat til journal-entry, og denne modal åbnes */}
        {selectedEntry && (
          <JournalModal
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
          />
        )}

        {/* vises når man klikker "opret notat"/"gennemse noter" */}
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

        {/* vises når man klikker "opret recept" */}
        {/* er showAddPrescription true? er det blevet klikket på knappen "Tilføj recept" -> render denne kompoennt */}
        {showAddPrescription && (
          <AddPrescriptionModal
            patientId={patientId}
            onClose={() => setShowAddPrescription(false)}
            onSuccess={refetchPrescriptions}
          />
        )}

        {/* presmodal -> vis receptdetaljer */}
        {/* selectedPrescription bliver true pga PresBox */}
        {/* PrescModal bliver vist */}
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
