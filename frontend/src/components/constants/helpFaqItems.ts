// Trækker spørgsmål og svar ud for at holde komponenten ren (helppage)

interface FaqItem {
  question: string;
  answer: string;
}

export const helpFaqItems: FaqItem[] = [
  {
    question: "Hvordan logger jeg ind?",
    answer:
      "Du logger ind med din e-mail og adgangskode, som du har modtaget fra Borgerservice, når din klinik er blevet oprettet gennem vores platform. Kontakt Borgerservice for hjælp – i nogle tilfælde kan klinikken også hjælpe dig.",
  },
  {
    question: "Hvad kan jeg bruge AI-assistenten til?",
    answer:
      " Du kan bruge AI-assistenten til at beskrive dine symptomer, få vejledende svar og blive bedre forberedt til konsultationen.Assistenten er ikke en erstatning for lægen, men et fagligt supplement. For at fremme kvaliteten af konsultationen mellem dig og din læge, så har vi gjort det muligt for patienter at dele deres samtale med lægen. Samtalen vil være tilgængelig for den konsultation du har valgt, og dermed vil lægen kunne tilgå den i vores beskyttede journal.",
  },
  {
    question: "Hvordan får jeg adgang til mine recepter?",
    answer:
      'Dine recepter vises under "Min side" så snart de er blevet oprettet.',
  },
  {
    question: "Hvordan kontakter jeg jer?",
    answer:
      "Du kan ringe til os på +45 00000000. Det bliver også snart muligt at sende en besked direkte til klinikken via platformen.",
  },
  {
    question: "Hvad gør jeg, hvis noget ikke virker?",
    answer:
      "Kontakt vores support (snart via formular her på siden) eller henvend dig direkte til klinikken, hvis det haster.",
  },
  {
    question: "Hvordan beskytter Klinika mine data?",
    answer:
      "Hos Klinika bliver dine oplysninger og samtaler højt beskyttet af applikationens sikkerhedsfunktioner. Vi følger de vigtigste principper og anbefalinger i forhold til IT-sikkerhed. Alle data er krypteret og opbevares sikkert. Kun sundhedsfagligt personale med adgangsrettigheder kan se dine journaler og samtaler.",
  },
];
