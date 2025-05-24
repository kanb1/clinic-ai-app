import {
  Box,
  Button,
  Grid,
  Heading,
  Input,
  Spinner,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { usePatients } from "../../hooks/common/usePatients";
import MessageModal from "../../components/secretary/Messages/MessageModal";
import Layout from "@/components/layout/Layout";

const MessagePage = () => {
  const { data: patients, isLoading } = usePatients();
  // States til søgning
  const [search, setSearch] = useState(""); //hvad brugeren søger
  // id’et på den patient man klikker på (bruges til at sende individuel besked)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );
  // styrer om modal er åben/lukket
  const { isOpen, onOpen, onClose } = useDisclosure();
  // angiver hvilken gruppe beskeden sendes til
  const [receiverScope, setReceiverScope] = useState<"patients" | "individual">(
    "patients"
  );

  //filtrerer listen af patienter ud fra søgefeltet – insensitiv søgning.
  const filteredPatients = patients?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // *****Klik funktioner******
  // Åbner modal til alle patienter
  const handleOpenAllPatientsModal = () => {
    setReceiverScope("patients");
    setSelectedPatientId(null);
    onOpen();
  };

  // Åbner modal til en specifik patient
  const handleOpenIndividualModal = (patientId: string) => {
    setReceiverScope("individual");
    setSelectedPatientId(patientId);
    onOpen();
  };

  return (
    <Layout>
      <Box p={8}>
        <Heading mb={6}>Send en besked</Heading>

        {/* Knap til at åbne modal for fællesbesked */}
        <Button mb={4} onClick={handleOpenAllPatientsModal} colorScheme="blue">
          + Ny besked til alle patienter
        </Button>

        {/* Søgefelt med state-binding. */}
        {/* sttatebinding: kobler en værdi i ui sammen med komponentens (state) */}
        <Input
          placeholder="Søg efter patient"
          //  {/* search er vores nuværende state variabel og value fortæller at vis værdien af search fra inputfeltet */}
          value={search}
          // Når brugeren skriver noget, så opdater state
          onChange={(e) => setSearch(e.target.value)}
          mb={6}
        />

        {/* Viser en spinner mens patienter hentes, ellers vises grid-layout med cards på users */}
        {isLoading ? (
          <Spinner />
        ) : (
          <Grid templateColumns="repeat(auto-fill, minmax(220px, 1fr))" gap={4}>
            {/* patientkort */}
            {filteredPatients?.map((patient) => (
              <Box
                key={patient._id}
                p={4}
                bg="gray.100"
                borderRadius="md"
                boxShadow="sm"
              >
                <Text fontWeight="bold">{patient.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  {patient.birth_date
                    ? new Date(patient.birth_date).toLocaleDateString("da-DK")
                    : "Ingen fødselsdato"}
                </Text>
                <Button
                  size="sm"
                  mt={2}
                  variant="outline"
                  onClick={() => handleOpenIndividualModal(patient._id)}
                >
                  Send besked
                </Button>
              </Box>
            ))}
          </Grid>
        )}

        {/* modalen der åbnes - receiver er enten specifik patient eller alle patienter */}
        <MessageModal
          isOpen={isOpen}
          onClose={onClose}
          receiverScope={receiverScope}
          receiverId={selectedPatientId || undefined}
        />
      </Box>
    </Layout>
  );
};

export default MessagePage;
