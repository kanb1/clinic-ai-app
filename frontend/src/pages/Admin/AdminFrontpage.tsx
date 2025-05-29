import Layout from "@/components/layout/Layout";
import { Box, Button, Heading, Link } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const AdminFrontpage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <Box p={10}>
        <Heading size="lg">Velkommen Admin </Heading>
        <Button
          as={Link}
          onClick={() => navigate("/admin/patients")}
          colorScheme="blue"
          w="full"
        >
          Administrer patienter
        </Button>
        <Button
          as={Link}
          onClick={() => navigate("/admin/staff")}
          colorScheme="blue"
          w="full"
          mt={4}
        >
          Administrer personale
        </Button>
      </Box>
    </Layout>
  );
};

export default AdminFrontpage;
