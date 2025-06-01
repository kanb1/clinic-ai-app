import Layout from "@/components/layout/Layout";
import { Box, Button, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const PatientFrontpage = () => {
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
          <Heading size="heading1">Velkommen Patient </Heading>
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
              onClick={() => navigate("/patient/ai")}
              variant="solidRed"
              w={{ base: "15rem", sm: "17rem", md: "18rem", xl: "20rem" }}
            >
              Snak med Klinika Assistent
            </Button>
            <Button
              as={Link}
              onClick={() => navigate("/patient/appointments")}
              variant="solidRed"
              w={{ base: "15rem", sm: "17rem", md: "18rem", xl: "20rem" }}
            >
              Gå til Min Side
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Layout>
  );
};

export default PatientFrontpage;
