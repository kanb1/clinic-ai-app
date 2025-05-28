import { Box, Heading, VStack, Button, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const ClinicAuthPage = () => {
  const navigate = useNavigate();

  return (
    <Box textAlign="center" px={{ base: 4, sm: 5 }}>
      <Heading size="heading1" mt={{ base: 10 }}>
        Log venligst ind
      </Heading>
      <Text size="body" mt={{ base: 2, sm: 3 }}>
        Log ind i din klinik eller registrér din klinik i systemet.
      </Text>

      <VStack gap={5} pt={{ base: 4, sm: 6 }}>
        <Button
          variant="solidRed"
          minW="200px"
          onClick={() => navigate("/staff/login")}
        >
          Login
        </Button>
        <Button
          variant="solidRed"
          minW="200px"
          onClick={() => navigate("/createclinic")}
        >
          Opret Klinik
        </Button>
      </VStack>
    </Box>
  );
};

export default ClinicAuthPage;
