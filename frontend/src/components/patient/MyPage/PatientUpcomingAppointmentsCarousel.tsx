import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Badge,
  useBreakpointValue,
  Spinner,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { IAppointment } from "@/types/appointment.types";
import { useConfirmAppointment } from "@/hooks/patient/mypageHooks/useConfirmAppointment";
import { useCancelAppointment } from "@/hooks/patient/mypageHooks/useCancelAppointment";

const MotionBox = motion(Box);

interface Props {
  appointments: IAppointment[];
  isLoading: boolean;
  refetch: () => void;
}

const PatientUpcomingAppointmentsCarousel = ({
  appointments,
  isLoading,
  refetch,
}: Props) => {
  // hvilken aftale vises i carousel (kun på mobile)
  const [currentIndex, setCurrentIndex] = useState(0);
  // 1 = next, -1 = previous
  const [direction, setDirection] = useState(1);
  const isMobile = useBreakpointValue({ base: true, lg: false });

  const { mutate: confirm } = useConfirmAppointment();
  const { mutate: cancel } = useCancelAppointment();
  const toast = useToast();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  // Accessibility: leastDestructiveRef til “Nej”-knappen, så man ikke ved et uheld sletter (fx ved at klikke "enter")
  // der kommer fokus på annuler knap i alertdialog
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % appointments.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) =>
      prev === 0 ? appointments.length - 1 : prev - 1
    );
  };

  const handleConfirm = () => {
    confirm(appointments[currentIndex]._id, {
      onSuccess: () => {
        toast({
          title: "Aftale bekræftet",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        refetch();
      },
    });
  };

  const handleCancel = () => {
    cancel(appointments[currentIndex]._id, {
      onSuccess: () => {
        toast({
          title: "Aftale aflyst",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        refetch();
        setIsAlertOpen(false);
      },
    });
  };

  if (isLoading) return <Spinner />;
  if (!appointments || appointments.length === 0)
    return <Text>Du har ingen kommende aftaler.</Text>;

  const current = appointments[currentIndex];

  return (
    <Box w="full" position="relative" mt={5}>
      {isMobile ? (
        <Flex justify="center" align="center" direction="column" gap={4}>
          <Box position="relative" w="100%" minH="220px" overflow="hidden">
            <AnimatePresence>
              <MotionBox
                // når vi ædnrer curentIndex -> key ændres
                // Framer Motion trigger en exit-animation for det gamle kort og et enter for det nye
                key={currentIndex}
                position="absolute"
                w="full"
                initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                // x: 300: kort starter udenfor skræm til højre
                // x: -300 starter udenfor venstre
                exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                bg="gray.100"
                p={4}
                borderRadius="md"
                boxShadow="sm"
              >
                <Text fontWeight="bold">
                  {current.time} – {current.end_time || "?"}
                </Text>
                <Text fontSize="sm">{current.doctor_id?.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  Status: {current.status}
                </Text>
                <Badge mt={2} colorScheme="blue">
                  {current.status.toUpperCase()}
                </Badge>

                <Flex gap={3} mt={4} flexWrap="wrap">
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={handleConfirm}
                    isDisabled={current.status === "bekræftet"}
                  >
                    Bekræft
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => setIsAlertOpen(true)}
                    isDisabled={current.status === "aflyst"}
                  >
                    Aflys
                  </Button>
                </Flex>
              </MotionBox>
            </AnimatePresence>
          </Box>

          <Flex gap={4}>
            <Button onClick={handlePrev}>←</Button>
            <Button onClick={handleNext}>→</Button>
          </Flex>
        </Flex>
      ) : (
        <Flex gap={4} overflowX="auto" px={1}>
          {appointments.map((appt) => (
            <Box
              key={appt._id}
              minW="30%"
              flexShrink={0}
              bg="gray.100"
              p={4}
              borderRadius="md"
              boxShadow="sm"
            >
              <Text fontWeight="bold">
                {appt.time} – {appt.end_time || "?"}
              </Text>
              <Text fontSize="sm">{appt.doctor_id?.name}</Text>
              <Text fontSize="sm" color="gray.500">
                Status: {appt.status}
              </Text>
              <Badge mt={2} colorScheme="blue">
                {appt.status.toUpperCase()}
              </Badge>

              <Flex gap={3} mt={3} flexWrap="wrap">
                <Button
                  size="sm"
                  colorScheme="green"
                  onClick={() => confirm(appt._id, { onSuccess: refetch })}
                  isDisabled={appt.status === "bekræftet"}
                >
                  Bekræft
                </Button>
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => {
                    setCurrentIndex(appointments.indexOf(appt));
                    setIsAlertOpen(true);
                  }}
                  isDisabled={appt.status === "aflyst"}
                >
                  Aflys
                </Button>
              </Flex>
            </Box>
          ))}
        </Flex>
      )}

      {/* alert til bekræftelse før aflysning */}
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Bekræft aflysning
            </AlertDialogHeader>

            <AlertDialogBody>
              Er du sikker på, at du vil aflyse denne aftale?
            </AlertDialogBody>

            <AlertDialogFooter>
              {/* ref:{cancelRef} - ekstra Accessibility, fokus på denne knap */}
              <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
                Nej
              </Button>
              <Button colorScheme="red" onClick={handleCancel} ml={3}>
                Ja, aflys
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default PatientUpcomingAppointmentsCarousel;
