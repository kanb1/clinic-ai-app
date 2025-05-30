import Layout from "@/components/layout/Layout";
import { Box, Button, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const AdminFrontpage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <Flex
        direction="column"
        alignItems="center"
        w="full"
        maxW={{ base: "100%" }}
        mx="auto"
      >
        <Box
          w="full"
          maxW={{ base: "100%" }}
          textAlign="center"
          mt={{ base: 3 }}
        >
          <Heading size="heading1">Velkommen Admin </Heading>
          <Text size="body">Vælg en af nedenstående</Text>
          <Flex
            direction="column"
            alignItems="center"
            maxW={{ base: "100%" }}
            gap={{ base: 3 }}
            mt={{ base: 5 }}
          >
            <Button
              as={Link}
              onClick={() => navigate("/admin/patients")}
              variant="solidRed"
              w={{ base: "15rem", sm: "17rem", md: "18rem", xl: "20rem" }}
            >
              Administrer patienter
            </Button>
            <Button
              as={Link}
              onClick={() => navigate("/admin/doctors")}
              variant="solidRed"
              w={{ base: "15rem", sm: "17rem", md: "18rem", xl: "20rem" }}
            >
              Administrer læger
            </Button>
            <Button
              as={Link}
              onClick={() => navigate("/admin/secretaries")}
              variant="solidRed"
              w={{ base: "15rem", sm: "17rem", md: "18rem", xl: "20rem" }}
            >
              Administrer sekretærer
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Layout>
  );
};

export default AdminFrontpage;
