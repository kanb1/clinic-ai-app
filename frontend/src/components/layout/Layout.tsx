// wrapper til dashboard viewet
import { Flex } from "@chakra-ui/react";
import Sidebar from "../layout/SideBar";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Flex>
      <Sidebar />
      <Flex flex="1" p={6}>
        {children}
      </Flex>
    </Flex>
  );
};

export default Layout;
