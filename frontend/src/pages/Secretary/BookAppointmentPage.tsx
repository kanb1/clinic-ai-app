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
import PatientGrid from "@/components/shared/PatientGrid";

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
          {isLoading ? (
            <Spinner />
          ) : (
            <PatientGrid
              patients={patients || []}
              isLoading={isLoading}
              primaryLabel="Book tid"
              onPrimaryAction={handleOpenModal}
            />
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
