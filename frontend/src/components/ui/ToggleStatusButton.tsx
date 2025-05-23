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
          ? "green"
          : currentStatus === "optaget"
          ? "red"
          : "yellow"
      }
      onClick={onToggle}
    >
      {currentStatus === "ledig"
        ? "Ledig"
        : currentStatus === "optaget"
        ? "Optaget"
        : "Fri"}
    </Button>
  );
};

export default ToggleStatusButton;
