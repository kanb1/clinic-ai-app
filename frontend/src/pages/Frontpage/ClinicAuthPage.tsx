import { MyButton } from "@/chakra_components/MyButton";
import { Box, Heading, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const ClinicAuthPage = () => {
  const navigate = useNavigate();

  return (
    <Box textAlign="center">
      <Heading fontWeight="extrabold" fontFamily="heading" fontSize="h1" mb={0}>
        Log venligst ind
      </Heading>
      <Heading
        fontSize={{ base: " " }}
        fontWeight="thin"
        fontFamily="heading"
        mt={0}
      >
        Log ind i din klinik eller klik på "Opret Klinik", hvis du skal
        registrere din klinik i systemet
      </Heading>

      <VStack gap={14} pt={20}>
        <MyButton
          theme="solidRed"
          minW="200px"
          onClick={() => navigate("/staff/login")}
        >
          Login
        </MyButton>
        <MyButton
          theme="solidRed"
          minW="200px"
          onClick={() => navigate("/createclinic")}
        >
          Opret Klinik
        </MyButton>
      </VStack>
    </Box>
  );
};

export default ClinicAuthPage;
