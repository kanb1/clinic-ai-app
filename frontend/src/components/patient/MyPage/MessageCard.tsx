import { Box, Button, Flex, Text, Badge } from "@chakra-ui/react";
import { IMessage } from "@/types/message.types";

interface Props {
  msg: IMessage;
  onOpenMessage: (msg: IMessage) => void;
}

const typeLabels: Record<IMessage["type"], string> = {
  besked: "Besked",
  aflysning: "Aflysning",
  system: "System",
};

const typeColors: Record<IMessage["type"], string> = {
  besked: "blue",
  aflysning: "red",
  system: "gray",
};

const MessageCard = ({ msg, onOpenMessage }: Props) => {
  return (
    <Box
      bg="white"
      borderRadius="lg"
      boxShadow="sm"
      p={4}
      border="1px solid"
      borderColor="gray.200"
      w="full"
      minW={0}
    >
      {/* Header */}
      <Flex justify="space-between" align="center" mb={2}>
        <Text fontSize="sm" fontWeight="semibold">
          {msg.sender_id?.name || "Klinika"}
        </Text>
        <Badge colorScheme={typeColors[msg.type]}>{typeLabels[msg.type]}</Badge>
      </Flex>

      {/* Content */}
      <Flex
        justify="space-between"
        align="center"
        direction={{ base: "column", sm: "row" }}
        gap={3}
      >
        <Text fontSize="md" noOfLines={2} flex="1">
          {msg.content}
        </Text>
        <Button
          colorScheme="blue"
          size="sm"
          onClick={() => onOpenMessage(msg)}
          borderRadius="full"
        >
          Åben
        </Button>
      </Flex>
    </Box>
  );
};

export default MessageCard;
