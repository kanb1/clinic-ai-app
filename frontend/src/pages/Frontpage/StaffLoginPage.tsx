import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useClinics } from "@/hooks/fundament/useClinics";
import { useLogin } from "@/hooks/fundament/useLogin";

const StaffLoginPage = () => {
  // data: clinics: gem resultatet af data i en variabel kaldet clinics (et array) -> tomt array som fallback hvis data endnu ik er hentet
  // isloading er true mens dataen bliver hentet og samme med error
  const { data: clinics = [], isLoading, error } = useClinics();
  const [clinicId, setClinicId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();

  // Vi omdøber mutate (funktionen) til login herinde
  // Her har vi så en funktion, login(), der udfører login svarende til mutate(), altså selve login-funktionen i vores useLogin-hook
  const {
    mutate: login,
    isPending,
    isError,
    // kalder useLogin() og giver en funktion emd role som argument (altså vores callback)
    // hvis du finder ud af at rollen er patient, så kald denne funktion jeg giver dig
    //(role) => {...} -> callback funktion, som bliver gemt inde i useLogin, og kun bliver kaldt hvis role er patient under login
  } = useLogin((role) => {
    if (role === "patient") {
      // Brugeren forsøger at logge ind som patient via staff-login → vis toast

      toast({
        title: "Forkert loginrolle",
        description: "Patienter skal logge ind via patient-siden.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
    }
  });

  // Når brugeren submitter login-formularen

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  // Vis loading/fallback hvis klinikdata ikke kan hentes

  if (isLoading) return <p>Indlæser klinikker...</p>;
  if (error) return <p>Kunne ikke hente klinikker</p>;

  return (
    <Box maxW="md" mx="auto" mt={10} p={6}>
      <Heading textStyle="heading1" textAlign="center">
        Log ind som personale
      </Heading>

      <Heading textStyle="body" fontWeight="thin" mt={0} textAlign="center">
        Indtast venligst dine login-oplysninger for at logge ind
      </Heading>

      <form onSubmit={handleSubmit}>
        <Stack spacing={6} py={6}>
          <FormControl isRequired>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel htmlFor="password">Adgangskode</FormLabel>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>

          {isPending && <Text>Logger ind...</Text>}
          {isError && (
            <Text color="red.500">Login mislykkedes. Prøv igen.</Text>
          )}

          <Box textAlign="center">
            <Button
              type="submit"
              variant="solidBlack"
              isLoading={isPending}
              loadingText="Logger ind..."
            >
              Log ind
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );
};

export default StaffLoginPage;
