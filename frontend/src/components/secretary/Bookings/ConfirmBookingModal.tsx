import { Box, Button, Flex, Text, VStack } from "@chakra-ui/react";

interface ConfirmBookingModalProps {
  date: string;
  time: string;
  doctorName: string;
  note: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmBookingModal = ({
  date,
  time,
  doctorName,
  note,
  onConfirm,
  onCancel,
}: ConfirmBookingModalProps) => {
  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold" mb={3}>
        Er du sikker på dit valg?
      </Text>
      <VStack spacing={2} align="start">
        <Text>
          <strong>Dato:</strong> {date}
        </Text>
        <Text>
          <strong>Tid:</strong> {time}
        </Text>
        <Text>
          <strong>Læge:</strong> {doctorName}
        </Text>
        <Text>
          <strong>Note:</strong> {note || "Ingen note angivet"}
        </Text>
      </VStack>
      <Flex
        justifyContent={{ base: "start", sm: "end" }}
        flexDirection="row"
        gap={1}
      >
        <Button mt={4} colorScheme="green" mr={2} onClick={onConfirm}>
          Bekræft
        </Button>
        <Button mt={4} colorScheme="red" onClick={onCancel}>
          Fortryd
        </Button>
      </Flex>
    </Box>
  );
};

export default ConfirmBookingModal;
