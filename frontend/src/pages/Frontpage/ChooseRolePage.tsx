import { Box, Heading, VStack, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const ChooseRolePage = () => {
  const navigate = useNavigate();

  return (
    <Box textAlign="center">
      <Heading
        fontWeight="extrabold"
        fontFamily="heading"
        textStyle="heading1"
        mb={0}
      >
        Velkommen
      </Heading>
      <Heading textStyle="body" fontWeight="thin" fontFamily="heading" mt={0}>
        Er du patient eller arbejder hos en klinik? Vælg din adgang herunder.
      </Heading>

      <VStack gap={14} pt={20}>
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
