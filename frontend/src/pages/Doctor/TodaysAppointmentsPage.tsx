import Layout from "@/components/layout/Layout";
import { Box, Heading } from "@chakra-ui/react";
import TodaysAppointmentsTable from "@/components/doctor/Appointments/TodaysAppointmentsTable";

const TodaysAppointmentsPage = () => {
  return (
    <Layout>
      <Box p={{ base: 4 }}>
        <Heading size="heading1" mb={6} textAlign={"center"}>
          Aftaler i dag
        </Heading>
        <TodaysAppointmentsTable />
      </Box>
    </Layout>
  );
};

export default TodaysAppointmentsPage;
