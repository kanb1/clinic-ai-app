import { Box, Button, Textarea, Text } from "@chakra-ui/react";
import { useState } from "react";

interface Props {
  onConfirm: (note: string) => void;
  onCancel: () => void;
}

const AddSecretaryNote = ({ onConfirm, onCancel }: Props) => {
  const [note, setNote] = useState("");

  return (
    <Box>
      <Text mb={2} fontWeight="semibold">
        Tilføj note til konsultation
      </Text>
      <Textarea
        placeholder="Symptomer, særlige forhold eller andet..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        mb={4}
      />
      <Button colorScheme="green" onClick={() => onConfirm(note)} mr={2}>
        Færdig
      </Button>
      <Button variant="ghost" onClick={onCancel}>
        Fortryd
      </Button>
    </Box>
  );
};

export default AddSecretaryNote;
