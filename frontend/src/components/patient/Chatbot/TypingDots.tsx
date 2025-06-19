import { Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

// Typing dots while AI is writing, animation

// blinkende prikker -> fra lav gennemsigtighed til helt synlig og tilbage til lav
const blink = keyframes`
  0% { opacity: 0.2 }
  20% { opacity: 1 }
  100% { opacity: 0.2 }
`;
const TypingDots = () => {
  return (
    <Text fontSize="sm" color="gray.600">
      AI skriver
      <Text as="span" animation={`${blink} 1s infinite`} mx="1">
        .
      </Text>
      <Text as="span" animation={`${blink} 1s infinite 0.2s`} mx="1">
        .
      </Text>
      <Text as="span" animation={`${blink} 1s infinite 0.4s`} mx="1">
        .
      </Text>
    </Text>
  );
};

export default TypingDots;
