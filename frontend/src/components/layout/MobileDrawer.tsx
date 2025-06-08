// import {
//   Drawer,
//   DrawerBody,
//   DrawerCloseButton,
//   DrawerContent,
//   DrawerOverlay,
//   IconButton,
//   VStack,
//   Button,
//   useDisclosure,
//   useBreakpointValue,
//   Text,
// } from "@chakra-ui/react";
// import { HamburgerIcon } from "@chakra-ui/icons";
// import { useAuth } from "@/context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import { sidebarItems } from "../constants/sidebarItems";

// const MobileDrawer = () => {
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const isMobile = useBreakpointValue({ base: true, md: true, lg: false });

//   // Vis ikke drawer-ikonet på større skærme
//   if (!isMobile) return null;

//   // Hvis bruger er logget ind, hent deres menupunkter
//   const items = user ? sidebarItems[user.role] : [];

//   return (
//     <>
//       <IconButton
//         icon={<HamburgerIcon />}
//         aria-label="Åbn menu"
//         onClick={onOpen}
//         variant="ghost"
//         position="absolute"
//         top="1rem"
//         left="1rem"
//         zIndex={50}
//       />
//       <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
//         <DrawerOverlay />
//         <DrawerContent>
//           <DrawerCloseButton />
//           <DrawerBody mt={12}>
//             <VStack spacing={4} align="start">
//               {user ? (
//                 <>
//                   {/* Brugernavn og rolle */}
//                   <Text fontWeight="bold">
//                     {user.name} ({user.role})
//                   </Text>

//                   {items.map((item) => (
//                     <Button
//                       key={item.path}
//                       variant="solid"
//                       onClick={() => {
//                         navigate(item.path);
//                         onClose();
//                       }}
//                     >
//                       {item.label}
//                     </Button>
//                   ))}

//                   <Button variant="ghost" onClick={() => navigate("/help")}>
//                     Hjælp
//                   </Button>

//                   <Button
//                     colorScheme="red"
//                     variant="outline"
//                     onClick={() => {
//                       logout();
//                       onClose();
//                     }}
//                   >
//                     Log ud
//                   </Button>
//                 </>
//               ) : (
//                 <>
//                   <Button variant="ghost" onClick={() => navigate("/help")}>
//                     Hjælp
//                   </Button>
//                   <Button
//                     variant="outline"
//                     onClick={() => {
//                       navigate("/choose-role");
//                       onClose();
//                     }}
//                   >
//                     Log ind
//                   </Button>
//                 </>
//               )}
//             </VStack>
//           </DrawerBody>
//         </DrawerContent>
//       </Drawer>
//     </>
//   );
// };

// export default MobileDrawer;
