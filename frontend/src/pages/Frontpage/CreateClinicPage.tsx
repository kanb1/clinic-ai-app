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
import { useEffect, useState } from "react";
import { useLogin } from "@/hooks/fundament/useLogin";
import { useCreateClinic } from "@/hooks/fundament/useCreateClinic";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useMyClinic } from "@/hooks/fundament/useMyClinic";

const CreateClinicPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // opret klinik states
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [clinicCreated, setClinicCreated] = useState(false);

  // hent klinik for logget-in admin
  // (useMyClinic();) hook der henter klinikken som den loggede in admin har oprettet
  const {
    data: myClinic,
    isLoading: isClinicLoading,
    // bruges til at odpatere data efter oprettelse
    refetch: refetchMyClinic,
  } = useMyClinic();

  // opdater lokal state hvis user bliver sat
  // bruges længere nede til at vise form frem/eller besked omkring klinik oprettet af brugeren
  useEffect(() => {
    if (user?.role === "admin") {
      setIsAdminLoggedIn(true);
    }
  }, [user]);

  // callback funktion som tjekker rollen
  const {
    mutate: login,
    isPending: loginPending,
    isError: loginFailed,
  } = useLogin(
    (role) => {
      if (role !== "admin") {
        setLoginError("Kun admins må oprette klinikker.");
      }
    },
    { disableRedirect: true } //forhindrer auto redirect efter login, da vi selv vil styre flowet her (redirect sker auto i useLogin hook)
  );

  //simpelt kalder useCreateClinic() og kalder funktinonen createClinic.
  const {
    mutate: createClinic,
    isPending: clinicPending,
    isError: clinicError,
  } = useCreateClinic();

  // når admin prøver at logge ind
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    login({ email, password });
  };

  // når admin opretter klinikken, så opdaterer UI og refetcher klinikdata
  // funktionen modtager et event-objekt e med typen React.FormEvent, som kommer fra en form
  const handleCreateClinic = (e: React.FormEvent) => {
    // stopper browser standard opførsel som reload
    e.preventDefault();
    // første argument af vores hook er request data
    // await api.post("/clinics", data);
    createClinic(
      { name, address },
      // andet argumnet: Options-objekt til useMutation, hva der skal ske når lykkes/fejler
      {
        onSuccess: () => {
          setClinicCreated(true);
          // opdater clinic-data efter oprettelse
          refetchMyClinic();
        },
      }
    );
  };

  // mens vi loader clinic
  if (isAdminLoggedIn && isClinicLoading) {
    return <Text>Indlæser klinikinformation...</Text>;
  }

  return (
    <Box maxW="md" mx="auto" mt={10} p={6}>
      {!isAdminLoggedIn ? (
        <>
          {/* vis loginform */}
          <Heading fontSize="2xl" fontWeight="extrabold" mb={6}>
            Admin login
          </Heading>
          <form onSubmit={handleLogin}>
            <Fieldset.Root gap={6}>
              <Stack gap={1}>
                <Fieldset.Legend>Log ind for at oprette klinik</Fieldset.Legend>
                <Fieldset.HelperText>
                  Indtast dine admin-login oplysninger
                </Fieldset.HelperText>
              </Stack>

              <Fieldset.Content>
                <Field.Root>
                  <Field.Label htmlFor="email">Email</Field.Label>
                  <Input
                    id="email"
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
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Field.Root>
              </Fieldset.Content>

              {loginPending && <Text>Logger ind...</Text>}
              {(loginFailed || loginError) && (
                <Text color="red.500">
                  {loginError || "Login mislykkedes. Prøv igen."}
                </Text>
              )}

              <Button type="submit" colorScheme="red" loading={loginPending}>
                Log ind
              </Button>
            </Fieldset.Root>
          </form>
        </>
      ) : myClinic ? (
        // Hvis admin allerede har en klinik - vis besked og knao
        <Box textAlign="center" mt={10}>
          <Heading fontSize="2xl" fontWeight="extrabold" mb={4}>
            Du har allerede oprettet en klinik
          </Heading>
          <Text fontSize="md" mb={2}>
            <strong>{myClinic.name}</strong>
          </Text>
          <Text fontSize="sm" color="gray.600">
            {myClinic.address}
          </Text>
          <Button
            mt={6}
            colorScheme="red"
            onClick={() => navigate("/admin/dashboard")}
          >
            Gå til dashboard
          </Button>
        </Box>
      ) : clinicCreated ? (
        // klinik blev lige oprettet → vis success UI

        <Box textAlign="center" mt={10}>
          <Heading fontSize="2xl" fontWeight="extrabold" mb={4}>
            Klinik oprettet!
          </Heading>
          <Text fontSize="md">
            Din klinik er nu oprettet i systemet. Du kan nu tilføje personale og
            patienter.
          </Text>
          <Button
            mt={6}
            colorScheme="red"
            onClick={() => navigate("/admin/dashboard")}
          >
            Gå til dashboard
          </Button>
        </Box>
      ) : (
        // vis formular til oprettelse af klinik
        <>
          <Heading fontSize="2xl" fontWeight="extrabold" mb={6}>
            Opret ny klinik
          </Heading>
          <form onSubmit={handleCreateClinic}>
            <Fieldset.Root gap={6}>
              <Stack gap={1}>
                <Fieldset.Legend>Klinikinformation</Fieldset.Legend>
                <Fieldset.HelperText>
                  Udfyld oplysninger om klinikken
                </Fieldset.HelperText>
              </Stack>

              <Fieldset.Content>
                <Field.Root>
                  <Field.Label htmlFor="name">Kliniknavn</Field.Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label htmlFor="address">Adresse</Field.Label>
                  <Input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </Field.Root>
              </Fieldset.Content>

              {clinicError && (
                <Text color="red.500">Kunne ikke oprette klinikken.</Text>
              )}

              <Button type="submit" colorScheme="red" loading={clinicPending}>
                Opret klinik
              </Button>
            </Fieldset.Root>
          </form>
        </>
      )}
    </Box>
  );
};

export default CreateClinicPage;
