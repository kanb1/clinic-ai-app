import { MyButton } from "@/chakra_components/MyButton";
import { Box, Heading, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const ChooseRolePage = () => {
  const navigate = useNavigate();

  return (
    <Box p={10} textAlign="center">
      <Heading fontWeight="extrabold" fontFamily="heading" fontSize="h1" mb={0}>
        Velkommen
      </Heading>
      <Heading
        fontSize={{ base: " " }}
        fontWeight="thin"
        fontFamily="heading"
        mt={0}
      >
        Er du patient eller arbejder hos en klinik? Vælg din adgang herunder.
      </Heading>

      <VStack gap={14} pt={20}>
        <MyButton
          theme="solidRed"
          minW="200px"
          onClick={() => navigate("/clinic/auth")}
        >
          Klinik
        </MyButton>
        <MyButton
          theme="solidRed"
          minW="200px"
          onClick={() => navigate("/patient/login")}
        >
          Patient
        </MyButton>
      </VStack>
    </Box>
  );
};

export default ChooseRolePage;
