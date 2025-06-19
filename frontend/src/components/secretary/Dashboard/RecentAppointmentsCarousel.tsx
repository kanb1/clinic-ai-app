import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Badge,
  useBreakpointValue,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { usePastAppointmentsToday } from "@/hooks/secretary/dashboardHooks/useTodaysPastAppointments";

const MotionBox = motion(Box);

const RecentAppointmentsCarousel = () => {
  const { data: pastAppointments, isLoading } = usePastAppointmentsToday();
  // hvilken aftale vises i carousel (kun på mobile)
  const [currentIndex, setCurrentIndex] = useState(0);
  // 1 = next, -1 = previous -> bruges af animationen tila swiping
  const [direction, setDirection] = useState(1);

  const isMobile = useBreakpointValue({ base: true, lg: false });

  const handleNext = () => {
    if (!pastAppointments) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % pastAppointments.length);
  };

  const handlePrev = () => {
    if (!pastAppointments) return;
    setDirection(-1);
    setCurrentIndex((prev) =>
      prev === 0 ? pastAppointments.length - 1 : prev - 1
    );
  };

  if (!pastAppointments || isLoading) return null;

  // Fallback hvis ingen besøg findes
  if (pastAppointments.length === 0) {
    return (
      <Box w="full" position="relative" mt={{ lg: 5 }}>
        <Heading
          textStyle="heading2"
          fontWeight="medium"
          mb={4}
          textAlign={{ base: "center", lg: "left" }}
        >
          Seneste besøg
        </Heading>
        <Text
          fontSize="md"
          color="gray.500"
          textAlign={{ base: "center", lg: "left" }}
        >
          Der har ikke været nogle besøgende indtil videre.
        </Text>
      </Box>
    );
  }

  // Mobile carousel
  return (
    <Box w="full" position="relative" mt={{ lg: 5 }}>
      <Heading
        textStyle="heading2"
        fontWeight="medium"
        mb={4}
        textAlign={{ base: "center", lg: "left" }}
      >
        Seneste besøg
      </Heading>

      {isMobile ? (
        <Flex justify="center" align="center" direction="column" gap={4}>
          <Box position="relative" w="100%" minH="140px" overflow="hidden">
            <AnimatePresence>
              <MotionBox
                // når vi ædnrer curentIndex -> key ændres
                // Framer Motion trigger en exit-animation for det gamle kort og et enter for det nye
                key={currentIndex}
                position="absolute"
                w="full"
                initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                // x: 300: kort starter udenfor skræm til højre
                // x: -300 starter udenfor venstre
                exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                bg="gray.100"
                p={4}
                borderRadius="md"
                boxShadow="sm"
              >
                {/* pastapp. card */}
                <Text fontWeight="bold">
                  {pastAppointments[currentIndex]?.time || "?"} –{" "}
                  {pastAppointments[currentIndex]?.end_time || "?"}
                </Text>
                <Text fontSize="sm">
                  {pastAppointments[currentIndex]?.patient_id?.name ||
                    "Ukendt patient"}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Hos:{" "}
                  {pastAppointments[currentIndex]?.doctor_id?.name ||
                    "Ukendt læge"}
                </Text>
                <Badge
                  mt={2}
                  colorScheme={
                    pastAppointments[currentIndex]?.status === "bekræftet"
                      ? "green"
                      : pastAppointments[currentIndex]?.status === "aflyst"
                      ? "red"
                      : pastAppointments[currentIndex]?.status === "udført"
                      ? "blue"
                      : "gray"
                  }
                >
                  {pastAppointments[currentIndex]?.status?.toUpperCase() ||
                    "UKENDT"}
                </Badge>
              </MotionBox>
            </AnimatePresence>
          </Box>

          <Flex gap={4}>
            <Button onClick={handlePrev}>←</Button>
            <Button onClick={handleNext}>→</Button>
          </Flex>
        </Flex>
      ) : (
        // Desktop visning
        <Flex gap={4} overflowX="auto" px={1}>
          {/* alle kort vises på 1 ting */}
          {pastAppointments.map((appt) => (
            <Box
              key={appt._id}
              minW="30%"
              flexShrink={0}
              bg="gray.100"
              p={4}
              borderRadius="md"
              boxShadow="sm"
            >
              <Text fontWeight="bold">
                {appt?.time || "?"} – {appt.end_time || "?"}
              </Text>
              <Text fontSize="sm">
                {appt?.patient_id?.name || "Ukendt patient"}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Hos: {appt?.doctor_id?.name || "Ukendt læge"}
              </Text>
              <Badge
                mt={2}
                colorScheme={
                  appt.status === "bekræftet"
                    ? "green"
                    : appt.status === "aflyst"
                    ? "red"
                    : appt.status === "udført"
                    ? "blue"
                    : "gray"
                }
              >
                {appt.status?.toUpperCase() || "UKENDT"}
              </Badge>
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  );
};

export default RecentAppointmentsCarousel;
