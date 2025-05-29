import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Input,
  Spinner,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { usePatients } from "../../hooks/common/usePatients";
import MessageModal from "../../components/secretary/Messages/MessageModal";
import Layout from "@/components/layout/Layout";

const MessagePage = () => {
  const { data: patients, isLoading } = usePatients();
  const [search, setSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [receiverScope, setReceiverScope] = useState<"patients" | "individual">(
    "patients"
  );

  const filteredPatients = patients?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAllPatientsModal = () => {
    setReceiverScope("patients");
    setSelectedPatientId(null);
    onOpen();
  };

  const handleOpenIndividualModal = (patientId: string) => {
    setReceiverScope("individual");
    setSelectedPatientId(patientId);
    onOpen();
  };

  return (
    <Layout>
      <Flex
        direction="column"
        alignItems="center"
        w="full"
        maxW={{ base: "400px", md: "100%" }}
        p={{ base: 0, md: 4, xl: 6 }}
        mx="auto"
      >
        <Box
          w="full"
          maxW={{ base: "400px", md: "100%" }}
          textAlign="center"
          pt={{ xl: 3 }}
        >
          <Heading textAlign="center">Send en besked</Heading>

          <Button
            mt={{ base: 6 }}
            mb={{ base: 6 }}
            onClick={handleOpenAllPatientsModal}
            colorScheme="blue"
            size={{ base: "xs", sm: "sm", md: "md" }}
            px={{ base: 3 }}
            py={{ base: 5 }}
          >
            + Ny besked til alle patienter
          </Button>

          <Input
            placeholder="Søg efter patient"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            mb={6}
          />

          {isLoading ? (
            <Spinner />
          ) : (
            <Box
              maxH={{ base: "70vh", sm: "50vh", md: "80%", lg: "100%" }}
              overflowY="auto"
              pr={2}
              sx={{
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "gray.100",
                  borderRadius: "full",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "gray.400",
                  borderRadius: "full",
                },
              }}
            >
              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(3, 1fr)",
                }}
                gap={4}
              >
                {filteredPatients?.map((patient) => (
                  <Box
                    key={patient._id}
                    p={4}
                    bg="gray.100"
                    borderRadius="md"
                    boxShadow="sm"
                  >
                    <Text fontWeight="bold">{patient.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {patient.birth_date
                        ? new Date(patient.birth_date).toLocaleDateString(
                            "da-DK"
                          )
                        : "Ingen fødselsdato"}
                    </Text>
                    <Button
                      size="sm"
                      mt={2}
                      onClick={() => handleOpenIndividualModal(patient._id)}
                      backgroundColor={"blue.200"}
                      px={6}
                    >
                      Send besked
                    </Button>
                  </Box>
                ))}
              </Grid>
            </Box>
          )}

          <MessageModal
            isOpen={isOpen}
            onClose={onClose}
            receiverScope={receiverScope}
            receiverId={selectedPatientId || undefined}
          />
        </Box>
      </Flex>
    </Layout>
  );
};

export default MessagePage;
