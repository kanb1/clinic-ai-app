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
import { useState, useEffect } from "react";
import { useLogin } from "@/hooks/fundament/useLogin";
import { useCreateClinic } from "@/hooks/fundament/useCreateClinic";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const CreateClinicPage = () => {
  // 🔐 Login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Clinic form states
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [clinicCreated, setClinicCreated] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  // Lyt til login-status via auth context der sætter global user
  useEffect(() => {
    if (user?.role === "admin") {
      setIsAdminLoggedIn(true);
    }
  }, [user]);

  // Login mutation
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
    { disableRedirect: true } //den skal ik redirecte som den ellers automatisk gør i useLogin hooket
  );

  // Clinic mutation
  const {
    mutate: createClinic,
    isPending: clinicPending,
    isError: clinicError,
  } = useCreateClinic();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    login({ email, password });
  };

  const handleCreateClinic = (e: React.FormEvent) => {
    e.preventDefault();
    createClinic(
      { name, address },
      {
        onSuccess: () => {
          setClinicCreated(true); // vis successbesked
        },
      }
    );
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={6}>
      {/* når admin ik er logget ind vises først login-form */}
      {!isAdminLoggedIn ? (
        <>
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
      ) : clinicCreated ? (
        // succes besked
        <Box textAlign="center" mt={10}>
          <Heading fontSize="2xl" fontWeight="extrabold" mb={4}>
            Klinik oprettet!
          </Heading>
          <Text fontSize="md">
            Din klinik er nu oprettet i systemet. Du kan nu administrere
            personale og patienter i dashboardet.
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
        //  Opret klinik-formular
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
