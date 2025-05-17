import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

interface RequireRoleProps {
  // Det indhold der kun skal vises, hvis rollen passer.
  children: ReactNode;
  //   Liste af roller der må få adgang
  allowedRoles: ("admin" | "doctor" | "secretary" | "patient")[];
}

const RequireRole = ({ children, allowedRoles }: RequireRoleProps) => {
  // hent brugeren fra authcontext som blev sat under login
  const { user } = useAuth();

  // Hvis vi ikke har en bruger, send dem tilbage til forsiden/hfvis ingen er logget ind
  if (!user) {
    return (
      <Box p={10} textAlign="center">
        <Heading size="lg" mb={4}>
          Adgang nægtet
        </Heading>
        <Text>Du har ikke rettigheder til at se denne side.</Text>
      </Box>
    );
  }

  // hvis en bruger er logget ind, tjekker vi om deres rolle matcher en af de allowedRoles

  if (!allowedRoles.includes(user.role)) {
    return (
      <Box p={10} textAlign="center">
        <Heading size="lg" mb={4}>
          Adgang nægtet
        </Heading>
        <Text>Du har ikke rettigheder til at se denne side.</Text>
      </Box>
    );
  }

  // backend: bruger der prøver at kalde API uden adgang
  // frotnend: bruger der prøver at tilgå en route direkt ei URL'en

  // Ellers, giv adgang
  return <>{children}</>;
};

export default RequireRole;
