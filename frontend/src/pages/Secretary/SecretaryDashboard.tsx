import Layout from "@/components/layout/Layout";
import { useUnreadMessages } from "../../hooks/secretary/dashboardHooks/useUnreadMessages";
import { useMarkMessageAsRead } from "../../hooks/secretary/dashboardHooks/useMarkMessageAsRead";
import { useStaffStatus } from "../../hooks/secretary/dashboardHooks/useStaffStatus";
import { useUpdateMyStatus } from "../../hooks/secretary/dashboardHooks/useUpdateMyStatus";
import ToggleStatusButton from "../../components/ui/ToggleStatusButton";
import { usePastAppointmentsToday } from "../../hooks/secretary/dashboardHooks/useTodaysPastAppointments";
import { useRef, useEffect, useState } from "react";

import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  VStack,
  Stack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";

const SecretaryDashboard = () => {
  const { data, isLoading, error } = useUnreadMessages();
  const { mutate: markAsRead } = useMarkMessageAsRead();
  const { data: staff } = useStaffStatus();
  const { mutate: updateStatus } = useUpdateMyStatus();
  const { user } = useAuth();
  const { data: pastAppointments, isLoading: isLoadingPast } =
    usePastAppointmentsToday();

  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const cardsToShow = useBreakpointValue({ base: 6, sm: 6, md: 6, lg: 6 });

  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const checkScroll = () => {
      setCanScroll(el.scrollWidth > el.clientWidth);
    };
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const handleToggle = (currentStatus: "ledig" | "optaget") => {
    const newStatus = currentStatus === "ledig" ? "optaget" : "ledig";
    updateStatus({ status: newStatus });
  };

  return (
    <Layout>
      <Stack spacing={6} w="full" p={{ md: 4 }}>
        <Heading textStyle="heading1">Dashboard</Heading>
        {/* Seneste besøg */}
        <Box w="full">
          <Heading
            textStyle="heading2"
            fontWeight="medium"
            mb={{ base: "10px", sm: "12px", md: "14px" }}
          >
            Seneste besøg
          </Heading>
          {isLoadingPast && <Spinner />}

          <Box position="relative">
            <Flex
              ref={scrollRef}
              gap={4}
              overflowX="auto"
              scrollBehavior="smooth"
              pb={2}
              px={1}
              sx={{
                scrollSnapType: "x mandatory",
                scrollPadding: "1rem",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {pastAppointments?.map((appt) => (
                <Box
                  key={appt._id}
                  minW={{
                    base: "20%",
                    sm: "20%",
                    md: "30%",
                    lg: "30%",
                    xl: "30%",
                  }}
                  maxW="100%"
                  bg="gray.100"
                  p={4}
                  borderRadius="md"
                  boxShadow="sm"
                  flexShrink={0}
                  scrollSnapAlign="start"
                >
                  <Text fontWeight="bold">
                    {appt.time} – {appt.end_time || "?"}
                  </Text>
                  <Text fontSize="sm">
                    {appt.patient_id?.name || "Ukendt patient"}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Hos: {appt.doctor_id?.name || "Ukendt læge"}
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
                    {appt.status.toUpperCase()}
                  </Badge>
                </Box>
              ))}
            </Flex>

            {/* Scroll knapper */}
            <Button
              position="absolute"
              bottom={{ base: "-10%" }}
              left="0"
              zIndex="1"
              size="md"
              display={{ base: "flex", md: "flex" }}
              onClick={() =>
                scrollRef.current?.scrollBy({
                  left: -220,
                  behavior: "smooth",
                })
              }
            >
              ←
            </Button>
            <Button
              position="absolute"
              bottom={{ base: "-10%" }}
              right={{ base: "65%", sm: "43%", md: "8%", xl: "0%" }}
              zIndex="1"
              size="md"
              display={{ base: "flex", md: "flex" }}
              onClick={() =>
                scrollRef.current?.scrollBy({
                  left: 220,
                  behavior: "smooth",
                })
              }
            >
              →
            </Button>
          </Box>
        </Box>

        {/* Beskeder + Personale */}
        <Stack
          direction={{ base: "column", xl: "row" }}
          spacing={{ base: 12, sm: 14, xl: 6 }}
          align="start"
          wrap="wrap"
          w="full"
          pt={{ base: 6, sm: 8, xl: 4 }}
        >
          {/* Beskeder */}
          <Box
            flex={1}
            minW={0}
            maxW={{ base: "35%", sm: "56%", md: "90%", lg: "86%" }}
            w="100%"
          >
            <Heading
              textStyle="heading2"
              fontWeight="medium"
              mb={{ base: "10px", sm: "12px", md: "14px" }}
            >
              {" "}
              Nye beskeder
            </Heading>

            {isLoading && <Spinner />}
            {error && <Text color="red.500">Kunne ikke hente beskeder.</Text>}

            <VStack spacing={4} align="stretch">
              {data?.length === 0 ? (
                <Text>Ingen nye beskeder</Text>
              ) : (
                data?.map((msg) => (
                  <Box
                    key={msg._id}
                    p={4}
                    bg="gray.100"
                    borderRadius="md"
                    boxShadow="sm"
                  >
                    <Text fontWeight="bold">
                      {msg.sender_id.name} ({msg.sender_id.role})
                    </Text>
                    <Text mb={2}>{msg.content}</Text>
                    <Text fontSize="sm" color="gray.600">
                      {new Date(msg.createdAt).toLocaleString("da-DK")}
                    </Text>

                    {!msg.read && (
                      <Button
                        mt={2}
                        size="sm"
                        onClick={() => markAsRead(msg._id)}
                      >
                        Markér som læst
                      </Button>
                    )}

                    <Text
                      mt={2}
                      color={msg.read ? "green.600" : "red.600"}
                      fontWeight="medium"
                    >
                      {msg.read ? "✅ Læst" : "📩 Ulæst"}
                    </Text>
                  </Box>
                ))
              )}
            </VStack>
          </Box>

          {/* Personale */}
          <Box
            w="100%"
            maxW={{ base: "35%", sm: "56%", md: "90%", lg: "86%", xl: "65%" }}
            overflowX="hidden"
          >
            <Heading
              textStyle="heading2"
              fontWeight="medium"
              mb={{ base: "10px", sm: "12px", md: "14px" }}
            >
              {" "}
              Personale
            </Heading>
            <VStack align="start" spacing={3} w="full">
              {staff?.map((person) => {
                const isSelf = user && person._id === user.id;
                const canToggle =
                  isSelf && ["ledig", "optaget"].includes(person.status);

                return (
                  <Box
                    key={person._id}
                    p={3}
                    bg="gray.50"
                    borderRadius="md"
                    w="full"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    boxShadow="sm"
                  >
                    <Box>
                      <Text fontWeight="bold">{person.name}</Text>
                      <Text fontSize="sm">{person.role}</Text>
                    </Box>

                    <Badge
                      colorScheme={
                        person.status === "ledig"
                          ? "green"
                          : person.status === "optaget"
                          ? "red"
                          : "yellow"
                      }
                    >
                      {person.status}
                    </Badge>

                    {canToggle && (
                      <ToggleStatusButton
                        currentStatus={person.status as "ledig" | "optaget"}
                        onToggle={() =>
                          handleToggle(person.status as "ledig" | "optaget")
                        }
                      />
                    )}
                  </Box>
                );
              })}
            </VStack>
          </Box>
        </Stack>
      </Stack>
    </Layout>
  );
};

export default SecretaryDashboard;
