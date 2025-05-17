import {
  Fieldset,
  Field,
  Input,
  NativeSelect,
  Button,
  Stack,
  Box,
  Heading,
} from "@chakra-ui/react";
import { useState } from "react";
import { useClinics } from "@/hooks/fundament/useClinics";
import { IClinic } from "@/types/clinic.types";
import { useLogin } from "@/hooks/fundament/useLogin";

const StaffLoginPage = () => {
  // data: clinics: gem resultatet af data i en variabel kaldet clinics (et array) -> tomt array som fallback hvis data endnu ik er hentet
  // isloading er true mens dataen bliver hentet og samme med error
  const { data: clinics = [], isLoading, error } = useClinics();

  const [clinicId, setClinicId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: login, isPending, isError } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //her kalder vi mutate, bare omdøbt til loginen
    //funktion vi kalder når vi vils ende data afsted. Den trigger mutationFn, altså login-Post-requesten
    login({ email, password });
  };

  if (isLoading) return <p>Indlæser klinikker...</p>;
  if (error) return <p>Kunne ikke hente klinikker</p>;

  return (
    <Box maxW="md" mx="auto" mt={10} p={6}>
      <Heading fontSize="2xl" fontWeight="extrabold" mb={6}>
        Log ind som personale
      </Heading>

      <form onSubmit={handleSubmit}>
        <Fieldset.Root gap={6}>
          <Stack gap={1}>
            <Fieldset.Legend>Log ind</Fieldset.Legend>
            <Fieldset.HelperText>
              Indtast dine oplysninger herunder
            </Fieldset.HelperText>
          </Stack>

          <Fieldset.Content>
            {/* Email */}
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

            {/* Password */}
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
          {isPending && <p>Logger ind...</p>}
          {isError && (
            <p style={{ color: "red" }}>Login mislykkedes. Prøv igen.</p>
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

export default StaffLoginPage;
