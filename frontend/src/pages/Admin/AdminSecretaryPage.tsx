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
import { useRef } from "react";

import { useState } from "react";
import { useAdminSecretaries } from "@/hooks/admin/admin-secretaryHooks/useAdminSecretaries";
import { IUser } from "@/types/user.types";
import EditSecretaryModal from "@/components/admin/Secretaries/EditSecretaryModal";
import CreateSecretaryModal from "@/components/admin/Secretaries/AddSecretaryModal";
import { useDeleteSecretary } from "@/hooks/admin/admin-secretaryHooks/useDeleteSecretary";
import Layout from "@/components/layout/Layout";

const AdminSecretaryPage = () => {
  const { data: secretaries = [], isLoading } = useAdminSecretaries();
  const toast = useToast();
  const { mutate: deleteSecretary } = useDeleteSecretary();

  // AlertDialog
  const [secretaryToDelete, setSecretaryToDelete] = useState<IUser | null>(
    null
  );
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef(null);

  const [search, setSearch] = useState("");
  const [selectedSecretary, setSelectedSecretary] = useState<IUser | null>(
    null
  );

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

  const handleEditClick = (secretary: IUser) => {
    setSelectedSecretary(secretary);
    onEditOpen();
  };

  const filteredSecretaries = secretaries.filter((secretary) =>
    `${secretary.name} ${secretary.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleDeleteClick = (secretary: IUser) => {
    setSecretaryToDelete(secretary);
    onDeleteOpen();
  };

  const confirmDelete = () => {
    if (!secretaryToDelete) return;

    deleteSecretary(secretaryToDelete._id, {
      onSuccess: () => {
        toast({
          title: "Sekretær slettet",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onDeleteClose();
        setSecretaryToDelete(null);
      },
      onError: () => {
        toast({
          title: "Noget gik galt",
          description: "Kunne ikke slette sekretæren",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  return (
    <Layout>
      <Box p={8}>
        <Heading mb={6}>Administrér Sekretærer</Heading>

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
            + Opret sekretær
          </Button>
        </Flex>

        {isLoading ? (
          <Spinner />
        ) : (
          <Stack spacing={4}>
            {filteredSecretaries.map((secretary) => (
              <Box
                key={secretary._id}
                borderWidth="1px"
                borderRadius="lg"
                p={4}
                boxShadow="sm"
              >
                <Text fontWeight="bold">{secretary.name}</Text>
                <Text>Email: {secretary.email}</Text>
                <Text>Telefon: {secretary.phone || "Ikke angivet"}</Text>

                <Button
                  mt={3}
                  size="sm"
                  colorScheme="blue"
                  onClick={() => handleEditClick(secretary)}
                >
                  Rediger
                </Button>
                <Button
                  mt={3}
                  ml={2}
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleDeleteClick(secretary)}
                >
                  Slet
                </Button>
              </Box>
            ))}
          </Stack>
        )}

        <EditSecretaryModal
          isOpen={isEditOpen}
          onClose={onEditClose}
          secretary={selectedSecretary}
        />

        <CreateSecretaryModal isOpen={isCreateOpen} onClose={onCreateClose} />
        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Slet sekretær
              </AlertDialogHeader>

              <AlertDialogBody>
                Er du sikker på, at du vil slette{" "}
                <strong>{secretaryToDelete?.name}</strong>? Denne handling kan
                ikke fortrydes.
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

export default AdminSecretaryPage;
