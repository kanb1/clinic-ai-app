// rolle navigation ift sidebar
// bruges til at slå op i sidebar ud fra user.role
export const sidebarItems = {
  // det er et objekt hvor hver rolle er en nøgle (key), og værdien er et array af links som passer til den rolle
  admin: [
    // label: den tekst der vises i sidebar-knappen
    // url: hvad der bliver navigeret til
    { label: "Dashboard", path: "/admin/frontpage" },
    { label: "Administrér Patient", path: "/admin/patients" },
    { label: "Administrér Læge", path: "/admin/doctors" },
    { label: "Administrér Sekretær", path: "/admin/secretaries" },
  ],
  doctor: [
    { label: "Dashboard", path: "/doctor/dashboard" },
    { label: "Kalender", path: "/doctor/calendar" },
    { label: "Aftaleoversigt", path: "/doctor/appointments" },
    { label: "Patienter", path: "/doctor/patients" },
    { label: "Indstillinger", path: "/doctor/settings" },
  ],
  secretary: [
    { label: "Dashboard", path: "/secretary/dashboard" },
    { label: "Kalender", path: "/secretary/calendar" },
    { label: "Ny besked", path: "/secretary/messages/new" },
    { label: "Ny aftale", path: "/secretary/appointments/new" },
  ],
  patient: [
    { label: "Dashboard", path: "/patient/dashboard" },
    { label: "AI-assistent", path: "/patient/ai" },
    { label: "Min side", path: "/patient/profile" },
    { label: "Indstillinger", path: "/patient/settings" },
  ],
};
