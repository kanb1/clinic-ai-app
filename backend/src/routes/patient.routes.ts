import express from 'express';
import {
  deletePatient,
  getPatients,
  lookupPatientByCpr,
  updatePatient,
} from '../controllers/patient/patient.controller';
import { authenticateJWT } from '../middleware/authenticateJWT.middleware';
import { authorizeRoles } from '../middleware/authorizeRoles.middleware';

const router = express.Router();

// Get patients list
router.get(
  '/',
  authenticateJWT,
  authorizeRoles(['admin', 'doctor', 'secretary']),
  getPatients
);

//CPR-lookup
router.get(
  '/lookup/:cpr',
  authenticateJWT,
  authorizeRoles(['admin', 'secretary']),
  lookupPatientByCpr
);

router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles(['admin', 'secretary']),
  updatePatient
);

router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles(['admin']),
  deletePatient
);

export default router;
