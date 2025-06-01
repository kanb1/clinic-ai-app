import { Box, Heading, Text } from "@chakra-ui/react";
import Layout from "@/components/layout/Layout";
import StaffStatusOverview from "@/components/shared/StaffStatusOverview";
import TodaysAppointmentStats from "@/components/doctor/Dashboard/TodaysAppointmentStats";
import { useUpdateMyStatus } from "@/hooks/common/useUpdateMyStatus";

const DoctorDashboard = () => {
  const { mutate: updateStatus } = useUpdateMyStatus();

  const handleToggle = (currentStatus: "ledig" | "optaget") => {
    const newStatus = currentStatus === "ledig" ? "optaget" : "ledig";
    updateStatus({ status: newStatus });
  };

  return (
    <Layout>
      <Box p={10}>
        <Heading size="lg" mb={4}>
          Dashboard
        </Heading>
        <Text mb={6}>
          {new Date().toLocaleDateString("da-DK", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>

        <TodaysAppointmentStats />

        <Box mt={10}>
          <StaffStatusOverview
            showToggleForCurrentUser
            onToggleStatus={handleToggle}
          />
        </Box>
      </Box>
    </Layout>
  );
};

export default DoctorDashboard;
