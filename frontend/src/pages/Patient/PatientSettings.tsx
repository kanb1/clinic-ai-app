import Layout from "@/components/layout/Layout";
import {
  Box,
  Heading,
  Text,
  Button,
  useDisclosure,
  VStack,
  Stack,
  Divider,
  Avatar,
} from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import EditPatientInfoModal from "@/components/patient/Settings/EditPatientInfoModal";

const PatientSettings = () => {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Layout>
      <Box w="full" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 6 }}>
        <Stack spacing={6} align="center">
          <Avatar
            name={user?.name}
            size="xl"
            backgroundColor={"primary.red"}
            color="white"
          />

          <Heading textStyle="heading1" fontSize={{ base: "xl", md: "2xl" }}>
            Mine indstillinger
          </Heading>
          <Text>
            Bemærk at vi har hentet dine oplysninger fra CPR-registret.
          </Text>

          <VStack
            align="stretch"
            spacing={4}
            w="full"
            maxW="lg"
            bg="gray.50"
            p={6}
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.200"
          >
            <Box>
              <Text fontSize="sm" color="gray.500">
                Navn
              </Text>
              <Text fontWeight="medium">{user?.name}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.500">
                Addresse
              </Text>
              <Text fontWeight="medium">
                {user?.address || "Ingen addresse angivet"}
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.500">
                Fødselsdato & CPR
              </Text>
              <Text fontWeight="medium">
                {user?.birth_date
                  ? new Date(user.birth_date).toLocaleDateString("da-DK")
                  : "Ikke angivet"}
              </Text>
              <Text>{user?.cpr_number}</Text>
            </Box>

            <Divider />

            <Box>
              <Text fontSize="sm" color="gray.500">
                Email
              </Text>
              <Text fontWeight="medium">{user?.email}</Text>
            </Box>

            <Divider />

            <Box>
              <Text fontSize="sm" color="gray.500">
                Telefon
              </Text>
              <Text fontWeight="medium">{user?.phone || "Ikke angivet"}</Text>
            </Box>
          </VStack>

          <Button variant="solidRed" onClick={onOpen}>
            Rediger oplysninger
          </Button>
        </Stack>

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
