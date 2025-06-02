import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { Box, Button, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const PatientFrontpage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
          mt={{ base: 3, sm: 5 }}
        >
          <Heading size="heading1">
            Velkommen, {user?.name || "Patient"}
          </Heading>
          <Text size="body" mt={{ base: 1, md: 2 }}>
            Vælg en af nedenstående
          </Text>
          <Flex
            direction="column"
            alignItems="center"
            maxW={{ base: "100%" }}
            gap={{ base: 3, lg: 4 }}
            mt={{ base: 5, sm: 6 }}
          >
            <Button
              onClick={() => navigate("/patient/ai")}
              variant="solidRed"
              w={{ base: "17rem", sm: "17rem", md: "18rem", xl: "20rem" }}
            >
              Snak med Klinika Assistent
            </Button>
            <Button
              onClick={() => navigate("/patient/appointments")}
              variant="solidRed"
              w={{ base: "17rem", sm: "17rem", md: "18rem", xl: "20rem" }}
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
