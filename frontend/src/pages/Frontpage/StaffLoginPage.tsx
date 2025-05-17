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

const StaffLoginPage = () => {
  // data: clinics: gem resultatet af data i en variabel kaldet clinics (et array) -> tomt array som fallback hvis data endnu ik er hentet
  // isloading er true mens dataen bliver hentet og samme med error
  const { data: clinics = [], isLoading, error } = useClinics();

  const [clinicId, setClinicId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ clinicId, email, password });
    // useLoginMutation() senere
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
            <Fieldset.Legend>Klinikoplysninger</Fieldset.Legend>
            <Fieldset.HelperText>
              Vælg din klinik og log ind med dine oplysninger
            </Fieldset.HelperText>
          </Stack>

          <Fieldset.Content>
            {/* Klinik dropdown */}
            <Field.Root>
              <Field.Label htmlFor="clinic">Klinik</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field name="clinic">
                  <option value="">Vælg klinik</option>
                  {/* Looper over alle klinikker og laver option for hver i dropdown */}
                  {/* key={clinic._id}, react kræver at alle elementer i en .map har unik nøgle */}
                  {/* value={clinic._id}, det ID som bliver sendt videre når brugeren vælger denne her klinik */}
                  {clinics.map((clinic: IClinic) => (
                    <option key={clinic._id} value={clinic._id}>
                      {clinic.name}
                    </option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Field.Root>

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

          <Button type="submit" alignSelf="flex-start" colorScheme="red">
            Log ind
          </Button>
        </Fieldset.Root>
      </form>
    </Box>
  );
};

export default StaffLoginPage;
