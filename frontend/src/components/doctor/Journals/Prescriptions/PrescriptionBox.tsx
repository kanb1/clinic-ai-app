// src/components/doctor/Journals/Prescriptions/PrescriptionBox.tsx
import { Box, Button, Text, Heading } from "@chakra-ui/react";

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
    month: "numeric",
    year: "numeric",
  });

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="md"
      bg="gray.50"
      _hover={{ bg: "gray.100" }}
    >
      <Heading size="md" mb={1}>
        {medication_name}
      </Heading>
      <Text>
        {formattedDate} – {dosage}
      </Text>
      <Text mb={3}>{instructions}</Text>
      <Button onClick={onView} variant="outline" size="md">
        Vis
      </Button>
    </Box>
  );
};

export default PrescriptionBox;
