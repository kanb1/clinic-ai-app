import {
  Box,
  Heading,
  Text,
  Stack,
  Button,
  useDisclosure,
  useToast,
  Spinner,
  Input,
  Flex,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useAdminDoctors } from "@/hooks/admin/admin-doctorHooks/useAdminDoctors";
import { useDeleteDoctor } from "@/hooks/admin/admin-doctorHooks/useDeleteDoctor";
import { IUser } from "@/types/user.types";
import EditDoctorModal from "@/components/admin/Doctors/EditDoctorModal";
import CreateDoctorModal from "@/components/admin/Doctors/CreateDoctorModal";
import Layout from "@/components/layout/Layout";

const AdminDoctorPage = () => {
  const { data: doctors = [], isLoading } = useAdminDoctors();
  const toast = useToast();
  const { mutate: deleteDoctor } = useDeleteDoctor();

  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<IUser | null>(null);
  const [doctorToDelete, setDoctorToDelete] = useState<IUser | null>(null);

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const cancelRef = useRef(null);

  const handleEditClick = (doctor: IUser) => {
    setSelectedDoctor(doctor);
    onEditOpen();
  };

  const handleDeleteClick = (doctor: IUser) => {
    setDoctorToDelete(doctor);
    onDeleteOpen();
  };

  const confirmDelete = () => {
    if (!doctorToDelete) return;

    deleteDoctor(doctorToDelete._id, {
      onSuccess: () => {
        toast({
          title: "Læge slettet",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onDeleteClose();
        setDoctorToDelete(null);
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

  const filteredDoctors = doctors.filter((doctor) =>
    `${doctor.name} ${doctor.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Layout>
      <Box p={8}>
        <Heading mb={6}>Administrér Læger</Heading>

        <Flex
          justify="space-between"
          mb={4}
          gap={4}
          flexDir={{ base: "column", sm: "row" }}
        >
          <Input
            placeholder="Søg efter navn eller email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button colorScheme="green" onClick={onCreateOpen}>
            + Opret læge
          </Button>
        </Flex>

        {isLoading ? (
          <Spinner />
        ) : (
          <Stack spacing={4}>
            {filteredDoctors.map((doctor) => (
              <Box
                key={doctor._id}
                borderWidth="1px"
                borderRadius="lg"
                p={4}
                boxShadow="sm"
              >
                <Text fontWeight="bold">{doctor.name}</Text>
                <Text>Email: {doctor.email}</Text>
                <Text>Telefon: {doctor.phone || "Ikke angivet"}</Text>

                <Flex mt={3} gap={2}>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => handleEditClick(doctor)}
                  >
                    Rediger
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDeleteClick(doctor)}
                  >
                    Slet
                  </Button>
                </Flex>
              </Box>
            ))}
          </Stack>
        )}

        <EditDoctorModal
          isOpen={isEditOpen}
          onClose={onEditClose}
          doctor={selectedDoctor}
        />

        <CreateDoctorModal isOpen={isCreateOpen} onClose={onCreateClose} />

        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Slet læge
              </AlertDialogHeader>

              <AlertDialogBody>
                Er du sikker på, at du vil slette{" "}
                <strong>{doctorToDelete?.name}</strong>? Denne handling kan ikke
                fortrydes.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onDeleteClose}>
                  Annuller
                </Button>
                <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                  Slet
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </Layout>
  );
};

export default AdminDoctorPage;
