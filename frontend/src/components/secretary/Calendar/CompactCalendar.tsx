import {
  Box,
  Text,
  VStack,
  Flex,
  Button,
  Heading,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useState } from "react";
import moment from "moment";
import { useCheckNextWeekHasSlots } from "@/hooks/secretary/calendarHooks/useCheckNextWeekHasSlots";
import AppointmentDetailsModal from "@/components/shared/AppointmentModal";
import { IAppointment } from "@/types/appointment.types";

interface Props {
  appointments: any[];
}

const CompactCalendar = ({ appointments }: Props) => {
  // farvekoder hver læges aftaler i kalenderen - key,value objekt
  const doctorColors: Record<string, string> = {
    "Simon Eisbo": "green.400",
    "Mie Christensen": "purple.400",
  };
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedAppt, setSelectedAppt] = useState<IAppointment | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  // antal uger mellem i dag og selecteddate -> tjek om der er tider i nsæte uge
  const currentWeekOffset = moment(selectedDate).diff(
    moment().startOf("isoWeek"),
    "weeks"
  );
  // returnerer true/false (om der slots for næste uge?)
  const { data: hasSlotsNextWeek } =
    useCheckNextWeekHasSlots(currentWeekOffset);

  // fx "Tirsdag 19/6"
  const formattedDate = selectedDate.format("dddd D/M");
  // fx "2025-06-19"
  const selectedDateStr = selectedDate.format("YYYY-MM-DD");

  // Opdaterer selectedDate -> går en dag frem/tilbage
  const goToPreviousDay = () =>
    setSelectedDate((prev) => moment(prev).subtract(1, "day"));

  const goToNextDay = () =>
    setSelectedDate((prev) => moment(prev).add(1, "day"));

  // de timer kalenderen skal vise (8-16)
  const hours = Array.from({ length: 9 }, (_, i) => `${8 + i}:00`);

  // filtrer aftaler for den valgte dag
  const dayAppointments = appointments.filter((appt) => {
    // konverterer hver appt.date til YYY...
    const dateStr = moment(appt.date).format("YYYY-MM-DD");
    // resultat: kun de aftaler som hører til den valgte dag (selectedDateStr)
    return dateStr === selectedDateStr;
  });

  return (
    <Box px={{ base: 2 }} maxW="100%" w="full" mx="auto" p={{ md: 7 }}>
      <Heading size={{ base: "md" }} textAlign={{ base: "center" }}>
        {formattedDate}
      </Heading>
      <Box py={{ base: 7, md: 10 }}>
        <Flex
          display="flex"
          flexDirection={"column"}
          gap={{ base: 2, md: 3 }}
          align="center"
          mx="auto"
        >
          {/* tjekker om der er slots for næste uge og viser den aktuelle dag og knapper til frem og tilbage */}
          {hasSlotsNextWeek && (
            <Button
              onClick={goToNextDay}
              rightIcon={<ChevronRightIcon />}
              variant="ghost"
              py={{ base: 1 }}
              px={{ base: 10 }}
              bgColor={"gray.200"}
              fontSize={{ base: "sm" }}
            >
              Næste dag
            </Button>
          )}
          <Button
            onClick={goToPreviousDay}
            leftIcon={<ChevronLeftIcon />}
            variant="ghost"
            py={{ base: 1 }}
            px={{ base: 10 }}
            bgColor={"gray.200"}
            fontSize={{ base: "sm" }}
          >
            Forrige dag
          </Button>
        </Flex>
      </Box>

      {/* Timegrid */}
      {/*  bygger en dagvis kalender som en 2-kolonne tabel/grid */}
      {/* Venstre kolonne: Tidspunkter, Højre kolonne: Aftaler for det tidspunkt  */}
      <Grid templateColumns="4rem 1fr" gap={2} w="100%">
        {/* loop for hver time */}
        {hours.map((hourLabel, index) => {
          // filtrer dagens appointments ud fra de forskellige tidsrækker
          const hourAppointments = dayAppointments.filter((appt) => {
            // app.time: "10:30" fx, substring(0,10) da vi tager tidspunktet ud af "2025-06-20T00:00:00.000Z"
            //Samlet: "2025-06-20T10:30" > bliver til et momentobj
            const apptTime = moment(
              `${appt.date.substring(0, 10)}T${appt.time}`
            );

            // apptTime.hour(): giver 10, hvis vi er i loopet for hourLabel = "10:00" -> app. passer til denne time-række
            return apptTime.hour() === parseInt(hourLabel.split(":")[0], 10);
          });

          const bg = index % 2 === 0 ? "gray.100" : "transparent";

          return (
            <>
              <GridItem bg={bg} px={2} py={1}>
                <Text fontWeight="medium" fontSize="sm">
                  {hourLabel}
                </Text>
              </GridItem>
              <GridItem bg={bg}>
                {/* lille boks i højre kolonne for hver app */}
                <Box display="flex" flexWrap="wrap" gap={2}>
                  {hourAppointments.map((appt) => (
                    <Box
                      key={appt._id}
                      px={2}
                      py={1}
                      // bg afhængig af lægens navn
                      bg={doctorColors[appt.doctor_id?.name] || "gray.100"}
                      borderRadius="md"
                      fontSize="sm"
                      // åbner detaljer når klikket på
                      onClick={() => {
                        setSelectedAppt(appt);
                        onOpen();
                      }}
                    >
                      {appt.patient_id?.name || "Ukendt"}
                    </Box>
                  ))}
                </Box>
              </GridItem>
            </>
          );
        })}
      </Grid>

      {/* Modal for appointment details */}
      <AppointmentDetailsModal
        isOpen={isOpen}
        onClose={onClose}
        appointment={selectedAppt}
      />
    </Box>
  );
};

export default CompactCalendar;
