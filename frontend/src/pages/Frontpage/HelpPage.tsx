import { helpFaqItems } from "@/components/constants/helpFaqItems";
import Layout from "@/components/layout/Layout";
import {
  Box,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  VStack,
  Container,
  useColorModeValue,
  Button,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export const HelpPage = () => {
  const borderColor = "gray.200";
  const navigate = useNavigate();

  return (
    <Container maxW="4xl" py={10} px={{ base: 4, md: 8 }}>
      <VStack spacing={10} align="start">
        <Box p={6} borderRadius="md" w="100%" boxShadow="sm">
          <Heading size="lg" mb={4}>
            Om Klinika
          </Heading>
          <VStack spacing={4} align="start">
            <Text>
              Velkommen til <strong>Klinika</strong> – Danmarks moderne
              sundhedsplatform for patienter i Region Hovedstaden. Hos os kan du
              nemt og sikkert se dine kommende aftaler, modtage beskeder, få
              adgang til dine recepter og chatte med vores AI-assistent.
            </Text>
            <Text>
              Vores AI-assistent er udviklet i samarbejde med sundhedsfaglige
              eksperter og kan hjælpe dig med at forstå dine symptomer, stille
              relevante spørgsmål og give dig ro i en tid, hvor bekymringer
              fylder. Platformen kombinerer kunstig intelligens med lægefaglig
              viden, så du føler dig både tryg og får en effektiv oplevelse med
              din læge.
            </Text>
            <Text>
              Klinika er her for at styrke dine konsultationer – både før, under
              og efter besøget hos lægen. Klinika går efter, at teknologi skal
              give ro og fremme den enkeltes sundhed, ikke bekymring.
            </Text>
          </VStack>
        </Box>

        <Box w="100%" p={{ sm: 4 }}>
          <Heading size="md" mb={4}>
            Ofte stillede spørgsmål
          </Heading>
          <Accordion allowToggle>
            {helpFaqItems.map((item, idx) => (
              <AccordionItem
                key={idx}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="md"
                mb={3}
              >
                <AccordionButton
                  _expanded={{ bg: "primary.red", color: "white" }}
                  px={4}
                  py={3}
                >
                  <Box flex="1" textAlign="left" fontWeight="bold">
                    {item.question}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel px={4} pb={4}>
                  {item.answer}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
          <Box textAlign="center" mt={8}>
            <Button variant="solidRed" onClick={() => navigate("/")} size="lg">
              Gå til forsiden
            </Button>
          </Box>
        </Box>
      </VStack>
    </Container>
  );
};

export default HelpPage;
