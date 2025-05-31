import { IAppointment } from "@/types/appointment.types";
import {
  Box,
  Text,
  Button,
  Stack,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import moment from "moment";
import { useRef, useState } from "react";

interface AppointmentCardProps {
  appt: IAppointment;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  isLoading: boolean;
}

const AppointmentCard = ({
  appt,
  onConfirm,
  onCancel,
  isLoading,
}: AppointmentCardProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const [action, setAction] = useState<"confirm" | "cancel" | null>(null);

  const handleAction = (type: "confirm" | "cancel") => {
    setAction(type);
    onOpen();
  };

  const handleConfirm = () => {
    if (action === "confirm") onConfirm(appt._id);
    else if (action === "cancel") onCancel(appt._id);
    onClose();
  };

  return (
    <>
      <Box borderWidth="1px" p={4} borderRadius="md">
        <Text fontWeight="bold">
          {moment(appt.date).format("DD/MM/YYYY")} – {appt.time}
        </Text>
        <Text>Behandler: {appt.doctor_id.name}</Text>
        <Text>Status: {appt.status}</Text>

        {appt.status === "venter" && (
          <Stack direction="row" mt={3}>
            <Button
              colorScheme="green"
              size="sm"
              onClick={() => handleAction("confirm")}
              isLoading={isLoading}
            >
              Bekræft
            </Button>
            <Button
              colorScheme="red"
              size="sm"
              onClick={() => handleAction("cancel")}
              isLoading={isLoading}
            >
              Aflys
            </Button>
          </Stack>
        )}

        {appt.status === "bekræftet" && (
          <Button
            colorScheme="red"
            size="sm"
            mt={3}
            onClick={() => handleAction("cancel")}
            isLoading={isLoading}
          >
            Aflys
          </Button>
        )}
      </Box>

      {/* AlertDialog for bekræft/aflys */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {action === "confirm" ? "Bekræft aftale" : "Aflys aftale"}
          </AlertDialogHeader>

          <AlertDialogBody>
            {action === "confirm"
              ? "Er du sikker på, at du vil bekræfte denne aftale?"
              : "Er du sikker på, at du vil aflyse denne aftale?"}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Annullér
            </Button>
            <Button
              colorScheme={action === "confirm" ? "green" : "red"}
              onClick={handleConfirm}
              ml={3}
              isLoading={isLoading}
            >
              Ja, {action === "confirm" ? "bekræft" : "aflys"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AppointmentCard;
