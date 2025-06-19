import { Box, Button, Text, Heading, Stack } from "@chakra-ui/react";

// viser bare prescriptiondetaljer -> fået af parent

interface Props {
  prescription: {
    _id: string;
    medication_name: string;
    dosage: string;
    instructions: string;
    issued_date: string;
  };
  onView: () => void;
}

const PrescriptionBox = ({ prescription, onView }: Props) => {
  const { medication_name, dosage, instructions, issued_date } = prescription;

  const formattedDate = new Date(issued_date).toLocaleDateString("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={5}
      bg="white"
      shadow="sm"
      _hover={{ bg: "gray.50" }}
      w="full"
    >
      <Stack spacing={1} mb={3}>
        <Heading size="sm">{medication_name}</Heading>
        <Text color="gray.600">{formattedDate}</Text>
        <Text fontWeight="medium">{dosage}</Text>
        <Text fontSize="sm" color="gray.700">
          {instructions}
        </Text>
      </Stack>
      <Button
        onClick={onView}
        backgroundColor="primary.red"
        color="white"
        _hover={{ bg: "red.600" }}
        fontSize="sm"
        fontWeight="medium"
        rounded="2xl"
        px={4}
        py={2}
        w="full"
        maxW="16rem"
      >
        Vis detaljer
      </Button>
    </Box>
  );
};

export default PrescriptionBox;
