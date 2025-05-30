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
  useDisclosure,
  useToast,
  Flex,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { useAdminDoctors } from "../../hooks/admin/admin-doctorHooks/useAdminDoctors";
import { useDeleteDoctor } from "../../hooks/admin/admin-doctorHooks/useDeleteDoctor";
import { IUser } from "@/types/user.types";
import Layout from "@/components/layout/Layout";
import EditDoctorModal from "../../components/admin/Doctors/EditDoctorModal";

const AdminDoctorPage = () => {
  const toast = useToast();
  const { data: doctors = [], isLoading, error } = useAdminDoctors();
  const gridColumns = useBreakpointValue({ base: 1, sm: 2, md: 3 });
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<IUser | null>(null);
  const [doctorToDelete, setDoctorToDelete] = useState<IUser | null>(null);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef(null);
  const { mutate: deleteDoctor } = useDeleteDoctor();

  const filteredDoctors = doctors.filter((doctor) =>
    `${doctor.name} ${doctor.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (!doctorToDelete) return;
    deleteDoctor(doctorToDelete._id, {
      onSuccess: () => {
        toast({
          title: "Læge slettet",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setDoctorToDelete(null);
        onDeleteClose();
      },
      onError: () => {
        toast({
          title: "Noget gik galt",
          description: "Kunne ikke slette lægen",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  return (
    <Layout>
      <Box p={6}>
        <Heading size="lg" mb={4}>
          Administrér Læger
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
          <Text color="red.500">Kunne ikke hente lægedata.</Text>
        ) : (
          <SimpleGrid columns={gridColumns} spacing={4}>
            {filteredDoctors.map((doctor) => (
              <Box
                key={doctor._id}
                borderWidth="1px"
                borderRadius="md"
                p={4}
                bg="gray.50"
                boxShadow="md"
              >
                <Heading size="sm" mb={2}>
                  {doctor.name}
                </Heading>
                <Badge colorScheme="purple" mb={2}>
                  {doctor.role}
                </Badge>
                <Text>Email: {doctor.email}</Text>
                <Text>Telefon: {doctor.phone || "Ikke oplyst"}</Text>
                <Flex gap={2} mt={3}>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      onEditOpen();
                    }}
                  >
                    Redigér
                  </Button>
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={() => {
                      setDoctorToDelete(doctor);
                      onDeleteOpen();
                    }}
                  >
                    Slet
                  </Button>
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>

      <EditDoctorModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        doctor={selectedDoctor}
      />

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Bekræft sletning
            </AlertDialogHeader>

            <AlertDialogBody>
              Er du sikker på, at du vil slette denne læge?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Annuller
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Slet
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Layout>
  );
};

export default AdminDoctorPage;
