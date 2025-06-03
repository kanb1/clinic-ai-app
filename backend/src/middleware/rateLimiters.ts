import rateLimit from "express-rate-limit";

// Login: max 5 forsøg pr. 15 minutter pr. IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutter
  max: 5,
  message: {
    message:
      "Du har forsøgt at logge ind for mange gange. Prøv igen om 15 minutter.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Patientens AI-samtale: max 10 beskeder pr. 10 minutter
export const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: {
    message:
      "Du har sendt for mange beskeder på kort tid. Vent venligst 10 min. og prøv igen.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Send besked - Sekretær: max 10 beskeder pr. 20 minutter
export const messageLimiter = rateLimit({
  windowMs: 20 * 60 * 1000,
  max: 10,
  message: {
    message:
      "Du har sendt for mange beskeder på kort tid. Prøv igen om 20. minutter.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
