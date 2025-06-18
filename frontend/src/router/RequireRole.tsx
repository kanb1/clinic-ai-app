import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

// kun brugere med bestemte roller -> får lov at se vores children

interface RequireRoleProps {
  // Det indhold der kun skal vises, hvis rollen passer
  // både navbar og outlet (children)
  children: ReactNode;
  allowedRoles: ("admin" | "doctor" | "secretary" | "patient")[];
}

const RequireRole = ({ children, allowedRoles }: RequireRoleProps) => {
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
