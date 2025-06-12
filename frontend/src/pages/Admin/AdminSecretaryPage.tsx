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
  const gridColumns = useBreakpointValue({ base: 1, sm: 2, md: 3 });

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
      <Box
        w="full"
        maxW={{ base: "100%" }}
        textAlign="center"
        mt={{ base: 3 }}
        p={{ lg: 5 }}
      >
        <Heading size="lg" mb={4} textAlign={"center"}>
          Administrér Sekretærer
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
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant={"outlineWhite"} onClick={onCreateOpen}>
            + Opret sekretær
          </Button>
        </Flex>

        {isLoading ? (
          <Spinner />
        ) : (
          <SimpleGrid columns={gridColumns} spacing={4}>
            {filteredSecretaries.map((secretary) => (
              <Box
                key={secretary._id}
                borderWidth="1px"
                borderRadius="lg"
                p={6}
                bg="white"
                boxShadow="sm"
                _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                <Heading size="md">{secretary.name}</Heading>

                <Stack spacing={1} fontSize="sm" color="gray.700" mt={3}>
                  <Text>
                    <b>Email:</b> {secretary.email}
                  </Text>
                  <Text>
                    <b>Telefon:</b> {secretary.phone || "Ikke angivet"}
                  </Text>
                </Stack>

                <Flex gap={3} flexDirection={"column"} mt={{ base: 6 }}>
                  <Button
                    variant="solidBlack"
                    onClick={() => handleEditClick(secretary)}
                    width={{ base: "100%", md: "auto" }}
                  >
                    Redigér
                  </Button>
                  <Button
                    variant="solidRed"
                    onClick={() => handleDeleteClick(secretary)}
                    width={{ base: "100%", md: "auto" }}
                  >
                    Slet
                  </Button>
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
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
