import {
  Badge,
  Box,
  Flex,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useStaffStatus } from "@/hooks/common/useStaffStatus";
import ToggleStatusButton from "@/components/shared/ToggleStatusButton";
import { useAuth } from "@/context/AuthContext";

interface Props {
  // styres og gives videre i parent -> vi vil gerne gøre denne komponent shared
  showToggleForCurrentUser?: boolean;
  // hvad sker der når bruger trykker? > callback til parent (kig secretarydashboard der videregiver prop)
  onToggleStatus?: (status: "ledig" | "optaget") => void;
}

const StaffStatusOverview = ({
  // komponent kan bruges med/uden toggle-funktionalitetet
  showToggleForCurrentUser = false,
  onToggleStatus,
}: Props) => {
  const { user } = useAuth();
  const { data: staff, isLoading, error } = useStaffStatus();

  if (isLoading) return <Spinner />;
  if (error) return <Text color="red.500">Kunne ikke hente personale</Text>;

  return (
    <Box
      w="100%"
      maxW={{
        base: "100%",
        sm: "100%",
        md: "100%",
        lg: "100%",
        xl: "65%",
      }}
      overflowX="hidden"
    >
      <Heading size={"heading2"} mb={{ base: "10px", sm: "12px", md: "14px" }}>
        Personale
      </Heading>

      <VStack align="start" spacing={3} w="full">
        {staff?.map((person) => {
          // tjek om viste person er den samme som aktuelle bruger
          const isSelf = user && person._id === user.id;
          // canToggle = true -> hvis showToggleforcurrent.. aktiveret
          // aktuelle bruger -> du må kun ændre egen status
          // brugerens status er ledig/opt
          const canToggle =
            showToggleForCurrentUser &&
            isSelf &&
            ["ledig", "optaget"].includes(person.status);

          return (
            <Box
              key={person._id}
              p={3}
              bg="gray.50"
              borderRadius="md"
              w="full"
              display="flex"
              justifyContent="space-between"
              alignItems={{ base: "flex-start", sm: "center" }}
              flexDirection={{ base: "column", sm: "row" }}
              gap={3}
              boxShadow="sm"
            >
              {/* Left: Navn + rolle */}
              <Box>
                <Text fontWeight="bold">{person.name}</Text>
                <Text fontSize="sm">{person.role}</Text>
              </Box>

              {/* Right: Status + knap */}
              <Flex
                direction={{ base: "column", sm: "row" }}
                align={{ base: "flex-start", md: "center" }}
                gap={2}
              >
                <Badge
                  colorScheme={
                    person.status === "ledig"
                      ? "green"
                      : person.status === "optaget"
                      ? "red"
                      : "yellow"
                  }
                  p={{ base: 2 }}
                  borderRadius={10}
                >
                  {person.status}
                </Badge>

                {/* SKIFT-STATUS BUTTON */}
                {/* vises kun hvis det er dig selv, showToggleForCurrentUser er aktiv (fra patrent) */}
                {canToggle && onToggleStatus && (
                  <ToggleStatusButton
                    // Komponenten modtager currentstatus
                    currentStatus={person.status as "ledig" | "optaget"}
                    // on-toggle callback, kaldes når trykkes
                    // type-cast -> kan også være "ferie"
                    onToggle={() =>
                      onToggleStatus(person.status as "ledig" | "optaget")
                    }
                  />
                )}
              </Flex>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

export default StaffStatusOverview;
