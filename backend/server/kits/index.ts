import { Router } from 'express';
import { createKit, getKits, getKitById, deleteKit, getGenerationStatus, uploadResume } from './kit.controller';
import { authenticate } from '../auth/auth.middleware';
import multer from 'multer';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = Router();

router.use(authenticate);

router.post('/', createKit);
router.get('/', getKits);
router.get('/:id', getKitById);
router.delete('/:id', deleteKit);
router.get('/:id/generation-status', getGenerationStatus);
router.post('/:id/resume', upload.single('resume'), uploadResume);

export default router;
