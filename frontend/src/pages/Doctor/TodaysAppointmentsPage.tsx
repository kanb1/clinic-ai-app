import Layout from "@/components/layout/Layout";
import { Box, Heading } from "@chakra-ui/react";

const TodaysAppointmentsPage = () => {
  return (
    <Layout>
      <Box p={10}>
        <Heading size="lg">Aftaler i dag</Heading>
      </Box>
    </Layout>
  );
};

export default TodaysAppointmentsPage;
