import {
  Box,
  Button,
  Grid,
  Spinner,
  Text,
  Input,
  useBreakpointValue,
  ResponsiveValue,
  VStack,
  Flex,
} from "@chakra-ui/react";
import { useState } from "react";
import { IUser } from "@/types/user.types";

interface Props {
  patients: IUser[];
  isLoading: boolean;
  searchPlaceholder?: string;
  primaryLabel: string;
  onPrimaryAction: (patientId: string) => void;
  maxHeight?: string | ResponsiveValue<string>;
  onSecondaryAction?: (id: string) => void;
  secondaryLabel?: string;
}

const PatientGrid = ({
  patients,
  isLoading,
  searchPlaceholder = "Søg efter patient",
  onPrimaryAction,
  primaryLabel,
  onSecondaryAction,
  secondaryLabel,
}: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const gridColumns = useBreakpointValue({ base: 1, sm: 2, md: 3, xl: 5 });

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Input
        placeholder={searchPlaceholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        mb={6}
      />

      {isLoading ? (
        <Spinner />
      ) : (
        <Box
          maxH={{ base: "70vh", sm: "50vh", md: "80%", lg: "100%" }}
          overflowY="auto"
          pr={2}
          sx={{
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "gray.100",
              borderRadius: "full",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "gray.400",
              borderRadius: "full",
            },
          }}
        >
          <Grid templateColumns={`repeat(${gridColumns}, 1fr)`} gap={4}>
            {filtered.map((p) => (
              <Box
                key={p._id}
                p={4}
                bg="gray.100"
                borderRadius="md"
                boxShadow="sm"
              >
                <Text fontWeight="bold">{p.name}</Text>
                <Text>
                  Fødselsdato:{" "}
                  {p.birth_date
                    ? new Date(p.birth_date).toLocaleDateString("da-DK")
                    : "Ukendt"}
                </Text>
                <Flex
                  alignItems={"center"}
                  flexDirection={"column"}
                  gap={2}
                  mt={3}
                >
                  <Button
                    backgroundColor="primary.red"
                    color="white"
                    _hover={{ bg: "red.600" }}
                    fontSize="sm"
                    fontWeight="medium"
                    rounded="2xl"
                    px={4}
                    py={2}
                    w="full"
                    maxW="16rem"
                    onClick={() => onPrimaryAction(p._id)}
                  >
                    {primaryLabel}
                  </Button>

                  {onSecondaryAction && (
                    <Button
                      backgroundColor="primary.red"
                      color="white"
                      _hover={{ bg: "red.600" }}
                      fontSize="sm"
                      fontWeight="medium"
                      rounded="2xl"
                      px={4}
                      py={2}
                      w="full"
                      maxW="16rem"
                      onClick={() => onSecondaryAction(p._id)}
                    >
                      {secondaryLabel || "Vis detaljer"}
                    </Button>
                  )}
                </Flex>
              </Box>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default PatientGrid;
