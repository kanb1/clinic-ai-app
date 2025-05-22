import { Box, Heading, VStack, Button, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const ClinicAuthPage = () => {
  const navigate = useNavigate();

  return (
    <Box textAlign="center">
      <Heading
        fontWeight="extrabold"
        fontFamily="heading"
        textStyle="heading1"
        mb={0}
        mt={10}
      >
        Log venligst ind
      </Heading>
      <Text
        textStyle="body"
        fontWeight="medium"
        fontFamily="heading"
        mt={{ sm: 3 }}
      >
        Log ind i din klinik eller klik på "Opret Klinik", hvis du skal
        registrere din klinik i systemet
      </Text>

      <VStack gap={5} pt={{ sm: 6 }}>
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
