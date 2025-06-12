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
  Icon,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useLogin } from "@/hooks/fundament/useLogin";
import { useCreateClinic } from "@/hooks/fundament/useCreateClinic";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useMyClinic } from "@/hooks/fundament/useMyClinic";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { CloseIcon } from "@chakra-ui/icons";

const CreateClinicPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
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

  // Validation states:
  const [nameError, setNameError] = useState("");
  const [addressError, setAddressError] = useState("");

  const {
    data: myClinic,
    isLoading: isClinicLoading,
    refetch: refetchMyClinic,
  } = useMyClinic();

  useEffect(() => {
    if (user?.role === "admin") {
      setIsAdminLoggedIn(true);
    }
  }, [user]);

  const {
    mutate: login,
    isPending: loginPending,
    isError: loginFailed,
  } = useLogin(
    (role) => {
      if (role !== "admin") {
        setLoginError("Kun admins må oprette klinikker.");
        toast({
          title: "Adgang nægtet",
          description: "Kun admins må oprette klinikker.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    },
    { disableRedirect: true } //forhindrer auto redirect efter login, da vi selv vil styre flowet her (redirect sker auto i useLogin hook)
  );

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

    // reset fejl
    setNameError("");
    setAddressError("");
    let hasError = false;

    if (name.trim().length < 2) {
      setNameError("Navnet skal være mindst 2 tegn.");
      hasError = true;
    }

    if (address.trim().length < 5) {
      setAddressError("Adressen skal være mindst 5 tegn.");
      hasError = true;
    }

    if (hasError) return;

    createClinic(
      { name, address },
      {
        onSuccess: () => {
          setClinicCreated(true);
          refetchMyClinic();
        },
      }
    );

    createClinic(
      { name, address },

      {
        onSuccess: () => {
          setClinicCreated(true);

          refetchMyClinic();
        },
      }
    );
  };

  if (isAdminLoggedIn && isClinicLoading) {
    return <Text>Indlæser klinikinformation...</Text>;
  }

  return (
    <Box maxW="md" mx="auto" mt={10} px={{ base: 8, lg: 0 }}>
      {!isAdminLoggedIn ? (
        <>
          {/* vis loginform */}

          <Heading size="heading1">Admin login</Heading>
          <Text
            size="body"
            mb={{ base: 3, sm: 4, md: 5, lg: 6 }}
            mt={{ base: 1, md: 1 }}
          >
            Du skal være logget ind som en admin for at udføre denne handling.
          </Text>
          <form onSubmit={handleLogin}>
            <Stack spacing={6} mt={{ base: 4 }}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Adgangskode</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>

              {loginPending && <Text>Logger ind...</Text>}
              {(loginFailed || loginError) && (
                <Text color="red.500">
                  {loginError || "Login mislykkedes. Prøv igen."}
                </Text>
              )}

              <Button
                type="submit"
                bg="primary.red"
                color="white"
                isLoading={loginPending}
              >
                Log ind
              </Button>
            </Stack>
          </form>
        </>
      ) : // klinik blev lige oprettet → vis success UI

      clinicCreated ? (
        <Box textAlign="center" mt={10}>
          <Box textAlign="center" mt={10}>
            <CheckCircleIcon boxSize="80px" color="green.400" />
          </Box>

          <Heading size="heading2" mt={{ base: 5, sm: 5 }}>
            Success!
          </Heading>
          <Text size="body" mb={{ base: 5, sm: 6 }}>
            Din klinik er nu oprettet i systemet. Du kan nu administrere din
            klinik på din profil.{" "}
          </Text>
          <Button
            variant="solidBlack"
            onClick={() => navigate("/admin/frontpage")}
          >
            Gå til dashboard
          </Button>
        </Box>
      ) : // Hvis admin allerede har en klinik - vis besked og knao

      myClinic ? (
        <Box textAlign="center" mt={10}>
          <Box
            w="100px"
            h="100px"
            borderRadius="full"
            bg="red.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="md"
            mx="auto"
          >
            <Icon as={CloseIcon} boxSize="40px" color="white" />
          </Box>
          <Heading size="heading2" mt={{ base: 5, sm: 5 }}>
            Fejl!
          </Heading>
          <Text size="body" mb={{ base: 5, sm: 8 }}>
            Du har allerede en klinik
          </Text>
          <Box
            border="1px solid"
            borderColor="gray.200"
            borderRadius="xl"
            p={6}
            bg="white"
            boxShadow="md"
          >
            <Text size="body" mb={1}>
              {myClinic.name}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {myClinic.address}
            </Text>
          </Box>
          <Button
            variant="solidBlack"
            minW="200px"
            mt={{ base: 5, sm: 7 }}
            onClick={() => navigate("/admin/frontpage")}
          >
            Gå til din startside
          </Button>
        </Box>
      ) : (
        // vis formular til oprettelse af klinik

        <>
          <Heading size="heading1" mb={6}>
            Opret ny klinik
          </Heading>
          <form onSubmit={handleCreateClinic}>
            <Stack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Kliniknavn</FormLabel>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError(""); // fjern fejl når man skriver igen
                  }}
                />
                {nameError && (
                  <Text color="red.500" fontSize="sm">
                    {nameError}
                  </Text>
                )}
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Adresse</FormLabel>
                <Input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setAddressError("");
                  }}
                />
                {addressError && (
                  <Text color="red.500" fontSize="sm">
                    {addressError}
                  </Text>
                )}
              </FormControl>

              {clinicError && (
                <Text color="red.500">Kunne ikke oprette klinikken.</Text>
              )}

              <Button
                type="submit"
                bg="primary.red"
                color="white"
                isLoading={clinicPending}
              >
                Opret klinik
              </Button>
            </Stack>
          </form>
        </>
      )}
    </Box>
  );
};

export default CreateClinicPage;
function setNameError(arg0: string) {
  throw new Error("Function not implemented.");
}
