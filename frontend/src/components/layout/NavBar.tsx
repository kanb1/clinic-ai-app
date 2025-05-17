import { useAuth } from "@/context/AuthContext";
import { Box, Flex, Image, Spacer, Button, HStack } from "@chakra-ui/react";
import { useNavigate, Outlet } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  return (
    <>
      <Box
        bg="#f4f4f5"
        px={{ base: 4, md: 12 }}
        py={10}
        boxShadow="sm"
        borderBottom="2px solid rgba(0, 0, 0, 0.1)"
        position="relative"
      >
        {" "}
        <Flex align="center">
          <Image
            src="/images/KlinikaLogo.png"
            alt="Klinika Logo"
            height="50px"
          />

          <Spacer />

          {/* Navigation links */}
          <HStack gap={4}>
            <Button
              fontSize="body"
              fontWeight="normal"
              fontFamily="body"
              onClick={() => navigate("/about")}
              border="none"
              backgroundColor="transparent"
              padding={10}
            >
              Om os
            </Button>
            <Button
              fontSize="body"
              fontWeight="normal"
              fontFamily="body"
              onClick={() => navigate("/help")}
              border="none"
              backgroundColor="transparent"
              padding={20}
            >
              Hjælp
            </Button>
            {/* Kun vis log ud hvis bruger er logget ind */}
            {user && (
              <Button
                fontSize="body"
                fontWeight="normal"
                fontFamily="body"
                onClick={logout}
                colorScheme="red"
                variant="solid"
              >
                Log ud
              </Button>
            )}
          </HStack>
        </Flex>
      </Box>

      {/* Her vises children-routes */}
      {/* Outlet bruges til at vise child routes. Uden den så ved React Router ikke hvor fx <ChooseRolePage /> skal rendres i frontpageroutes */}
      <Outlet />
    </>
  );
};

export default Navbar;
