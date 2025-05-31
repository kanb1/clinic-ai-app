import Layout from "@/components/layout/Layout";
import { Box, Heading, Text, Button, useDisclosure } from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import EditPatientInfoModal from "@/components/patient/Settings/EditPatientInfoModal";

const PatientSettings = () => {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Layout>
      <Box p={10}>
        <Heading size="lg" mb={6}>
          Mine indstillinger
        </Heading>

        <Text>
          <strong>Navn:</strong> {user?.name}
        </Text>
        <Text>
          <strong>Email:</strong> {user?.email}
        </Text>
        <Text>
          <strong>Telefon:</strong> {user?.phone || "Ikke angivet"}
        </Text>

        <Button mt={5} colorScheme="blue" onClick={onOpen}>
          Rediger oplysninger
        </Button>

        <EditPatientInfoModal
          isOpen={isOpen}
          onClose={onClose}
          initialEmail={user?.email || ""}
          initialPhone={user?.phone}
        />
      </Box>
    </Layout>
  );
};

export default PatientSettings;
