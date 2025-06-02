import { Box, Text, Flex, Icon, VStack, Badge } from "@chakra-ui/react";
import { FaPills } from "react-icons/fa";
import moment from "moment";

interface Props {
  prescription: {
    _id: string;
    medication_name: string;
    dosage: string;
    instructions: string;
    issued_date: string;
  };
}

const PrescriptionCard = ({ prescription }: Props) => {
  return (
    <Box
      border="1px solid"
      borderColor="gray.200"
      borderRadius="lg"
      boxShadow="sm"
      p={4}
      w="full"
      bg="white"
    >
      <Flex align="center" gap={3} mb={3}>
        <Icon as={FaPills} boxSize={5} color="blue.500" />
        <Text fontWeight="bold" fontSize="lg">
          {prescription.medication_name}
        </Text>
      </Flex>

      <VStack align="start" spacing={2}>
        <Text>
          <strong>Dosis:</strong> {prescription.dosage}
        </Text>
        <Text>
          <strong>Instruktion:</strong> {prescription.instructions}
        </Text>
        <Text fontSize="sm" color="gray.600">
          Udstedt: {moment(prescription.issued_date).format("DD/MM/YYYY")}
        </Text>
      </VStack>
    </Box>
  );
};

export default PrescriptionCard;
