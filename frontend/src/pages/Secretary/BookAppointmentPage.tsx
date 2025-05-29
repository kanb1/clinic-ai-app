import Layout from "@/components/layout/Layout";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Spinner,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { usePatients } from "@/hooks/common/usePatients";
import BookAppointmentModal from "@/components/secretary/Bookings/BookAppointmentModal";
import { formatISO } from "date-fns";
import { api } from "@/services/httpClient";

const BookingPage = () => {
  const { data: patients, isLoading } = usePatients();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenModal = (patientId: string) => {
    setSelectedPatientId(patientId);
    onOpen();
  };

  const weekStart = formatISO(new Date(), { representation: "date" }); // fx 2025-05-24

  // tjekker automatisk når vi loader pagen om der er behov for at tilføje de ekstra slots
  useEffect(() => {
    const checkSlots = async () => {
      try {
        await api.get("/secretary/check-and-seed-slots");
        console.log("Slots er tjekket og seedet hvis nødvendigt");
      } catch (error) {
        console.error("Fejl ved tjek af slots", error);
      }
    };
    checkSlots();
  }, []);

  return (
    <Layout>
      <Flex
        direction="column"
        alignItems="center"
        w="full"
        maxW={{ base: "400px", md: "100%" }}
        px={{ base: 0, md: 4, xl: 6 }}
        py={{ base: 0, sm: 2, xl: 4 }}
        mx="auto"
      >
        <Box
          w="full"
          maxW={{ base: "400px", md: "100%" }}
          textAlign="center"
          py={{ md: 3, lg: 5, xl: 5 }}
        >
          {" "}
          <Heading size="lg" mb={{ base: 4, md: 7, lg: 10 }}>
            Sekretær Bookingpage
          </Heading>
          <Box mb={6}>
            <input
              type="text"
              placeholder="Søg efter patient"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            />
          </Box>
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
                templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                gap={4}
              >
                {patients
                  ?.filter((p) =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((p) => (
                    <Box
                      key={p._id}
                      p={4}
                      bg="gray.100"
                      borderRadius="md"
                      boxShadow="sm"
                    >
                      <Text fontWeight="bold">{p.name}</Text>
                      <Text>
                        Fødselsdato:{" "}
                        {p.birth_date
                          ? new Date(p.birth_date).toLocaleDateString("da-DK")
                          : "Ukendt"}
                      </Text>
                      <Button
                        colorScheme="blue"
                        size={{ base: "sm", sm: "md", lg: "lg" }}
                        px={{ base: 3 }}
                        py={{ base: 5 }}
                        mt={2}
                        onClick={() => handleOpenModal(p._id)}
                      >
                        Book tid
                      </Button>
                    </Box>
                  ))}
              </Grid>
            </Box>
          )}
          {selectedPatientId && (
            <BookAppointmentModal
              isOpen={isOpen}
              onClose={onClose}
              patientId={selectedPatientId}
              weekStart={weekStart}
            />
          )}
        </Box>
      </Flex>
    </Layout>
  );
};

export default BookingPage;
