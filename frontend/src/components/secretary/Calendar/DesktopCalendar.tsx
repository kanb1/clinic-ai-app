import {
  Box,
  Grid,
  GridItem,
  Text,
  Flex,
  Tooltip,
  Spinner,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import moment from "moment";
import { useState } from "react";
import { api } from "../../../services/httpClient";
import { useCheckNextWeekHasSlots } from "@/hooks/secretary/calendarHooks/useCheckNextWeekHasSlots";
import AppointmentDetailsModal from "@/components/shared/AppointmentModal";
import { IAppointment } from "@/types/appointment.types";

interface Props {
  appointments: IAppointment[];
  refetch: () => void;
}

// de timer kalenderen skal vise
const hours = Array.from({ length: 9 }, (_, i) => 8 + i);
// farvekoder hver læges aftaler i kalenderen - key,value objekt
const doctorColors: Record<string, string> = {
  "Simon Eisbo": "green.400",
  "Mie Christensen": "purple.400",
};

// refetch -> funktion til at genindlæse data
export const CustomCalendar = ({ appointments, refetch }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAppt, setSelectedAppt] = useState<IAppointment | null>(null);
  // hvor mange uger frem (0 er nuværende uge)
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  // hook der tjekker om der er tilgængelige slots i næste uge
  const { data: hasNextWeek, isLoading: checkingNext } =
    useCheckNextWeekHasSlots(weekOffset);

  // beregner startdato for uge - forskudt med weekofset
  const startOfWeek = moment().startOf("isoWeek").add(weekOffset, "weeks");
  // opretter array med 7 moment-objekter, en for hver ugedag
  const days = Array.from({ length: 7 }, (_, i) =>
    startOfWeek.clone().add(i, "days")
  );

  const visibleDays = days;

  // modal med detaljer
  const handleClick = (appt: IAppointment) => {
    setSelectedAppt(appt);
    onOpen();
  };

  // navigerer til næste uge
  const handleNextWeek = async () => {
    const nextWeekStart = moment()
      .startOf("isoWeek")
      .add(weekOffset + 1, "weeks");
    // mere end 20 dage frem? --> seedes nye tider
    const futureLimit = moment().startOf("day").add(20, "days");

    // kald sker kun hvis næste uge ligger uden for eksisterende data
    if (nextWeekStart.isAfter(futureLimit)) {
      setLoading(true);
      await api.get("/api/secretary/check-and-seed-slots");
      await refetch();
      setLoading(false);
    }

    setWeekOffset((prev) => prev + 1);
  };

  // går en uge tilbage
  const handlePrevWeek = () => setWeekOffset((prev) => prev - 1);

  return (
    <Box p={4} overflowX="auto" maxW="100%" w="full" mx="auto">
      <Flex
        justify="space-between"
        align="center"
        mb={4}
        gap={4}
        flexWrap="wrap"
      >
        <Button onClick={handlePrevWeek} size="sm" p={7}>
          ◀ Forrige uge
        </Button>
        <Text fontWeight="bold" fontSize="lg" textAlign="center">
          Uge {startOfWeek.isoWeek()} ({startOfWeek.format("D/M")} –{" "}
          {days[6].format("D/M")})
        </Text>
        {checkingNext ? (
          <Spinner size="sm" />
        ) : hasNextWeek ? (
          <Button onClick={handleNextWeek} size="sm" p={7}>
            Næste uge ▶
          </Button>
        ) : (
          <Text fontSize="sm" color="gray.500" fontStyle="italic">
            Kalender viser 3 uger ad gangen
          </Text>
        )}
      </Flex>

      <Box overflowX="auto" minW={{ base: "850px", md: "full" }}>
        {/* Første kolonne: Tidspunkter */}
        <Grid
          templateColumns="80px repeat(7, 1fr)"
          border="1px solid"
          borderColor="gray.200"
        >
          {/* overskrift med dato og ugedag for hver dag i ugen */}
          <GridItem bg="gray.50" />
          {visibleDays.map((d) => (
            <GridItem
              key={d.toString()}
              p={{ base: 1, md: 2 }}
              bg={d.isSame(moment(), "day") ? "blue.50" : "gray.50"}
              borderLeft="1px solid #E2E8F0"
              textAlign="center"
              position="sticky"
              top="0"
              zIndex="1"
            >
              <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>
                {d.format("ddd D/M")}
              </Text>
            </GridItem>
          ))}

          {/* Rækker med tider og aftaler */}
          {hours.map((hour) => (
            <>
              {/* tider (08:00) */}
              <GridItem
                key={`time-${hour}`}
                borderTop="1px solid"
                borderColor="gray.200"
                py={{ base: 1, md: 2 }}
                pl={{ base: 1, md: 2 }}
                fontSize={{ base: "xs", md: "sm" }}
                bg="gray.50"
              >
                {hour}:00
              </GridItem>
              {/* hver celle samler de aftaler der matcher dato og klokkeslæt */}
              {visibleDays.map((day) => {
                // filtrerer app ned til kun dem der matcher den her dag og tid
                const appts = appointments.filter(
                  (a) =>
                    // a.date: datoen på aftalen, day: cellens dag
                    // tjekker om aftalen forgår samme dag som day uanset tidspunkt
                    moment(a.date).isSame(day, "day") &&
                    parseInt(a.time.split(":")[0]) === hour
                  // ^tjekker samme med tidspunkt, "09" > 9 (parseint)
                );
                return (
                  <GridItem
                    key={`cell-${day}-${hour}`}
                    borderTop="1px solid"
                    borderLeft="1px solid"
                    borderColor="gray.200"
                    h={{ base: "50px", md: "60px" }}
                    px={{ base: 1, md: 2 }}
                  >
                    {/* tooptip med detaljer ved hover */}
                    <Flex
                      direction="row"
                      flexWrap="wrap"
                      gap={1}
                      align="center"
                      mt={1}
                    >
                      {appts.map((appt) => (
                        <Tooltip
                          key={appt._id}
                          label={
                            <Box>
                              <Text fontWeight="bold">
                                {appt.patient_id.name}
                              </Text>
                              <Text>m. {appt.doctor_id.name}</Text>
                              <Text>
                                {appt.time} – {appt.end_time}
                              </Text>
                            </Box>
                          }
                          hasArrow
                        >
                          {/* Prik appointment */}
                          <Box
                            w="10px"
                            h="10px"
                            borderRadius="full"
                            bg={doctorColors[appt.doctor_id.name] || "gray.400"}
                            cursor="pointer"
                            onClick={() => handleClick(appt)}
                          />
                        </Tooltip>
                      ))}
                    </Flex>
                  </GridItem>
                );
              })}
            </>
          ))}
        </Grid>
      </Box>

      <AppointmentDetailsModal
        isOpen={isOpen}
        onClose={onClose}
        appointment={selectedAppt}
      />
    </Box>
  );
};

export default CustomCalendar;
