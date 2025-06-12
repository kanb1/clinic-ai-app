import { body } from "express-validator";

export const validateStartChatSession = [
  body("message")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Besked mangler eller er tom"),
];

export const validateSaveChatHistory = [
  body("messages")
    .isArray({ min: 1 })
    .withMessage("Samtalehistorik skal være en ikke-tom liste"),
  body("messages.*.user")
    .isString()
    .withMessage("Hver besked skal have en 'user'-streng"),
  body("messages.*.ai")
    .isString()
    .withMessage("Hver besked skal have en 'ai'-streng"),
  body("appointmentId").isMongoId().withMessage("Ugyldigt appointmentId"),
];
