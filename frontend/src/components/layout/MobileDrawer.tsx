// components/layout/MobileDrawer.tsx
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  IconButton,
  VStack,
  Button,
  useDisclosure,
  useBreakpointValue,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { sidebarItems } from "../constants/sidebarItems";

const MobileDrawer = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: true, lg: false });

  if (!user || !isMobile) return null;

  const items = sidebarItems[user.role];

  return (
    <>
      <IconButton
        icon={<HamburgerIcon />}
        aria-label="Åbn menu"
        onClick={onOpen}
        variant="ghost"
        position="absolute"
        top="1rem"
        left="1rem"
        zIndex={50}
      />
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody mt={12}>
            <VStack spacing={4} align="start">
              {/* Sidebar elementer */}
              {items.map((item) => (
                <Button
                  key={item.path}
                  variant="solid"
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                >
                  {item.label}
                </Button>
              ))}

              {/* Top-nav links */}
              <Button variant="ghost" onClick={() => navigate("/about")}>
                Om os
              </Button>
              <Button variant="ghost" onClick={() => navigate("/help")}>
                Hjælp
              </Button>

              {/* Logout */}
              <Button colorScheme="red" variant="outline" onClick={logout}>
                Log ud
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MobileDrawer;
