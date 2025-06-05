import {
  Box,
  Button,
  Heading,
  Textarea,
  useToast,
  Select,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useSendSystemMessage } from "@/hooks/admin/admin-messageHooks/useSendSystemMessage";

const AdminSendMessagePage = () => {
  const [content, setContent] = useState("");
  const [receiverScope, setReceiverScope] = useState<
    "all" | "staff" | "patients"
  >("all");

  const toast = useToast();
  const { mutate, isPending } = useSendSystemMessage();

  const handleSend = () => {
    if (!content.trim()) {
      toast({ title: "Besked kan ikke være tom", status: "warning" });
      return;
    }

    if (content.trim().split(/\s+/).length < 5) {
      toast({
        title: "Beskeden er for kort",
        description: "Mindst 5 ord",
        status: "warning",
      });
      return;
    }

    if (content.length > 1000) {
      toast({
        title: "Beskeden er for lang",
        description: "Maks. 1000 tegn",
        status: "warning",
      });
      return;
    }

    mutate(
      { content, receiver_scope: receiverScope },
      {
        onSuccess: () => {
          toast({ title: "Systembesked sendt", status: "success" });
          setContent("");
        },
        onError: () => {
          toast({ title: "Kunne ikke sende besked", status: "error" });
        },
      }
    );
  };

  return (
    <Layout>
      <Box w="full" maxW="lg" mx="auto" mt={6}>
        <Heading size="lg" mb={4}>
          Send systembesked
        </Heading>

        <VStack align="stretch" spacing={4}>
          <Select
            value={receiverScope}
            onChange={(e) =>
              setReceiverScope(e.target.value as "all" | "staff" | "patients")
            }
          >
            <option value="all">Alle brugere</option>
            <option value="staff">Kun personale</option>
            <option value="patients">Kun patienter</option>
          </Select>

          <Textarea
            placeholder="Skriv din besked her..."
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <Button
            onClick={handleSend}
            isLoading={isPending}
            colorScheme="red"
            alignSelf="end"
          >
            Send besked
          </Button>
        </VStack>
      </Box>
    </Layout>
  );
};

export default AdminSendMessagePage;
