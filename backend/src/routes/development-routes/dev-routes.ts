// routes/dev-routes.ts

import express from "express";
import { UserModel } from "../../models/user.model";

const router = express.Router();

router.patch("/dev/update-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    res.status(400).json({ message: "Email og nyt password er påkrævet" });
    return;
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "Bruger ikke fundet" });
      return;
    }

    // VIGTIGT: Vi sætter feltet som det er — pre("save") vil hashe det
    user.password_hash = newPassword;
    await user.save();

    res.json({ message: `Adgangskode opdateret for ${email}` });
  } catch (error) {
    res.status(500).json({ message: "Fejl under opdatering", error });
  }
});

export default router;
