import { Router } from 'express';
import { authenticateJWT } from '../middleware/authenticateJWT.middleware';
import { authorizeRoles } from '../middleware/authorizeRoles.middleware';

const router = Router();

// test route for authentication
router.get('/protected', authenticateJWT, (req, res) => {
  res.json({ message: 'Protected route accessed', user: req.user });
});

// test routes for authroization
router.get(
  '/doctor-area',
  authenticateJWT,
  authorizeRoles(['doctor', 'admin']),
  (req, res) => {
    res.json({
      message: 'Welcome, Doctor or Admin. You are allowed to see this',
      user: req.user,
    });
  }
);

router.get(
  '/admin-area',
  authenticateJWT,
  authorizeRoles(['admin']),
  (req, res) => {
    res.json({ message: 'Welcome, admins only allowed here' });
  }
);

router.get(
  '/patient-area',
  authenticateJWT,
  authorizeRoles(['patient', 'admin']),
  (req, res) => {
    res.json({ message: 'Welcome patient' });
  }
);

router.get(
  '/secretary-area',
  authenticateJWT,
  authorizeRoles(['secretary', 'admin']),
  (req, res) => {
    res.json({ message: 'Welcome, secretary' });
  }
);

export default router;
