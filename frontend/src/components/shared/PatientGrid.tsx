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
  // tekst til første knap
  primaryLabel: string;
  // første knap
  onPrimaryAction: (patientId: string) => void;
  //denne prop kan have responsivt values: fx {base: "100px", md:..}
  maxHeight?: string | ResponsiveValue<string>;
  // anden knap
  onSecondaryAction?: (id: string) => void;
  // tekst til anden knap
  secondaryLabel?: string;
}
// destruct direkte props i parameterlisten
// vi forventer props af typen Propsx
const PatientGrid = ({
  patients,
  isLoading,
  searchPlaceholder = "Søg efter patient",
  onPrimaryAction,
  primaryLabel,
  onSecondaryAction,
  secondaryLabel,
}: Props) => {
  // søgeteksten
  const [searchTerm, setSearchTerm] = useState("");
  // responsive grid-kolonner
  const gridColumns = useBreakpointValue({ base: 1, sm: 2, md: 3, xl: 5 });

  // selvom der ingne kald til backend ville det være vigtigt at have det her i fremtiden
  //fjerner < > fra input
  const sanitize = (input: string) => input.replace(/[<>]/g, "");

  // filtrering ud fra søgning
  // case-insensitive
  // vis kun patienter hvis searchterm matcher
  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //bruger skriver > trigger onChange event fra et inputeleemnt
  //får adgang til e.target.value via react.changeEvent..
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // e.target.value -> brugerens input
    // trimstart fjern whtiespace i starten ved inputfeltet
    // sanitize > fjern <> fra brugerinput
    const cleanValue = sanitize(e.target.value.trimStart());
    // skær input til 100 -> fallback hvis maxLength ikke virker
    setSearchTerm(cleanValue.slice(0, 100));
  };

  return (
    <Box>
      <Input
        maxLength={100}
        placeholder={searchPlaceholder}
        value={searchTerm}
        onChange={handleInput}
        mb={6}
      />

      {/* Vis spinner ved loading / vis patientlisten */}
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
                    // sender patientens id til funktionen
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
