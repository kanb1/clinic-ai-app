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
  Flex,
} from "@chakra-ui/react";
import { useAvailabilitySlots } from "../../../hooks/secretary/bookingHooks/useAvailableSlots";
import { useCreateAppointment } from "../../../hooks/secretary/bookingHooks/useCreateAppointment";
import { useEffect, useState } from "react";
import { SimpleGrid } from "@chakra-ui/react";
import AvailabilityDisplay from "./AvailabilityDisplay";
import AddSecretaryNote from "./AddSecretaryNote";
import ConfirmBookingModal from "./ConfirmBookingModal";
import { useDoctors } from "../../../hooks/common/useDoctors";

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  weekStart: string; // dags dato
}

const BookAppointmentModal = ({
  isOpen,
  onClose,
  patientId,
  weekStart,
}: BookAppointmentModalProps) => {
  const toast = useToast();
  // hvilken step i bookign er vi i
  const [view, setView] = useState<"overview" | "slots" | "note" | "confirm">(
    "overview"
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState<
    string | undefined
  >();
  // hvilken dag i ugen brugeren valgte
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // hvilken konkrete tid brugeren valgte
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [secretaryNote, setSecretaryNote] = useState("");

  // Henter læger i klinikken
  const { data: doctors = [] } = useDoctors();

  // Henter ledige tider for en specifik uge
  const { data: slotsData, isLoading: slotsLoading } = useAvailabilitySlots(
    weekStart,
    selectedDoctorId
  );

  const { mutate: bookAppointment, isPending } = useCreateAppointment();

  // Når dag er valgt -> filtrer kun de slots de rmatcher den dag
  const filteredSlots = selectedDate
    ? // Er der valgt dato? så filtrer slotsData (konkrete tider)
      // filter() -> ny array med kun de slots der matcher dato og evt. læge
      slotsData?.filter((slot) => {
        // slotDate og selectedDate kan være i forskellige formater (Date, string osv)
        // konverter til ISO string -> fjern tid -> kun datodelen
        // = sammenligner kun dato og ik tid
        const slotDate = new Date(slot.date).toISOString().split("T")[0];
        const selected = new Date(selectedDate).toISOString().split("T")[0];
        return (
          // return kun slots der matcher valgte dato
          // ingen læge -> tillader alle slots -> valgt -> slot skal matche lægens id
          slotDate === selected &&
          (!selectedDoctorId || slot.doctorId === selectedDoctorId)
        );
      })
    : []; //hvis selecteddate ik er valg -> tomt array -> ik vis slots

  // find den konkrete tid sekretæren valgte
  // filteredSlots -> array vi lige har filtreret
  // selectedSlotId -> id'et på den tid brugeren valgte
  const selectedSlot = filteredSlots?.find((s) => s.slotId === selectedSlotId);

  // bookingfunktion -> kalder mutation bookAppointment -> indsender nødvendige oplysninger
  const handleBook = () => {
    // stop funktionen her hvis nedenstående er true, ik gå videre
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

  // back to overview & Reset næste gang modal åbnes
  const resetForm = () => {
    setView("overview");
    setSelectedDoctorId(undefined);
    setSelectedDate(null);
    setSelectedSlotId(null);
    setSecretaryNote("");
  };

  // når isOpen er false (modal lukkes) > kald ovenstående^
  // sikrer atid frisk modal når åbnes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Ledige tider</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Heading size="md" mb={2}>
            Vælg læge og tidspunkt
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
                    setView("slots"); // gå videre til næste trin
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
                <SimpleGrid
                  columns={{ base: 1, sm: 2, lg: 3 }}
                  spacing={4}
                  mt={4}
                >
                  {/* Vis alle de konkrete tider for den valgte dag */}
                  {filteredSlots?.map((slot) => (
                    <Box
                      key={slot.slotId}
                      p={{ base: 2, md: 3 }}
                      borderWidth={1}
                      borderRadius="md"
                      bg="gray.50"
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      <Text fontWeight="bold">{slot.doctorName}</Text>
                      <Text>{slot.date}</Text>
                      <Text>
                        Tid: {slot.start_time} - {slot.end_time}
                      </Text>
                      <Button
                        mt={2}
                        size={{ base: "xs" }}
                        py={{ base: 4 }}
                        px={{ base: 4 }}
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
                </SimpleGrid>
              )}
              <Flex justify="flex-start" mt={4}>
                <Button variant="ghost" onClick={() => setView("overview")}>
                  Tilbage
                </Button>
              </Flex>
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
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BookAppointmentModal;
