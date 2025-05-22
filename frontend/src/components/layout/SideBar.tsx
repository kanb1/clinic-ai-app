import { Box, VStack, Button, Text } from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { sidebarItems } from "../constants/sidebarItems";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const items = sidebarItems[user.role];

  return (
    <Box
      w="250px"
      minH="100vh"
      p={6}
      bg="gray.50"
      borderRight="1px solid"
      borderColor="gray.200"
    >
      <VStack align="stretch" spacing={3}>
        {items.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            justifyContent="flex-start"
            fontWeight="medium"
            fontSize="md"
            colorScheme="gray"
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </Button>
        ))}

        <Button mt={10} variant="outline" colorScheme="red" onClick={logout}>
          Log ud
        </Button>
      </VStack>
    </Box>
  );
};

export default Sidebar;
