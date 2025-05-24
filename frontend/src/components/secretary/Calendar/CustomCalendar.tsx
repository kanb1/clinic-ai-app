import {
  Box,
  Grid,
  GridItem,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { useState } from "react";
import moment from "moment";
import { api } from "../../../services/httpClient";

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

export const CustomCalendar = ({ appointments, refetch }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  const startOfWeek = moment().startOf("isoWeek").add(weekOffset, "weeks");
  const days = Array.from({ length: 7 }, (_, i) =>
    startOfWeek.clone().add(i, "days")
  );

  const handleClick = (appt: Appointment) => {
    setSelected(appt);
    onOpen();
  };

  const handleNextWeek = async () => {
    const nextWeekStart = moment()
      .startOf("isoWeek")
      .add(weekOffset + 1, "weeks");
    const futureLimit = moment().startOf("day").add(20, "days");

    // Hvis der ikke er slots nok, bliver nye slots seeded før ugen vises
    // Derfor: kalenderen halter aldrig bagefter – den venter på seeding
    if (nextWeekStart.isAfter(futureLimit)) {
      setLoading(true);
      await api.get("/api/secretary/check-and-seed-slots");
      await refetch();
      setLoading(false);
    }

    setWeekOffset((prev) => prev + 1);
  };

  const handlePrevWeek = () => {
    setWeekOffset((prev) => prev - 1);
  };

  return (
    <Box p={4} overflowX="auto">
      <Flex justify="space-between" align="center" mb={4}>
        <Button onClick={handlePrevWeek} size="sm">
          ◀ Forrige uge
        </Button>
        <Text fontWeight="bold" fontSize="lg">
          Uge {startOfWeek.isoWeek()} ({startOfWeek.format("D/M")} –{" "}
          {days[6].format("D/M")})
        </Text>
        <Button onClick={handleNextWeek} isDisabled={loading} size="sm">
          {loading ? <Spinner size="sm" /> : "Næste uge ▶"}
        </Button>
      </Flex>

      <Grid
        templateColumns={`100px repeat(${days.length}, 1fr)`}
        gap={1}
        mb={4}
      >
        <GridItem />
        {days.map((day) => (
          <GridItem key={day.toISOString()}>
            <Text fontWeight="bold" textAlign="center">
              {day.format("ddd D/M")}
            </Text>
          </GridItem>
        ))}
      </Grid>

      <Grid templateColumns={`100px repeat(${days.length}, 1fr)`} gap={1}>
        {hours.map((hour) => (
          <>
            <GridItem key={`time-${hour}`}>
              <Text fontSize="sm">{`${hour}:00`}</Text>
            </GridItem>

            {days.map((day) => {
              const appt = appointments.find(
                (a) =>
                  moment(a.date).isSame(day, "day") &&
                  parseInt(a.time.split(":")[0]) === hour
              );

              return (
                <GridItem key={`${day.toISOString()}-${hour}`}>
                  {appt ? (
                    <Box
                      bg="teal.100"
                      p={2}
                      borderRadius="md"
                      cursor="pointer"
                      _hover={{ bg: "teal.200" }}
                      onClick={() => handleClick(appt)}
                    >
                      <Text fontSize="xs" fontWeight="bold">
                        {appt.patient_id.name}
                      </Text>
                      <Text fontSize="xs">m. {appt.doctor_id.name}</Text>
                    </Box>
                  ) : (
                    <Box height="40px" />
                  )}
                </GridItem>
              );
            })}
          </>
        ))}
      </Grid>

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
