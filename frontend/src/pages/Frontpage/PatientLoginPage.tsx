import {
  Box,
  Button,
  Heading,
  Input,
  Stack,
  Text,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useLogin } from "@/hooks/fundament/useLogin";

const PatientLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginRoleError, setLoginRoleError] = useState("");
  const toast = useToast();
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
  const isValidPassword = (password: string) => password.length >= 6;

  const {
    mutate: login,
    isPending,
    isError,
  } = useLogin((role) => {
    if (role !== "patient") {
      setLoginRoleError("Kun patienter kan logge ind her.");
      toast({
        title: "Forkert rolle",
        description: "Kun patienter kan logge ind på denne side.",
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

  return (
    <Box maxW="md" mx="auto" mt={{ base: 5 }} p={{ base: 5 }}>
      <Heading size="heading1" mb={{ base: 1, sm: 1 }} mt={{ sm: 5 }}>
        {" "}
        Log ind som patient
      </Heading>
      <Text size="body" mb={{ base: 4, sm: 5, lg: 8 }}>
        Indtast venligst dine loginoplysninger.
      </Text>

      <form onSubmit={handleSubmit}>
        <Stack spacing={6}>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
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
            <FormLabel>Adgangskode</FormLabel>
            <Input
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
          {loginRoleError && (
            <Text color="red.500" mt={2}>
              {loginRoleError}
            </Text>
          )}

          <Button
            type="submit"
            bg="primary.red"
            color="white"
            isLoading={isPending}
          >
            Log ind
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default PatientLoginPage;
