import {
  Box,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  Button,
  useBreakpointValue,
  Badge,
  Input,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAdminPatients } from "../../hooks/admin/admin-patientHooks/useAdminPatients";
import Layout from "@/components/layout/Layout";
import EditPatientModal from "../../components/admin/Patients/EditPatientModal";
import { useDisclosure } from "@chakra-ui/react";
import { IUser } from "@/types/user.types";

const AdminPatientPage = () => {
  const { data: patients = [], isLoading, error } = useAdminPatients();
  const gridColumns = useBreakpointValue({ base: 1, sm: 2, md: 3 });
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPatient, setSelectedPatient] = useState<IUser | null>(null);

  const filteredPatients = patients.filter((patient) =>
    `${patient.name} ${patient.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Layout>
      <Box p={6}>
        <Heading size="lg" mb={4}>
          Administrér Patienter
        </Heading>

        <Input
          placeholder="Søg efter navn eller email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          mb={6}
        />

        {isLoading ? (
          <Spinner />
        ) : error ? (
          <Text color="red.500">Kunne ikke hente patientdata.</Text>
        ) : (
          <SimpleGrid columns={gridColumns} spacing={4}>
            {filteredPatients.map((patient) => (
              <Box
                key={patient._id}
                borderWidth="1px"
                borderRadius="md"
                p={4}
                bg="gray.50"
                boxShadow="md"
              >
                <Heading size="sm" mb={2}>
                  {patient.name}
                </Heading>
                <Badge colorScheme="green" mb={2}>
                  {patient.role}
                </Badge>
                <Text>
                  CPR:{" "}
                  {patient.cpr_number
                    ? `${patient.cpr_number.slice(
                        0,
                        6
                      )}-${patient.cpr_number.slice(6)}`
                    : "Ikke oplyst"}
                </Text>
                <Text>Telefon: {patient.phone || "Ikke oplyst"}</Text>
                <Text>Email: {patient.email}</Text>
                <Text>Adresse: {patient.address || "Ikke oplyst"}</Text>
                <Text>
                  Fødselsdato:{" "}
                  {patient.birth_date
                    ? new Date(patient.birth_date).toLocaleDateString("da-DK")
                    : "Ikke oplyst"}
                </Text>
                <Button
                  mt={3}
                  colorScheme="blue"
                  size="sm"
                  onClick={() => {
                    setSelectedPatient(patient);
                    onOpen();
                  }}
                >
                  Redigér
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>
      <EditPatientModal
        isOpen={isOpen}
        onClose={onClose}
        patient={selectedPatient}
      />
    </Layout>
  );
};

export default AdminPatientPage;
