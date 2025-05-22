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

  // Kald useLogin med denne callback funktion hvis brugeren ikke er patient

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
    login({ email, password }); // sender login-data
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={6}>
      <Heading fontSize="2xl" fontWeight="extrabold" mb={6}>
        Log ind som patient
      </Heading>

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

          <Button type="submit" colorScheme="red" isLoading={isPending}>
            Log ind
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default PatientLoginPage;
