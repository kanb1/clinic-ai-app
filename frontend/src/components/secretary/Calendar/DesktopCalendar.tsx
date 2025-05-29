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

interface Appointment {
  _id: string;
  date: string;
  time: string;
  end_time: string;
  patient_id: { name: string };
  doctor_id: { name: string };
  secretary_note?: string;
}

interface Props {
  appointments: Appointment[];
  refetch: () => void;
}

const hours = Array.from({ length: 9 }, (_, i) => 8 + i); // 08:00–16:00
const doctorColors: Record<string, string> = {
  "Simon Eisbo": "green.400",
  "Mie Christensen": "purple.400",
};

export const CustomCalendar = ({ appointments, refetch }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const { data: hasNextWeek, isLoading: checkingNext } =
    useCheckNextWeekHasSlots(weekOffset);

  const startOfWeek = moment().startOf("isoWeek").add(weekOffset, "weeks");
  const days = Array.from({ length: 7 }, (_, i) =>
    startOfWeek.clone().add(i, "days")
  );

  const visibleDays = days;

  const handleClick = (appt: Appointment) => {
    setSelected(appt);
    onOpen();
  };

  const handleNextWeek = async () => {
    const nextWeekStart = moment()
      .startOf("isoWeek")
      .add(weekOffset + 1, "weeks");
    const futureLimit = moment().startOf("day").add(20, "days");

    if (nextWeekStart.isAfter(futureLimit)) {
      setLoading(true);
      await api.get("/api/secretary/check-and-seed-slots");
      await refetch();
      setLoading(false);
    }

    setWeekOffset((prev) => prev + 1);
  };

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
        <Grid
          templateColumns="80px repeat(7, 1fr)"
          border="1px solid"
          borderColor="gray.200"
        >
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

          {hours.map((hour) => (
            <>
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
              {visibleDays.map((day) => {
                const appts = appointments.filter(
                  (a) =>
                    moment(a.date).isSame(day, "day") &&
                    parseInt(a.time.split(":")[0]) === hour
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

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Aftaledetaljer</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <>
                <Text>
                  <strong>Patient:</strong> {selected.patient_id.name}
                </Text>
                <Text>
                  <strong>Læge:</strong> {selected.doctor_id.name}
                </Text>
                <Text>
                  <strong>Dato:</strong>{" "}
                  {moment(selected.date).format("dddd D/M")}
                </Text>
                <Text>
                  <strong>Klokkeslæt:</strong> {selected.time} –{" "}
                  {selected.end_time}
                </Text>
                {selected.secretary_note && (
                  <Text mt={2}>
                    <strong>Note:</strong> {selected.secretary_note}
                  </Text>
                )}
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Luk</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CustomCalendar;
