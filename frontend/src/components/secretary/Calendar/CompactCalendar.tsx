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
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useState } from "react";
import moment from "moment";
import { useCheckNextWeekHasSlots } from "@/hooks/secretary/calendarHooks/useCheckNextWeekHasSlots";

interface Props {
  appointments: any[];
}

const CompactCalendar = ({ appointments }: Props) => {
  const doctorColors: Record<string, string> = {
    "Simon Eisbo": "green.400",
    "Mie Christensen": "purple.400",
  };
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedAppt, setSelectedAppt] = useState<any>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const currentWeekOffset = moment(selectedDate).diff(
    moment().startOf("isoWeek"),
    "weeks"
  );
  const { data: hasSlotsNextWeek } =
    useCheckNextWeekHasSlots(currentWeekOffset);

  const formattedDate = selectedDate.format("dddd D/M");
  const selectedDateStr = selectedDate.format("YYYY-MM-DD");

  const goToPreviousDay = () =>
    setSelectedDate((prev) => moment(prev).subtract(1, "day"));

  const goToNextDay = () =>
    setSelectedDate((prev) => moment(prev).add(1, "day"));

  const hours = Array.from({ length: 9 }, (_, i) => `${8 + i}:00`);

  const dayAppointments = appointments.filter((appt) => {
    const dateStr = moment(appt.date).format("YYYY-MM-DD");
    return dateStr === selectedDateStr;
  });

  return (
    <Box px={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Button
          onClick={goToPreviousDay}
          leftIcon={<ChevronLeftIcon />}
          variant="ghost"
        >
          Forrige dag
        </Button>
        <Heading size="md">{formattedDate}</Heading>
        {hasSlotsNextWeek && (
          <Button
            onClick={goToNextDay}
            rightIcon={<ChevronRightIcon />}
            variant="ghost"
          >
            Næste dag
          </Button>
        )}
      </Flex>

      <VStack align="start" spacing={4}>
        {hours.map((hourLabel) => {
          const currentHour = parseInt(hourLabel.split(":")[0], 10);

          const hourAppointments = dayAppointments.filter((appt) => {
            const apptTime = moment(
              `${appt.date.substring(0, 10)}T${appt.time}`
            );
            return apptTime.hour() === currentHour;
          });

          return (
            <Flex
              key={hourLabel}
              w="100%"
              alignItems="flex-start"
              gap={2}
              flexWrap="wrap"
            >
              <Text w="4rem" flexShrink={0}>
                {hourLabel}
              </Text>
              <Flex gap={2} flexWrap="wrap">
                {hourAppointments.map((appt) => (
                  <Box
                    key={appt._id}
                    as="button"
                    onClick={() => {
                      setSelectedAppt(appt);
                      onOpen();
                    }}
                    px={2}
                    py={1}
                    bg={doctorColors[appt.doctor_id?.name] || "gray.100"}
                    borderRadius="md"
                    fontSize="sm"
                    _hover={{ bg: "gray.200" }}
                    minW="fit-content"
                  >
                    {appt.patient_id?.name || "Ukendt"}
                  </Box>
                ))}
              </Flex>
            </Flex>
          );
        })}
      </VStack>

      {/* Modal for appointment details */}
      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Aftaledetaljer</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedAppt ? (
              <Box>
                <Text>
                  <strong>Patient:</strong> {selectedAppt.patient_id?.name}
                </Text>
                <Text>
                  <strong>Læge:</strong> {selectedAppt.doctor_id?.name}
                </Text>
                <Text>
                  <strong>Tid:</strong> {selectedAppt.time} –{" "}
                  {selectedAppt.end_time || "?"}
                </Text>
                <Text>
                  <strong>Status:</strong> {selectedAppt.status || "-"}
                </Text>
              </Box>
            ) : (
              <Text>Ingen data</Text>
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

export default CompactCalendar;
