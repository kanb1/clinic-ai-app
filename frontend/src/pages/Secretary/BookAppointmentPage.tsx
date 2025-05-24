import Layout from "@/components/layout/Layout";
import {
  Box,
  Button,
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
      <Box p={10}>
        <Heading size="lg" mb={4}>
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
          <VStack align="start" spacing={4}>
            {patients
              ?.filter((p) =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((p) => (
                <Box
                  key={p._id}
                  p={4}
                  borderWidth={1}
                  borderRadius="md"
                  w="100%"
                >
                  <Text fontWeight="bold">{p.name}</Text>
                  <Text>
                    Fødselsdato:{" "}
                    {p.birth_date
                      ? new Date(p.birth_date).toLocaleDateString("da-DK")
                      : "Ukendt"}
                  </Text>
                  <Button mt={2} onClick={() => handleOpenModal(p._id)}>
                    Book tid
                  </Button>
                </Box>
              ))}
          </VStack>
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
    </Layout>
  );
};

export default BookingPage;
