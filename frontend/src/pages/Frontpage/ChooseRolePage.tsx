import { Box, Heading, VStack, Button, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const ChooseRolePage = () => {
  const navigate = useNavigate();

  return (
    <Box textAlign="center" px={{ sm: 10, md: 0 }}>
      <Heading
        fontWeight="extrabold"
        fontFamily="heading"
        textStyle="heading1"
        mb={0}
        mt={10}
      >
        Velkommen til Klinika
      </Heading>
      <Text
        textStyle="body"
        fontWeight="medium"
        fontFamily="heading"
        mt={{ lg: 3 }}
      >
        Er du patient eller arbejder hos en klinik? Vælg din adgang herunder.
      </Text>

      <VStack gap={5} pt={{ sm: 6 }}>
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
