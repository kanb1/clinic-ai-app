import { Box, Flex, Text, Spinner } from "@chakra-ui/react";
import { useTodaysAppointments } from "../../../hooks/doctor/dashboardHooks/useTodaysAppointments";
import { FaCalendarCheck, FaCalendarTimes } from "react-icons/fa";
import { IAppointment } from "@/types/appointment.types";

const TodaysAppointmentStats = () => {
  const { data: appointments = [], isLoading } = useTodaysAppointments();

  if (isLoading) return <Spinner />;

  // filtrerer apppo.--> antal bekræftet/aflyst
  const confirmed = (appointments as IAppointment[]).filter(
    (a: IAppointment) => a.status === "bekræftet"
  ).length;

  const cancelled = (appointments as IAppointment[]).filter(
    (a: IAppointment) => a.status === "aflyst"
  ).length;

  return (
    <Flex
      gap={6}
      flexWrap="wrap"
      flexDirection={{ base: "column", md: "row" }}
      justifyContent={{ md: "center" }}
    >
      <Box bg="green.50" p={5} borderRadius="md" minW="200px">
        <Flex align="center" gap={2}>
          <FaCalendarCheck color="green" />
          <Text fontSize="2xl" fontWeight="bold">
            {confirmed}
          </Text>
        </Flex>
        <Text>Aftaler bekræftet i dag</Text>
      </Box>

      <Box bg="red.50" p={5} borderRadius="md" minW="200px">
        <Flex align="center" gap={2}>
          <FaCalendarTimes color="red" />
          <Text fontSize="2xl" fontWeight="bold">
            {cancelled}
          </Text>
        </Flex>
        <Text>Aflyste aftaler</Text>
      </Box>
    </Flex>
  );
};

export default TodaysAppointmentStats;
