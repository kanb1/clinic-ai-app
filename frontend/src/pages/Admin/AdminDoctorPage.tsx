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
  SimpleGrid,
  useBreakpointValue,
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
  // bruger mutate til at sende ID
  const { mutate: deleteDoctor } = useDeleteDoctor();
  const gridColumns = useBreakpointValue({ base: 1, sm: 2, md: 3 });
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<IUser | null>(null);
  const [doctorToDelete, setDoctorToDelete] = useState<IUser | null>(null);

  // Chakras useDiscolsure hook til modal-styring:
  const {
    isOpen: isEditOpen, //boolean -> true hvis modal skal vises
    onOpen: onEditOpen, //kalder isOpen = true
    onClose: onEditClose, //kalder isOpen = false
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

  // filtrer doctor efter søgefeltsinput
  // søger både i navn og email
  const filteredDoctors = doctors.filter((doctor) =>
    `${doctor.name} ${doctor.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trimStart().slice(0, 100); // max 100 tegn
    setSearch(value.replace(/[<>]/g, "")); // fjern < og > hvis nogen prøver HTML-lignende input
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
          Administrér Læger
        </Heading>

        <Flex
          justify="space-between"
          mb={4}
          gap={4}
          flexDir={{ base: "column", sm: "row" }}
          alignItems={"center"}
        >
          <Input
            placeholder="Søg efter navn eller email"
            value={search}
            onChange={handleSearchChange}
          />
          <Button variant={"outlineWhite"} onClick={onCreateOpen}>
            + Opret læge
          </Button>
        </Flex>

        {isLoading ? (
          <Spinner />
        ) : (
          <SimpleGrid columns={gridColumns} spacing={4}>
            {" "}
            {filteredDoctors.map((doctor) => (
              <Box
                key={doctor._id}
                borderWidth="1px"
                borderRadius="lg"
                p={6}
                bg="white"
                boxShadow="sm"
                _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                <Heading size="md">{doctor.name}</Heading>

                <Stack spacing={1} fontSize="sm" color="gray.700" mt={3}>
                  <Text>
                    <b>Email:</b> {doctor.email}
                  </Text>
                  <Text>
                    <b>Telefon:</b> {doctor.phone || "Ikke angivet"}
                  </Text>
                </Stack>

                <Flex gap={3} flexDirection={"column"} mt={{ base: 6 }}>
                  <Button
                    variant="solidBlack"
                    onClick={() => handleEditClick(doctor)}
                    width={{ base: "100%", md: "auto" }}
                  >
                    Redigér
                  </Button>
                  <Button
                    variant="solidRed"
                    onClick={() => handleDeleteClick(doctor)}
                    width={{ base: "100%", md: "auto" }}
                  >
                    Slet
                  </Button>
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
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
