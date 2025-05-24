import { useAppointments } from "@/hooks/secretary/calendarHooks/useAppointments";
import CustomCalendar from "../../components/secretary/Calendar/CustomCalendar";
import Layout from "@/components/layout/Layout";

const SecretaryCalendarPage = () => {
  const { data: appointments = [], isLoading, refetch } = useAppointments();

  return (
    <Layout>
      <CustomCalendar appointments={appointments} refetch={refetch} />;
    </Layout>
  );
};

export default SecretaryCalendarPage;
