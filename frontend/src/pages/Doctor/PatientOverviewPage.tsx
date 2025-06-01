import Layout from "@/components/layout/Layout";
import { Box, Heading, useDisclosure } from "@chakra-ui/react";
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

  const handleViewDetails = (id: string) => {
    const patient = patients.find((p) => p._id === id);
    if (patient) {
      setSelectedPatient(patient);
      onOpen();
    }
  };

  return (
    <Layout>
      <Box p={10} maxW="1200px" mx="auto">
        <Heading size="lg" mb={6}>
          Patienter & Journaler
        </Heading>

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
