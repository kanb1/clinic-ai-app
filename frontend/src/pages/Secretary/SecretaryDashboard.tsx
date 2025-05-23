import { useUnreadMessages } from "../../hooks/secretary/dashboardHooks/useUnreadMessages";
import { useMarkMessageAsRead } from "../../hooks/secretary/dashboardHooks/useMarkMessageAsRead";
import { useStaffStatus } from "../../hooks/secretary/dashboardHooks/useStaffStatus";
import { useUpdateMyStatus } from "../../hooks/secretary/dashboardHooks/useUpdateMyStatus";
import ToggleStatusButton from "../../components/ui/ToggleStatusButton";

import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";

const SecretaryDashboard = () => {
  const { data, isLoading, error } = useUnreadMessages();
  const { mutate: markAsRead } = useMarkMessageAsRead();
  const { data: staff } = useStaffStatus();
  const { mutate: updateStatus } = useUpdateMyStatus();
  const { user } = useAuth();

  const handleToggle = (currentStatus: "ledig" | "optaget") => {
    const newStatus = currentStatus === "ledig" ? "optaget" : "ledig";
    updateStatus({ status: newStatus });
  };

  return (
    <Flex p={4} gap={8} alignItems="flex-start">
      <Box flex={1}>
        <Heading size="md" mb={4}>
          📨 Nye beskeder til klinikken
        </Heading>

        {isLoading && <Spinner />}
        {error && <Text color="red.500">Kunne ikke hente beskeder.</Text>}

        <VStack spacing={4} align="stretch">
          {data?.length === 0 ? (
            <Text>Ingen nye beskeder</Text>
          ) : (
            data?.map((msg) => (
              <Box
                key={msg._id}
                p={4}
                bg="gray.100"
                borderRadius="md"
                boxShadow="sm"
              >
                <Text fontWeight="bold">
                  {msg.sender_id.name} ({msg.sender_id.role})
                </Text>
                <Text mb={2}>{msg.content}</Text>
                <Text fontSize="sm" color="gray.600">
                  {new Date(msg.createdAt).toLocaleString("da-DK")}
                </Text>

                {!msg.read && (
                  <Button mt={2} size="sm" onClick={() => markAsRead(msg._id)}>
                    Markér som læst
                  </Button>
                )}

                <Text
                  mt={2}
                  color={msg.read ? "green.600" : "red.600"}
                  fontWeight="medium"
                >
                  {msg.read ? "✅ Læst" : "📩 Ulæst"}
                </Text>
              </Box>
            ))
          )}
        </VStack>
      </Box>

      <Box w="xs">
        <Heading size="sm" mb={4}>
          Personale
        </Heading>
        <VStack align="start" spacing={3}>
          {staff?.map((person) => {
            const isSelf = user && person._id === user.id;
            const canToggle =
              isSelf && ["ledig", "optaget"].includes(person.status);

            return (
              <Box
                key={person._id}
                p={3}
                bg="gray.50"
                borderRadius="md"
                w="full"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                boxShadow="sm"
              >
                <Box>
                  <Text fontWeight="bold">{person.name}</Text>
                  <Text fontSize="sm">{person.role}</Text>
                </Box>

                <Badge
                  colorScheme={
                    person.status === "ledig"
                      ? "green"
                      : person.status === "optaget"
                      ? "red"
                      : "yellow"
                  }
                >
                  {person.status}
                </Badge>

                {canToggle && (
                  <>
                    <ToggleStatusButton
                      currentStatus={person.status as "ledig" | "optaget"}
                      onToggle={() =>
                        handleToggle(person.status as "ledig" | "optaget")
                      }
                    />
                  </>
                )}
              </Box>
            );
          })}
        </VStack>
      </Box>
    </Flex>
  );
};

export default SecretaryDashboard;
