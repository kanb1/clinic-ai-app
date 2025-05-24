import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Box,
  useToast,
  Spinner,
  Heading,
} from "@chakra-ui/react";
import { useAvailabilitySlots } from "../../../hooks/secretary/bookingHooks/useAvailableSlots";
import { useCreateAppointment } from "../../../hooks/secretary/bookingHooks/useCreateAppointment";
import { useState } from "react";
import { SimpleGrid } from "@chakra-ui/react";
import AvailabilityDisplay from "./AvailabilityDisplay";

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  weekStart: string; // fx "2025-05-27"
}

const BookAppointmentModal = ({
  isOpen,
  onClose,
  patientId,
  weekStart,
}: BookAppointmentModalProps) => {
  const toast = useToast();
  const [view, setView] = useState<"overview" | "slots">("overview");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const { data: slotsData, isLoading: slotsLoading } =
    useAvailabilitySlots(weekStart);
  const { mutate: bookAppointment, isPending } = useCreateAppointment();

  const filteredSlots = selectedDate
    ? slotsData?.filter((slot) => slot.date === selectedDate)
    : [];

  const handleBook = (doctorId: string, slotId: string) => {
    bookAppointment(
      { patient_id: patientId, doctor_id: doctorId, slot_id: slotId },
      {
        onSuccess: () => {
          toast({ title: "Aftale oprettet", status: "success" });
          onClose();
        },
        onError: () => {
          toast({ title: "Kunne ikke oprette aftale", status: "error" });
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Ledige tider</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Heading size="md" mb={2}>
            Vælg tidspunkt (
            {selectedDate && new Date(selectedDate).toLocaleDateString("da-DK")}
            )
          </Heading>
          {view === "overview" && (
            <AvailabilityDisplay
              weekStart={weekStart}
              doctorId={undefined}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setView("slots");
              }}
            />
          )}

          {view === "slots" && (
            <>
              {slotsLoading ? (
                <Spinner />
              ) : (
                <SimpleGrid columns={[1, 2, 3]} spacing={4} mt={4}>
                  {filteredSlots?.map((slot) => (
                    <Box
                      key={slot.slotId}
                      p={3}
                      borderWidth={1}
                      borderRadius="md"
                      bg="gray.50"
                    >
                      <Text fontWeight="bold">{slot.doctorName}</Text>
                      <Text fontSize="sm">
                        {new Date(slot.date).toLocaleDateString("da-DK")}
                      </Text>
                      <Text fontSize="sm">
                        Tid: {slot.start_time} - {slot.end_time}
                      </Text>
                      <Button
                        mt={2}
                        size="sm"
                        colorScheme="blue"
                        isLoading={isPending && selectedSlotId === slot.slotId}
                        onClick={() => handleBook(slot.doctorId, slot.slotId)}
                      >
                        Book tid
                      </Button>
                    </Box>
                  ))}
                  <Button
                    variant="ghost"
                    mt={4}
                    onClick={() => setView("overview")}
                  >
                    Tilbage
                  </Button>
                </SimpleGrid>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Luk</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BookAppointmentModal;
