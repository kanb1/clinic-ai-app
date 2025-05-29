import {
  Text,
  VStack,
  Box,
  Button,
  SimpleGrid,
  Heading,
} from "@chakra-ui/react";
import { useAvailabilityOverview } from "../../../hooks/secretary/bookingHooks/useAvailabilityOverview";
import { format, getWeek } from "date-fns";
import { da } from "date-fns/locale";

interface AvailabilityItem {
  doctorId: string;
  doctorName: string;
  date: string;
  availableSlots: number;
}

interface Props {
  weekStart: string;
  doctorId?: string;
  onSelectDate?: (date: string) => void;
}

const AvailabilityDisplay = ({ weekStart, doctorId, onSelectDate }: Props) => {
  const { data, isLoading } = useAvailabilityOverview(weekStart, doctorId);

  const groupedByWeek: Record<string, AvailabilityItem[]> = {};

  data?.forEach((item) => {
    if (!item.date) return;
    const week = `Uge ${getWeek(new Date(item.date))}`;
    groupedByWeek[week] = groupedByWeek[week] || [];
    groupedByWeek[week].push(item);
  });

  if (isLoading) return <Text>Indlæser...</Text>;

  const weekdays = ["mandag", "tirsdag", "onsdag", "torsdag", "fredag"];

  return (
    <VStack align="center" spacing={8}>
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
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={4}>
            {" "}
            {weekdays.map((dayName) => {
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
