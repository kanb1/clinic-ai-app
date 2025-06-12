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
  useToast,
  Flex,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Stack,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useAdminPatients } from "../../hooks/admin/admin-patientHooks/useAdminPatients";
import Layout from "@/components/layout/Layout";
import EditPatientModal from "../../components/admin/Patients/EditPatientModal";
import { useDisclosure } from "@chakra-ui/react";
import { IUser } from "@/types/user.types";
import { useDeletePatient } from "@/hooks/admin/admin-patientHooks/useDeletePatient";

const AdminPatientPage = () => {
  const toast = useToast();
  const { data: patients = [], isLoading, error } = useAdminPatients();
  const gridColumns = useBreakpointValue({ base: 1, sm: 2, md: 3 });
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPatient, setSelectedPatient] = useState<IUser | null>(null);

  const cancelRef = useRef(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [patientToDelete, setPatientToDelete] = useState<IUser | null>(null);

  const filteredPatients = patients.filter((patient) =>
    `${patient.name} ${patient.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const { mutate: deletePatient } = useDeletePatient();

  const handleDeleteClick = (patient: IUser) => {
    setPatientToDelete(patient);
    onDeleteOpen();
  };

  const handleConfirmDelete = () => {
    if (!patientToDelete) return;

    deletePatient(patientToDelete._id, {
      onSuccess: () => {
        toast({
          title: "Patient slettet",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onDeleteClose();
      },
      onError: () => {
        toast({
          title: "Noget gik galt",
          description: "Kunne ikke slette patienten",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trimStart().slice(0, 100);
    setSearch(value.replace(/[<>]/g, ""));
  };

  return (
    <Layout>
      <Box
        w="full"
        maxW={{ base: "100%" }}
        textAlign="center"
        mt={{ base: 3 }}
        p={{ lg: 5 }}
      >
        <Heading size="lg" mb={4} textAlign={"center"}>
          Administrér Patienter
        </Heading>

        <Input
          placeholder="Søg efter navn eller email"
          value={search}
          onChange={handleSearchChange}
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
                borderRadius="lg"
                p={6}
                bg="white"
                boxShadow="sm"
                _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                <Heading size="md">{patient.name}</Heading>

                <Stack spacing={1} fontSize="sm" color="gray.700" mt={3}>
                  <Text>
                    <b>CPR:</b>{" "}
                    {patient.cpr_number
                      ? `${patient.cpr_number.slice(
                          0,
                          6
                        )}-${patient.cpr_number.slice(6)}`
                      : "Ikke oplyst"}
                  </Text>
                  <Text>
                    <b>Telefon:</b> {patient.phone || "Ikke oplyst"}
                  </Text>
                  <Text>
                    <b>Email:</b> {patient.email}
                  </Text>
                  <Text>
                    <b>Adresse:</b> {patient.address || "Ikke oplyst"}
                  </Text>
                  <Text>
                    <b>Fødselsdato:</b>{" "}
                    {patient.birth_date
                      ? new Date(patient.birth_date).toLocaleDateString("da-DK")
                      : "Ikke oplyst"}
                  </Text>
                </Stack>

                <Flex gap={3} mt={8} flexDirection={"column"}>
                  <Button
                    variant="solidBlack"
                    onClick={() => {
                      setSelectedPatient(patient);
                      onOpen();
                    }}
                  >
                    Redigér
                  </Button>
                  <Button
                    variant="solidRed"
                    onClick={() => handleDeleteClick(patient)}
                  >
                    Slet
                  </Button>
                </Flex>
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

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Slet patient
            </AlertDialogHeader>

            <AlertDialogBody>
              Er du sikker på, at du vil slette{" "}
              <strong>{patientToDelete?.name}</strong>?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Annuller
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Slet
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Layout>
  );
};

export default AdminPatientPage;
