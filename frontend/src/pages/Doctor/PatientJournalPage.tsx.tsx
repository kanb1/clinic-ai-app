import Layout from "@/components/layout/Layout";
import { Box, Heading } from "@chakra-ui/react";

const PatientJournalPage = () => {
  return (
    <Layout>
      <Box p={10}>
        <Heading size="lg">Journal for specifik patient</Heading>
      </Box>
    </Layout>
  );
};

export default PatientJournalPage;
