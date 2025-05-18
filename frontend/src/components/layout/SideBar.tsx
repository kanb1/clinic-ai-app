import { Box, VStack, Button, Text } from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
// henter objektet vi har før, hvor menupunkter bliver defineret pr rolle
import { sidebarItems } from "../constants/sidebarItems";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Hvis der ik er nogen bruger, så vis slet ik sidebaren
  if (!user) return null;

  // henter menupunkterne, for den userrole der er logget ind
  // de her punkter kommer fra sidebarItems som er et opslagsobjekt med forskellige lister for hver rolle
  const items = sidebarItems[user.role];

  return (
    <Box
      w="250px"
      bg="gray.100"
      minH="100vh"
      p={4}
      borderRight="1px solid lightgray"
    >
      <Text fontWeight="bold" fontSize="xl" mb={6}>
        Klinika
      </Text>
      <VStack align="start" gap={4}>
        {/* looper over hver punkt, som rollen har adgang til */}
        {/* for hver punkt i listen, lav en knap og når man klikker på den, naviger til den rigtige side */}
        {items.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            justifyContent="flex-start"
            w="100%"
            // hvis man klikker -> naviger
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </Button>
        ))}
        <Button
          mt={8}
          colorScheme="red"
          variant="outline"
          onClick={logout}
          w="100%"
        >
          Log ud
        </Button>
      </VStack>
    </Box>
  );
};

export default Sidebar;
