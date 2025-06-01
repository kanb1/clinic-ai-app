import Layout from "@/components/layout/Layout";
import { Box, Heading } from "@chakra-ui/react";

const PatientOverviewPage = () => {
  return (
    <Layout>
      <Box p={10}>
        <Heading size="lg">Patienter & Journaler</Heading>
      </Box>
    </Layout>
  );
};

export default PatientOverviewPage;
