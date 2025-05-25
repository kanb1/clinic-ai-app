import { useAuth } from "@/context/AuthContext";
import {
  Box,
  Flex,
  Image,
  Button,
  HStack,
  useDisclosure,
  useBreakpointValue,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useNavigate, Outlet } from "react-router-dom";
import { sidebarItems } from "../constants/sidebarItems";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isMobile = useBreakpointValue({ base: true, md: false });
  const paddingX = useBreakpointValue({ base: 4, md: 12 });
  const paddingY = useBreakpointValue({ base: 6, md: 10 });

  const sidebarLinks = user ? sidebarItems[user.role] : [];

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
          {/* Logo */}
          <Image
            src="/images/KlinikaLogo.png"
            alt="Klinika Logo"
            height="50px"
            cursor="pointer"
            onClick={() => navigate("/")}
          />

          {/* Desktop nav */}
          {!isMobile && (
            <HStack spacing={{ base: 4, md: 8 }}>
              <Button
                variant="ghost"
                fontWeight="normal"
                onClick={() => navigate("/about")}
              >
                Om os
              </Button>
              <Button
                variant="ghost"
                fontWeight="normal"
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
          )}

          {/* Mobile Hamburger */}
          {isMobile && (
            <>
              <IconButton
                icon={<HamburgerIcon />}
                aria-label="Åbn menu"
                variant="solid"
                size={"lg"}
                onClick={onOpen}
              />
              <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                  <DrawerCloseButton />
                  <DrawerBody mt={12}>
                    <VStack spacing={4} align="start">
                      {/* Sidebar links */}
                      {sidebarLinks.map((item) => (
                        <Button
                          key={item.path}
                          variant="ghost"
                          onClick={() => {
                            navigate(item.path);
                            onClose();
                          }}
                        >
                          {item.label}
                        </Button>
                      ))}

                      {/* Top nav */}
                      <Button
                        variant="ghost"
                        onClick={() => {
                          navigate("/about");
                          onClose();
                        }}
                      >
                        Om os
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          navigate("/help");
                          onClose();
                        }}
                      >
                        Hjælp
                      </Button>
                      {user && (
                        <Button
                          colorScheme="red"
                          variant="outline"
                          onClick={() => {
                            logout();
                            onClose();
                          }}
                        >
                          Log ud
                        </Button>
                      )}
                    </VStack>
                  </DrawerBody>
                </DrawerContent>
              </Drawer>
            </>
          )}
        </Flex>
      </Box>

      <Outlet />
    </>
  );
};

export default Navbar;
