import { Box, Heading, VStack, Button, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const ChooseRolePage = () => {
  const navigate = useNavigate();

  return (
    <Box textAlign="center" px={{ base: 3, sm: 10, md: 0 }}>
      <Heading size="heading1" mb={0} mt={10}>
        Velkommen til Klinika
      </Heading>
      <Text size="body" mt={{ base: 2, lg: 3 }} textAlign="center">
        Er du patient eller arbejder hos en klinik? Vælg din adgang herunder.
      </Text>

      <VStack gap={5} pt={{ base: 6, sm: 6 }}>
        <Button
          variant="solidRed"
          minW="200px"
          onClick={() => navigate("/clinic/auth")}
        >
          Klinik
        </Button>
        <Button
          variant="solidRed"
          minW="200px"
          onClick={() => navigate("/patient/login")}
        >
          Patient
        </Button>
      </VStack>
    </Box>
  );
};

export default ChooseRolePage;
