import {
  Box,
  Heading,
  Text,
  Stack,
  Badge,
  Divider,
  Flex,
} from "@chakra-ui/react";

interface TestResult {
  _id: string;
  test_name: string;
  result: string;
  date: string;
  notes?: string;
}

interface Props {
  results: TestResult[];
}

const TestResultBox = ({ results }: Props) => {
  if (!results || results.length === 0) {
    return (
      <Box bg="gray.50" p={6} borderRadius="lg" shadow="sm" mb={6}>
        <Text color="gray.600">
          Ingen testresultater på nuværende tidspunkt
        </Text>
      </Box>
    );
  }

  return (
    <Box bg="gray.50" p={6} borderRadius="lg" shadow="sm" mb={6}>
      <Heading size="md" mb={4}>
        Testresultater
      </Heading>
      <Stack spacing={4}>
        {results.map((res) => (
          <Box
            key={res._id}
            p={4}
            borderWidth={1}
            borderRadius="lg"
            bg="white"
            shadow="xs"
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontWeight="semibold" fontSize="lg">
                {res.test_name}
              </Text>
              <Badge colorScheme="blue" fontSize="0.8em">
                {new Date(res.date).toLocaleDateString("da-DK")}
              </Badge>
            </Flex>
            <Text>
              <strong>Resultat:</strong> {res.result}
            </Text>
            {res.notes && (
              <Text mt={2} color="gray.700">
                <strong>Noter:</strong> {res.notes}
              </Text>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default TestResultBox;
