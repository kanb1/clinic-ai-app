import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import Layout from "@/components/layout/Layout";
import StaffStatusOverview from "@/components/shared/StaffStatusOverview";
import TodaysAppointmentStats from "@/components/doctor/Dashboard/TodaysAppointmentStats";
import { useUpdateMyStatus } from "@/hooks/common/useUpdateMyStatus";
import { useAuth } from "@/context/AuthContext";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { mutate: updateStatus } = useUpdateMyStatus();

  const handleToggle = (currentStatus: "ledig" | "optaget") => {
    // hvis currentstatus = ledig -> sæt optaget -> ellers sæt til ledig
    const newStatus = currentStatus === "ledig" ? "optaget" : "ledig";
    updateStatus({ status: newStatus });
  };

  return (
    <Layout>
      <Flex justify="center" w="full">
        <Box
          mt={{ base: 6, md: 10 }}
          px={{ base: 4, md: 6 }}
          py={{ base: 6, md: 8 }}
          maxW="4xl"
          w="full"
        >
          <Heading size="heading1" mb={4} textAlign="center">
            Velkommen, {user?.name}
          </Heading>
          <Heading mb={{ base: 10, md: 12 }} size="heading2" textAlign="center">
            {new Date().toLocaleDateString("da-DK", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Heading>

          <TodaysAppointmentStats />

          <Box mt={10}>
            <Flex justify="center" w="full">
              <StaffStatusOverview
                showToggleForCurrentUser
                onToggleStatus={handleToggle}
              />
            </Flex>
          </Box>
        </Box>
      </Flex>
    </Layout>
  );
};

export default DoctorDashboard;
