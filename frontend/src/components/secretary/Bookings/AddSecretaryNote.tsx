import { Box, Button, Textarea, Text, Flex } from "@chakra-ui/react";
import { useState } from "react";

interface Props {
  onConfirm: (note: string) => void;
  onCancel: () => void;
}

const AddSecretaryNote = ({ onConfirm, onCancel }: Props) => {
  const [note, setNote] = useState("");

  return (
    <Box>
      <Text mb={{ base: 6 }} fontWeight="semibold">
        Tilføj note til konsultation
      </Text>
      <Textarea
        placeholder="Symptomer, særlige forhold eller andet..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        mb={4}
      />
      <Flex
        justifyContent={{ base: "start", sm: "end" }}
        flexDirection="row"
        gap={1}
      >
        <Button colorScheme="green" onClick={() => onConfirm(note)} mr={2}>
          Færdig
        </Button>
        <Button colorScheme="red" onClick={onCancel}>
          Fortryd
        </Button>
      </Flex>
    </Box>
  );
};

export default AddSecretaryNote;
