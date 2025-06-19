// wrapper til dashboard viewet
import { Flex } from "@chakra-ui/react";
import Sidebar from "../layout/SideBar";
import { ReactNode } from "react";
import ResponsiveSidebar from "./ResponsiveSideBar";

// modtager children som props (idnhodlet inde i layout-wrapper)
const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Flex>
      {/* Sidebar i venstreside */}
      <ResponsiveSidebar />
      {/* indre flex fylder resten af pladsen */}
      <Flex flex="1" p={6}>
        {children}
      </Flex>
    </Flex>
  );
};

export default Layout;
