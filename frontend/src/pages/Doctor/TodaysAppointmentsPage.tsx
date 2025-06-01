import Layout from "@/components/layout/Layout";
import { Box, Heading } from "@chakra-ui/react";
import TodaysAppointmentsTable from "@/components/doctor/Appointments/TodaysAppointmentsTable";

const TodaysAppointmentsPage = () => {
  return (
    <Layout>
      <Box p={10}>
        <Heading size="lg" mb={6}>
          Aftaler i dag
        </Heading>
        <TodaysAppointmentsTable />
      </Box>
    </Layout>
  );
};

export default TodaysAppointmentsPage;
