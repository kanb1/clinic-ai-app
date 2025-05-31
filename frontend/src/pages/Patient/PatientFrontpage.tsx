import Layout from "@/components/layout/Layout";
import { Box, Heading } from "@chakra-ui/react";

const PatientFrontpage = () => {
  return (
    <Layout>
      <Box p={10}>
        <Heading size="lg">Velkommen Patient</Heading>
      </Box>
    </Layout>
  );
};

export default PatientFrontpage;
