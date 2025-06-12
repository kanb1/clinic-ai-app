import Layout from "@/components/layout/Layout";
import { Box, Flex, Heading } from "@chakra-ui/react";
import TodaysAppointmentsTable from "@/components/doctor/Appointments/TodaysAppointmentsTable";

const TodaysAppointmentsPage = () => {
  return (
    <Layout>
      <Flex direction="column" align="center" w="full" mt={{ md: 5, xl: 6 }}>
        <Heading size="heading1" mb={6} textAlign="center">
          Aftaler i dag
        </Heading>
        <Box w="full" maxW={"100%"} px={{ base: 2, md: 4 }}>
          <TodaysAppointmentsTable />
        </Box>
      </Flex>
    </Layout>
  );
};

export default TodaysAppointmentsPage;
