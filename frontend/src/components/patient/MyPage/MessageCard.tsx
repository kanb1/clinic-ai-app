import { Box, Button, Text } from "@chakra-ui/react";

interface Props {
  msg: any;
  onOpenMessage: (msg: any) => void;
}

const MessageCard = ({ msg, onOpenMessage }: Props) => {
  return (
    <Box borderWidth="1px" p={4} borderRadius="md">
      <Text fontWeight="semibold" isTruncated>
        {msg.content}
      </Text>
      <Button
        colorScheme="blue"
        size="sm"
        mt={2}
        onClick={() => onOpenMessage(msg)}
      >
        Åben
      </Button>
    </Box>
  );
};

export default MessageCard;
