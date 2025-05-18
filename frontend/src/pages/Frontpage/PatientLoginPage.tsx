import {
  Box,
  Button,
  Heading,
  Input,
  Stack,
  Text,
  Fieldset,
  Field,
} from "@chakra-ui/react";
import { useState } from "react";
import { useLogin } from "@/hooks/fundament/useLogin";

const PatientLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginRoleError, setLoginRoleError] = useState("");

  // Kald useLogin med denne callback funktion hvis brugeren ikke er patient
  const {
    mutate: login,
    isPending,
    isError,
  } = useLogin((role) => {
    if (role !== "patient") {
      setLoginRoleError("Kun patienter kan logge ind her.");
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
        <Fieldset.Root gap={6}>
          <Stack gap={1}>
            <Fieldset.Legend>Login</Fieldset.Legend>
            <Fieldset.HelperText>
              Indtast dine oplysninger herunder
            </Fieldset.HelperText>
          </Stack>

          <Fieldset.Content>
            <Field.Root>
              <Field.Label htmlFor="email">Email</Field.Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field.Root>

            <Field.Root>
              <Field.Label htmlFor="password">Adgangskode</Field.Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field.Root>
          </Fieldset.Content>

          {/* Feedback */}
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
            alignSelf="flex-start"
            colorScheme="red"
            loading={isPending}
          >
            Log ind
          </Button>
        </Fieldset.Root>
      </form>
    </Box>
  );
};

export default PatientLoginPage;
