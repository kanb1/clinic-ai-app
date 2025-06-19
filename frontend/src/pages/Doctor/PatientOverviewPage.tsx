import Layout from "@/components/layout/Layout";
import { Box, Heading, useDisclosure, Text } from "@chakra-ui/react";
import { usePatients } from "@/hooks/common/usePatients";
import { useNavigate } from "react-router-dom";
import PatientGrid from "@/components/shared/PatientGrid";
import { IUser } from "@/types/user.types";
import { useState } from "react";
import PatientDetailsModal from "@/components/doctor/PatientsOverview/PatientDetailsModal";

const PatientOverviewPage = () => {
  const { data: patients = [], isLoading } = usePatients();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPatient, setSelectedPatient] = useState<IUser | null>(null);
  const navigate = useNavigate();

  // klikker på "Vis patient-info" i PatientGrid
  // fidner aptienten ud fra id -> sætter det som valgt
  const handleViewDetails = (id: string) => {
    const patient = patients.find((p) => p._id === id);
    if (patient) {
      setSelectedPatient(patient);
      onOpen();
    }
  };

  return (
    <Layout>
      <Box p={{ base: 3 }} mt={{ lg: 5, xl: 10 }} maxW="1200px" mx="auto">
        <Heading size="heading1" textAlign="center">
          Patienter & Journaler
        </Heading>
        <Text size="body" textAlign="center" mt={{ base: 2 }} mb={{ base: 6 }}>
          Find patienters journaler og informationer
        </Text>

        <PatientGrid
          patients={patients}
          isLoading={isLoading}
          primaryLabel="Åben journal"
          onPrimaryAction={(id) => navigate(`/doctor/patient-journal?id=${id}`)}
          onSecondaryAction={handleViewDetails}
          secondaryLabel="Vis patient-info"
        />

        <PatientDetailsModal
          isOpen={isOpen}
          onClose={onClose}
          patient={selectedPatient}
        />
      </Box>
    </Layout>
  );
};

export default PatientOverviewPage;
