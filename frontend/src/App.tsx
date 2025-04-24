import { Box, Heading, Text, Spinner } from "@chakra-ui/react";
import { usePing } from "./hooks/usePing";

function App() {
  const { data, isLoading, error } = usePing();

  return (
    <Box p={6}>
      <Heading size="lg">Ping Backend</Heading>

      {isLoading && <Spinner mt={4} />}
      {error && <Text color="red.500">Error: {String(error)}</Text>}
      {data && <Text mt={4}>✅ Response: {data.message}</Text>}
    </Box>
  );
}

export default App;
