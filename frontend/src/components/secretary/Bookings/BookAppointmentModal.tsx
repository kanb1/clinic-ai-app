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
  Select,
} from "@chakra-ui/react";
import { useAvailabilitySlots } from "../../../hooks/secretary/bookingHooks/useAvailableSlots";
import { useCreateAppointment } from "../../../hooks/secretary/bookingHooks/useCreateAppointment";
import { useState } from "react";
import { SimpleGrid } from "@chakra-ui/react";
import AvailabilityDisplay from "./AvailabilityDisplay";
import AddSecretaryNote from "./AddSecretaryNote";
import ConfirmBookingModal from "./ConfirmBookingModal";
import { useDoctors } from "../../../hooks/common/useDoctors";

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
  const [view, setView] = useState<"overview" | "slots" | "note" | "confirm">(
    "overview"
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState<
    string | undefined
  >();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [secretaryNote, setSecretaryNote] = useState("");
  const { data: doctors = [] } = useDoctors();

  const { data: slotsData, isLoading: slotsLoading } =
    useAvailabilitySlots(weekStart);
  const { mutate: bookAppointment, isPending } = useCreateAppointment();

  const filteredSlots = selectedDate
    ? slotsData?.filter(
        (slot) =>
          slot.date === selectedDate &&
          (!selectedDoctorId || slot.doctorId === selectedDoctorId)
      )
    : [];

  const selectedSlot = filteredSlots?.find((s) => s.slotId === selectedSlotId);

  const handleBook = () => {
    if (!selectedSlot || !secretaryNote) return;
    bookAppointment(
      {
        patient_id: patientId,
        doctor_id: selectedSlot.doctorId,
        slot_id: selectedSlot.slotId,
        secretary_note: secretaryNote,
      },
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

          {/* STEP 1: Vis oversigt med uger/dage */}
          {view === "overview" && (
            <>
              <Select
                placeholder="Vælg læge"
                onChange={(e) => setSelectedDoctorId(e.target.value)}
              >
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name}
                  </option>
                ))}
              </Select>

              {selectedDoctorId && (
                <AvailabilityDisplay
                  weekStart={weekStart}
                  doctorId={selectedDoctorId}
                  onSelectDate={(date) => {
                    setSelectedDate(date);
                    setView("slots");
                  }}
                />
              )}
            </>
          )}

          {/* STEP 2: Vælg specifik tid */}
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
                        onClick={() => {
                          setSelectedSlotId(slot.slotId);
                          setView("note");
                        }}
                      >
                        Vælg
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

          {/* STEP 3: Tilføj note */}
          {view === "note" && (
            <AddSecretaryNote
              onConfirm={(note) => {
                setSecretaryNote(note);
                setView("confirm");
              }}
              onCancel={() => setView("slots")}
            />
          )}

          {/* STEP 4: Confirm */}
          {view === "confirm" && selectedSlot && (
            <ConfirmBookingModal
              date={new Date(selectedSlot.date).toLocaleDateString("da-DK")}
              time={`${selectedSlot.start_time} - ${selectedSlot.end_time}`}
              doctorName={selectedSlot.doctorName}
              note={secretaryNote}
              onConfirm={handleBook}
              onCancel={() => setView("note")}
            />
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
