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
      <Grid templateColumns="4rem 1fr" gap={2} w="100%">
        {hours.map((hourLabel, index) => {
          const hourAppointments = dayAppointments.filter((appt) => {
            const apptTime = moment(
              `${appt.date.substring(0, 10)}T${appt.time}`
            );
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
                <Box display="flex" flexWrap="wrap" gap={2}>
                  {hourAppointments.map((appt) => (
                    <Box
                      key={appt._id}
                      px={2}
                      py={1}
                      bg={doctorColors[appt.doctor_id?.name] || "gray.100"}
                      borderRadius="md"
                      fontSize="sm"
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
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "sm" }}>
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

          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CompactCalendar;
