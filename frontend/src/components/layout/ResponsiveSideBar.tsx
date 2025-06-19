import { Box } from "@chakra-ui/react";
import Sidebar from "./SideBar";

// Render kun sidebaren når vi i de større skærme
const ResponsiveSidebar = () => {
  return (
    <Box
      w="250px"
      minH="100vh"
      borderRight="1px solid"
      borderColor="gray.200"
      display={{ base: "none", lg: "block" }} //fra lg: vis sidebar
    >
      <Sidebar />
    </Box>
  );
};

export default ResponsiveSidebar;
