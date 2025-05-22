import { useAuth } from "@/context/AuthContext";
import {
  Box,
  Flex,
  Image,
  Button,
  HStack,
  Spacer,
  useBreakpointValue,
  color,
} from "@chakra-ui/react";
import { useNavigate, Outlet } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Brug mindre padding på mobil
  const paddingX = useBreakpointValue({ base: 4, md: 12 });
  const paddingY = useBreakpointValue({ base: 6, md: 10 });

  return (
    <>
      <Box
        bg="gray.50"
        px={paddingX}
        py={paddingY}
        boxShadow="sm"
        borderBottom="1px solid"
        borderColor="gray.200"
        position="relative"
        zIndex={10}
      >
        <Flex align="center" justify="space-between">
          <Image
            src="/images/KlinikaLogo.png"
            alt="Klinika Logo"
            height="50px"
            cursor="pointer"
            onClick={() => navigate("/")}
          />

          <HStack spacing={{ base: 4, md: 8 }}>
            <Button
              variant="ghost"
              fontWeight="normal"
              fontSize="md"
              onClick={() => navigate("/about")}
            >
              Om os
            </Button>
            <Button
              variant="ghost"
              fontWeight="normal"
              fontSize="md"
              onClick={() => navigate("/help")}
            >
              Hjælp
            </Button>

            {user && (
              <Button
                color="white"
                bg="primary.black"
                _hover={{ bg: "gray" }}
                onClick={logout}
              >
                Log ud
              </Button>
            )}
          </HStack>
        </Flex>
      </Box>

      <Outlet />
    </>
  );
};

export default Navbar;
