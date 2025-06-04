import { Box, Button, Textarea, Text, Flex, useToast } from "@chakra-ui/react";
import { useState } from "react";

interface Props {
  onConfirm: (note: string) => void;
  onCancel: () => void;
}

const AddSecretaryNote = ({ onConfirm, onCancel }: Props) => {
  const [note, setNote] = useState("");
  const toast = useToast();

  const handleConfirm = () => {
    const wordCount = note.trim().split(/\s+/).length;

    if (!note.trim()) {
      toast({
        title: "Note kan ikke være tom.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (wordCount < 5) {
      toast({
        title: "Noten er for kort.",
        description: "Skriv mindst 5 ord, fx symptomer eller observationer.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (note.length > 500) {
      toast({
        title: "Noten er for lang.",
        description: "Max 500 tegn.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    onConfirm(note.trim());
  };

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
        <Button colorScheme="green" onClick={handleConfirm} mr={2}>
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
