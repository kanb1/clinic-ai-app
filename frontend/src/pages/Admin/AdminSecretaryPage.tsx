import {
  Box,
  Heading,
  Text,
  Stack,
  Button,
  useDisclosure,
  useToast,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useAdminSecretaries } from "@/hooks/admin/admin-secretaryHooks/useAdminSecretaries";
import { IUser } from "@/types/user.types";
import EditSecretaryModal from "../../components/admin/Secretaries/EditSecretaryModal";
import { useDeleteSecretary } from "@/hooks/admin/admin-secretaryHooks/useDeleteSecretary";

const AdminSecretaryPage = () => {
  const { data: secretaries = [], isLoading } = useAdminSecretaries();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef(null);

  const [selectedSecretary, setSelectedSecretary] = useState<IUser | null>(
    null
  );
  const [secretaryToDelete, setSecretaryToDelete] = useState<IUser | null>(
    null
  );

  const toast = useToast();
  const { mutate: deleteSecretary } = useDeleteSecretary();

  const handleEditClick = (secretary: IUser) => {
    setSelectedSecretary(secretary);
    onOpen();
  };

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
      },
      onError: () => {
        toast({
          title: "Noget gik galt",
          description: "Kunne ikke slette sekretær",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });

    onDeleteClose();
  };

  return (
    <Box p={8}>
      <Heading mb={6}>Administrér Sekretærer</Heading>

      {isLoading ? (
        <Spinner />
      ) : (
        <Stack spacing={4}>
          {secretaries.map((secretary) => (
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

              <Stack direction="row" spacing={3} mt={3}>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => handleEditClick(secretary)}
                >
                  Rediger
                </Button>
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleDeleteClick(secretary)}
                >
                  Slet
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      {/* Redigering */}
      <EditSecretaryModal
        isOpen={isOpen}
        onClose={onClose}
        secretary={selectedSecretary}
      />

      {/* Slet-dialog */}
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
              Er du sikker på, at du vil slette denne sekretær?
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
  );
};

export default AdminSecretaryPage;
