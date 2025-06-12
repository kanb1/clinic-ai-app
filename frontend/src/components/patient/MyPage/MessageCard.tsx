import { Box, Button, Flex, Text, Badge, Spacer } from "@chakra-ui/react";
import { IMessage } from "@/types/message.types";
import { CloseIcon } from "@chakra-ui/icons";

interface Props {
  msg: IMessage;
  onOpenMessage: (msg: IMessage) => void;
  onMarkAsRead?: (id: string) => void;
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

const MessageCard = ({ msg, onOpenMessage, onMarkAsRead }: Props) => {
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
      <Flex justify="space-between" align="center" mb={2} wrap="wrap" gap={2}>
        <Flex gap={2} align="center">
          <Text fontSize="sm" fontWeight="semibold">
            {msg.sender_id?.name || "Klinika"}
          </Text>
          <Badge colorScheme={typeColors[msg.type]}>
            {typeLabels[msg.type]}
          </Badge>
        </Flex>

        <Flex align="center" gap={2}>
          <Text fontSize="xs" color={msg.read ? "green.500" : "gray.500"}>
            {msg.read
              ? "🟢 Læst"
              : msg.receiver_scope !== "individual"
              ? "🔔 Fælles besked"
              : "🔴 Ulæst"}
          </Text>
          {onMarkAsRead && !msg.read && msg.receiver_scope === "individual" && (
            <Button
              size="xs"
              variant="ghost"
              colorScheme="blue"
              onClick={() => onMarkAsRead(msg._id)}
            >
              Markér som læst
            </Button>
          )}
        </Flex>
      </Flex>

      {/* Beskedindhold og åbenknap */}
      <Flex
        justify="space-between"
        align="center"
        direction={{ base: "column", sm: "row" }}
        gap={3}
      >
        <Text fontSize="md" noOfLines={3} flex="1">
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
