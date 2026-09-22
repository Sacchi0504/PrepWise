import { Router, Response } from 'express';
import { PracticeSession } from '../models/PracticeSession';
import { AuthRequest } from '../auth/auth.middleware';
import { authenticate } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/:id/practice', async (req: AuthRequest, res: Response) => {
  try {
    const kitId = req.params.id;
    const { flashcardId, confidence, duration } = req.body;
    
    if (!flashcardId || !confidence || !duration) {
      return res.status(400).json({ error: 'Missing practice fields' });
    }

    const session = new PracticeSession({
      userId: req.user?._id,
      kitId,
      flashcardId,
      confidence,
      duration
    });

    await session.save();
    res.status(201).json({ session });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save practice session' });
  }
});

router.get('/:id/practice/progress', async (req: AuthRequest, res: Response) => {
  try {
    const kitId = req.params.id;
    const sessions = await PracticeSession.find({ userId: req.user?._id, kitId }).sort({ practicedAt: -1 });
    
    // Group by flashcard to find latest confidence
    const latestConfidence = new Map<string, number>();
    sessions.forEach(s => {
      if (!latestConfidence.has(s.flashcardId)) {
        latestConfidence.set(s.flashcardId, s.confidence);
      }
    });

    res.json({
      sessions,
      latestConfidence: Object.fromEntries(latestConfidence)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch practice progress' });
  }
});

export default router;
