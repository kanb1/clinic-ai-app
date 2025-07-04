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
  Text,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Outlet } from "react-router-dom";
import { sidebarItems } from "../constants/sidebarItems";
import { useLogout } from "@/hooks//fundament/useLogout";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const logout = useLogout();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isMobile = useBreakpointValue({ base: true, lg: false });
  const paddingX = useBreakpointValue({ base: 4, md: 12 });
  const paddingY = useBreakpointValue({ base: 4, md: 6 });

  // sidebarlinks > afhænger af brugerens rolle
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
        w="full"
      >
        <Flex
          align="center"
          justify="space-between"
          w="full"
          maxW="container.xl"
          mx="auto"
        >
          <Box flexShrink={0} w={{ base: "130px", md: "150px" }}>
            <Image
              src="/images/KlinikaLogo.png"
              alt="Klinika Logo"
              w="full"
              cursor="pointer"
              onClick={() => navigate("/")}
            />
          </Box>

          {/* Desktop nav */}
          {!isMobile && (
            <HStack spacing={{ base: 4, md: 8 }}>
              <Button
                variant="ghost"
                fontWeight="normal"
                onClick={() => navigate("/help")}
              >
                Hjælp?
              </Button>

              {!user && (
                <Button
                  color="white"
                  bg="primary.black"
                  _hover={{ bg: "gray" }}
                  onClick={() => navigate("/")}
                >
                  Log ind
                </Button>
              )}

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
                variant="ghost"
                size="lg"
                onClick={onOpen}
              />
              <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                  <DrawerCloseButton />
                  <DrawerBody mt={12}>
                    <VStack spacing={4} align="start">
                      {user ? (
                        <>
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
                          <Button
                            variant="ghost"
                            onClick={() => {
                              navigate("/help");
                              onClose();
                            }}
                          >
                            Hjælp?
                          </Button>
                          <Button
                            color="white"
                            bg="primary.black"
                            _hover={{ bg: "gray" }}
                            onClick={() => {
                              logout();
                              onClose();
                            }}
                          >
                            Log ud
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              navigate("/help");
                              onClose();
                            }}
                          >
                            Hjælp?
                          </Button>
                          <Button
                            color="white"
                            bg="primary.black"
                            _hover={{ bg: "gray" }}
                            onClick={() => {
                              navigate("/");
                              onClose();
                            }}
                          >
                            Log ind
                          </Button>
                        </>
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
