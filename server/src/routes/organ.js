import express from 'express';
import * as organController from '../controllers/organController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register-donor', authenticate, organController.registerDonor);
router.get('/donors', authenticate, organController.searchDonors);
router.put('/availability', authenticate, organController.updateAvailability);
router.get('/my-profile', authenticate, organController.getMyDonorProfile);

export default router;
