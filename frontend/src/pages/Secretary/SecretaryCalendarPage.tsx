import { useAppointments } from "@/hooks/secretary/calendarHooks/useAppointments";
import Layout from "@/components/layout/Layout";
import DesktopCalendar from "@/components/secretary/Calendar/DesktopCalendar";
import CompactCalendar from "@/components/secretary/Calendar/CompactCalendar";
import { useBreakpointValue } from "@chakra-ui/react";

const SecretaryCalendarPage = () => {
  const { data: appointments = [], isLoading, refetch } = useAppointments();

  const isDesktop = useBreakpointValue({ base: false, lg: true });

  return (
    <Layout>
      {isDesktop ? (
        <DesktopCalendar appointments={appointments} refetch={refetch} />
      ) : (
        <CompactCalendar appointments={appointments} />
      )}
    </Layout>
  );
};

export default SecretaryCalendarPage;
