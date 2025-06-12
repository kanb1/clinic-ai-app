export const sidebarItems = {
  admin: [
    // label: den tekst der vises i sidebar-knappen
    // url: hvad der bliver navigeret til
    { label: "Startside", path: "/admin/frontpage" },
    { label: "Administrér Patient", path: "/admin/patients" },
    { label: "Administrér Læge", path: "/admin/doctors" },
    { label: "Administrér Sekretær", path: "/admin/secretaries" },
    { label: "Send en besked", path: "/admin/send-message" },
  ],
  doctor: [
    { label: "Dashboard", path: "/doctor/dashboard" },
    { label: "Aftaleoversigt", path: "/doctor/appointments" },
    { label: "Patienter & Journaler", path: "/doctor/patients" },
  ],
  secretary: [
    { label: "Dashboard", path: "/secretary/dashboard" },
    { label: "Kalender", path: "/secretary/calendar" },
    { label: "Ny besked", path: "/secretary/messages/new" },
    { label: "Ny aftale", path: "/secretary/appointments/new" },
  ],
  patient: [
    { label: "Startside", path: "/patient/frontpage" },
    { label: "AI-assistent", path: "/patient/ai" },
    { label: "Min side", path: "/patient/appointments" },
    { label: "Indstillinger", path: "/patient/settings" },
  ],
};
