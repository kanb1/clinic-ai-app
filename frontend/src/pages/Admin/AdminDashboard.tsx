import Layout from "@/components/layout/Layout";
import { Box, Heading } from "@chakra-ui/react";

const AdminDashboard = () => {
  return (
    <Layout>
      <Box p={10}>
        <Heading size="lg">Velkommen Admin </Heading>
      </Box>
    </Layout>
  );
};

export default AdminDashboard;
