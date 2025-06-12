import { Box } from "@chakra-ui/react";
import Sidebar from "./SideBar";

const ResponsiveSidebar = () => {
  return (
    <Box
      w="250px"
      minH="100vh"
      borderRight="1px solid"
      borderColor="gray.200"
      display={{ base: "none", lg: "block" }}
    >
      <Sidebar />
    </Box>
  );
};

export default ResponsiveSidebar;
