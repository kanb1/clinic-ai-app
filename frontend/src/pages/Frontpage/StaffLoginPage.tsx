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
  const { data: clinics = [], isLoading, error } = useClinics();
  const [clinicId, setClinicId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
  const isValidPassword = (password: string) => password.length >= 6;

  const {
    mutate: login,
    isPending,
    isError,
  } = useLogin((role) => {
    if (role === "patient") {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email) || !isValidPassword(password)) {
      toast({
        title: "Ugyldige loginoplysninger",
        description: "Tjek email og adgangskode",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom-right",
      });
      return;
    }

    login({ email, password });
  };

  if (isLoading) return <p>Indlæser klinikker...</p>;
  if (error) return <p>Kunne ikke hente klinikker</p>;

  return (
    <Box maxW="md" mx="auto" mt={{ base: 5 }} p={{ base: 5 }}>
      <Heading size="heading1" mb={{ base: 1, sm: 1 }} mt={{ sm: 5 }}>
        {" "}
        Log ind som personale
      </Heading>
      <Text size="body" mb={{ base: 4, sm: 5, lg: 8 }}>
        Indtast venligst dine loginoplysninger.
      </Text>

      <form onSubmit={handleSubmit}>
        <Stack spacing={6}>
          <FormControl isRequired>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {!isValidEmail(email) && email.length > 0 && (
              <Text color="red.500" fontSize="sm">
                Ugyldig e-mailadresse
              </Text>
            )}
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

          <Button
            type="submit"
            bg="primary.red"
            color="white"
            isLoading={isPending}
            loadingText="Logger ind..."
          >
            Log ind
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default StaffLoginPage;
