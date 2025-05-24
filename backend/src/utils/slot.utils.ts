// Denne funktion genererer 10 faste tidspunkter pr. dag
export const generateTimeSlots = (): { start: string; end: string }[] => {
  return [
    { start: "08:00", end: "08:15" },
    { start: "08:30", end: "08:45" },
    { start: "09:00", end: "09:15" },
    { start: "09:30", end: "09:45" },
    { start: "10:00", end: "10:15" },
    { start: "10:30", end: "10:45" },
    { start: "11:00", end: "11:15" },
    { start: "13:00", end: "13:15" },
    { start: "13:30", end: "13:45" },
    { start: "14:00", end: "14:15" },
  ];
};
