import {
  Text,
  VStack,
  Box,
  Button,
  SimpleGrid,
  Heading,
} from "@chakra-ui/react";
import { useAvailabilityOverview } from "../../../hooks/secretary/bookingHooks/useAvailabilityOverview";
//format: vise navnet på dagen
// getWeek(date) -> find hvilken uge et tidspunkt tilhører
import { format, getWeek } from "date-fns";
import { da } from "date-fns/locale";

interface AvailabilityItem {
  doctorId: string;
  doctorName: string;
  date: string;
  availableSlots: number;
}

// Fra bookappointmentmodal.tsx
interface Props {
  weekStart: string;
  doctorId?: string;
  onSelectDate?: (date: string) => void;
}

const AvailabilityDisplay = ({ weekStart, doctorId, onSelectDate }: Props) => {
  const { data, isLoading } = useAvailabilityOverview(weekStart, doctorId);

  // Gruppér slots efter uge - Objekt med "key", [value] par: "Uge 25"
  const groupedByWeek: Record<string, AvailabilityItem[]> = {};

  // loop igennem hver data (hver (dag))
  data?.forEach((item) => {
    if (!item.date) return;
    // hvilken uge tilhører denne date til -> konverterr streng til date-objekt
    // getWeek returnerer ugenummeret (Uge 25)
    // bliver vores group-key i groupedByWeek objektet
    const week = `Uge ${getWeek(new Date(item.date))}`;
    // sikrer at groupedByWeek er et array før det pushes
    groupedByWeek[week] = groupedByWeek[week] || [];
    // Nu hvor vi har sikret at ugen eksisterer i dato-objektet/array^ -> tilføj item til det
    // så alle items med Uge 25 bliver samlet i en liste
    groupedByWeek[week].push(item);
    // får til sidst: "Uge 24": [item1, item2], "Uge 25": []...
  });

  if (isLoading) return <Text>Indlæser...</Text>;

  const weekdays = ["mandag", "tirsdag", "onsdag", "torsdag", "fredag"];

  return (
    <VStack align="center" spacing={8}>
      {/* object.entries(..) -> konverterer groupedByWeek-objekt til et array -> så ka vin map 1 uge ad gangen */}
      {/* week: fx "Uge 25", slots: arrayt af availabilityitemobj. for den uge */}
      {Object.entries(groupedByWeek).map(([week, slots]) => (
        <Box key={week} w="full">
          <Heading
            size="heading3"
            color="secondary.blue"
            my={{ base: 6 }}
            textAlign={"center"}
          >
            {week}
          </Heading>
          {/* weekdays.map: gennemgår hver ugedag og viser dens tider */}
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={4}>
            {" "}
            {weekdays.map((dayName) => {
              // konverterer slot.date til dagens navn på dansk
              // sammenligner med dayName og filtrer kun slots for den dag
              const slotsForDay = slots.filter(
                (slot) =>
                  slot.date &&
                  format(new Date(slot.date), "EEEE", {
                    locale: da,
                  }).toLowerCase() === dayName
              );

              return (
                <VStack key={dayName} align="start" spacing={2}>
                  <Text
                    fontWeight="semibold"
                    textTransform="capitalize"
                    textAlign="center"
                    w="full"
                  >
                    {dayName}
                  </Text>
                  {/* vis en boks for hver ledig tid via map */}
                  {slotsForDay.length > 0 ? (
                    slotsForDay.map((slot) => (
                      <Box
                        key={`${slot.date}-${slot.doctorId}`}
                        p={3}
                        borderWidth={1}
                        borderRadius="md"
                        bg="gray.50"
                        textAlign="center"
                        w="100%"
                        minW={0}
                      >
                        <Text fontSize="sm">{slot.doctorName}</Text>
                        <Text fontSize="sm">{slot.availableSlots} tider</Text>
                        <Button
                          colorScheme="blue"
                          size={{ base: "xs", sm: "sm", md: "md" }}
                          py={{ base: 4 }}
                          mt={2}
                          // bookappointmentmodal får denne værdi -> videre til næste step
                          onClick={() => onSelectDate?.(slot.date)}
                        >
                          Vælg
                        </Button>
                      </Box>
                    ))
                  ) : (
                    <Box
                      p={3}
                      borderWidth={1}
                      borderRadius="md"
                      bg="gray.50"
                      textAlign="center"
                      w="100%"
                      minW={0}
                    >
                      <Text fontSize="sm">Ingen tider</Text>
                    </Box>
                  )}
                </VStack>
              );
            })}
          </SimpleGrid>
        </Box>
      ))}
    </VStack>
  );
};

export default AvailabilityDisplay;
