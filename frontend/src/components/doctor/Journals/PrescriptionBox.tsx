import { Box, Text, Button, VStack, Heading } from "@chakra-ui/react";

interface Prescription {
  _id: string;
  medication_name: string;
  dosage: string;
  instructions: string;
  issued_date: string;
}

interface Props {
  prescriptions: Prescription[];
}

const PrescriptionBox = ({ prescriptions }: Props) => {
  return (
    <Box bg="white" borderRadius="md" p={4} shadow="sm">
      <Heading size="md" mb={3}>
        Recept
      </Heading>
      <VStack spacing={3} align="stretch">
        {prescriptions.map((rx) => (
          <Box
            key={rx._id}
            p={3}
            borderWidth="1px"
            borderRadius="md"
            bg="gray.50"
          >
            <Text fontWeight="semibold">{rx.medication_name}</Text>
            <Text fontSize="sm" color="gray.600">
              {new Date(rx.issued_date).toLocaleDateString()} – {rx.dosage}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {rx.instructions}
            </Text>
            <Button size="sm" mt={2} variant="outline" colorScheme="blue">
              Vis
            </Button>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default PrescriptionBox;
