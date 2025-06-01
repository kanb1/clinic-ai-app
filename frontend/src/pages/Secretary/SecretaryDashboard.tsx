import Layout from "@/components/layout/Layout";
import { useUnreadMessages } from "../../hooks/secretary/dashboardHooks/useUnreadMessages";
import { useMarkMessageAsRead } from "../../hooks/secretary/dashboardHooks/useMarkMessageAsRead";
import { useStaffStatus } from "../../hooks/common/useStaffStatus";
import { useUpdateMyStatus } from "../../hooks/secretary/dashboardHooks/useUpdateMyStatus";
import ToggleStatusButton from "../../components/shared/ToggleStatusButton";
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
import RecentAppointmentsCarousel from "@/components/secretary/Dashboard/RecentAppointmentsCarousel";
import StaffStatusOverview from "@/components/shared/StaffStatusOverview";

const SecretaryDashboard = () => {
  const { data, isLoading, error } = useUnreadMessages();
  const { mutate: markAsRead } = useMarkMessageAsRead();
  const { data: staff } = useStaffStatus();
  const { mutate: updateStatus } = useUpdateMyStatus();
  const { user } = useAuth();

  const isScrollable = useBreakpointValue({ base: false, sm: true });

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
      <Stack spacing={6} w="full" p={{ base: 2, md: 4 }}>
        <Heading textStyle="heading1" textAlign={{ base: "center" }}>
          Velkommen, {user?.name}
        </Heading>

        {/* Livefeed - seneste besøg */}
        <RecentAppointmentsCarousel />

        {/* Beskeder + Personale */}
        <Stack
          direction={{ base: "column", xl: "row" }}
          spacing={{ base: 12, sm: 14, xl: 6 }}
          align="start"
          wrap="wrap"
          w="full"
          pt={{ base: 10, sm: 8, xl: 4 }}
        >
          {/* Beskeder */}
          <Box
            flex={1}
            minW={0}
            maxW={{
              base: "100%",
              sm: "100%",
              md: "100%",
              lg: "100%",
              xl: "86%",
            }}
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
                    <Text mb={2}>"{msg.content}"</Text>
                    <Text fontSize="sm" color="gray.600">
                      {new Date(msg.createdAt).toLocaleString("da-DK")}
                    </Text>

                    <Flex
                      display="flex"
                      flexDirection={{ base: "row" }}
                      gap={{ base: 2 }}
                      mt={{ base: 4, lg: 6 }}
                    >
                      {!msg.read && (
                        <Button
                          mt={2}
                          size="sm"
                          onClick={() => markAsRead(msg._id)}
                          bgColor={"blue.100"}
                          p={{ base: 3 }}
                        >
                          Markér som læst
                        </Button>
                      )}

                      <Text
                        size="body"
                        mt={{ base: 3 }}
                        color={msg.read ? "green.600" : "red.600"}
                      >
                        {msg.read ? "🟢 Læst" : "🔴 Ulæst"}
                      </Text>
                    </Flex>
                  </Box>
                ))
              )}
            </VStack>
          </Box>

          {/* Personale */}
          <StaffStatusOverview
            showToggleForCurrentUser
            onToggleStatus={handleToggle}
          />
        </Stack>
      </Stack>
    </Layout>
  );
};

export default SecretaryDashboard;
