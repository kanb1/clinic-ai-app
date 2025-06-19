import { Button } from "@chakra-ui/react";
import { FaCheck, FaTimes, FaCoffee } from "react-icons/fa";

//toggleknap > forskellige farver/status afhængig af aktuelle status

interface ToggleStatusButtonProps {
  currentStatus: "ledig" | "optaget" | "fri";
  onToggle: () => void;
}

const ToggleStatusButton = ({
  currentStatus,
  onToggle, //når bruger trykker på knappen
}: ToggleStatusButtonProps) => {
  // hvilket label og farve skal vises
  const getButtonConfig = () => {
    switch (currentStatus) {
      case "ledig":
        return { label: "Gå optaget", color: "red" };
      case "optaget":
        return { label: "Gå ledig", color: "green" };
      case "fri":
        return { label: "Fri", color: "yellow" };
      default:
        return { label: "Ukendt", color: "gray" };
    }
  };

  // destruct/udtræk værdier fra getButtonConfig
  const { label, color } = getButtonConfig();

  return (
    <Button
      size={{ base: "xs", md: "sm", lg: "md" }}
      fontSize={{ base: "xs", md: "sm" }}
      py={{ base: 4 }}
      colorScheme={color} //bruges her
      borderRadius="full"
      whiteSpace="nowrap"
      onClick={onToggle}
    >
      {/* og her */}
      {label}
    </Button>
  );
};

export default ToggleStatusButton;
