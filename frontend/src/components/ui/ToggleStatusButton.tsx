import { Button } from "@chakra-ui/react";

interface ToggleStatusButtonProps {
  currentStatus: "ledig" | "optaget" | "fri";
  onToggle: () => void;
}
const ToggleStatusButton = ({
  currentStatus,
  onToggle,
}: ToggleStatusButtonProps) => {
  return (
    <Button
      size="sm"
      colorScheme={
        currentStatus === "ledig"
          ? "red"
          : currentStatus === "optaget"
          ? "green"
          : "yellow"
      }
      onClick={onToggle}
    >
      {currentStatus === "ledig"
        ? "Gå optaget"
        : currentStatus === "optaget"
        ? "Gå ledig"
        : "Fri"}
    </Button>
  );
};

export default ToggleStatusButton;
