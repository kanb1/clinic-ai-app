import { Box, Text } from "@chakra-ui/react";
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
    <Box borderWidth="1px" p={4} borderRadius="md">
      <Text fontWeight="bold">{prescription.medication_name}</Text>
      <Text>Dosis: {prescription.dosage}</Text>
      <Text>Instruktion: {prescription.instructions}</Text>
      <Text>
        Udstedt: {moment(prescription.issued_date).format("DD/MM/YYYY")}
      </Text>
    </Box>
  );
};

export default PrescriptionCard;
