import { Box, Heading, VStack, Button } from "@chakra-ui/react";
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
      >
        Log venligst ind
      </Heading>
      <Heading textStyle="body" fontWeight="thin" fontFamily="heading" mt={10}>
        Log ind i din klinik eller klik på "Opret Klinik", hvis du skal
        registrere din klinik i systemet
      </Heading>

      <VStack gap={14} pt={20}>
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
