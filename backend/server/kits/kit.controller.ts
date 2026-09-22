import { Response } from 'express';
import { Kit } from '../models/Kit';
import { AuthRequest } from '../auth/auth.middleware';
import { runGenerationPipeline, generateContentHash } from '../pipeline/orchestrator';
const pdfParse = require('pdf-parse');
const PDFParser = require('pdf2json');

const parsePdfFallback = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(this, 1);
    pdfParser.on('pdfParser_dataError', (errData: any) => reject(errData.parserError));
    pdfParser.on('pdfParser_dataReady', () => {
      resolve(pdfParser.getRawTextContent());
    });
    pdfParser.parseBuffer(buffer);
  });
};

export const createKit = async (req: AuthRequest, res: Response) => {
  try {
    let { jd, companyUrl, daysAvailable } = req.body;
    
    // If a JD file was uploaded, parse it and overwrite 'jd'
    if (req.file) {
      try {
        if (req.file.mimetype === 'application/pdf') {
          const parsed = await pdfParse(req.file.buffer);
          jd = parsed.text;
        } else if (req.file.mimetype === 'text/plain') {
          jd = req.file.buffer.toString('utf-8');
        } else {
          return res.status(400).json({ error: 'Unsupported JD file type. Please upload a PDF or TXT.' });
        }
        
        if (!jd || jd.trim().length === 0) {
          return res.status(400).json({ error: 'Could not extract readable text from the uploaded document.' });
        }
      } catch (err) {
        console.warn('JD Parsing Error with pdf-parse, attempting fallback...', err);
        try {
          jd = await parsePdfFallback(req.file.buffer);
          if (!jd || jd.trim().length === 0) {
            return res.status(400).json({ error: 'Could not extract readable text from the uploaded document.' });
          }
        } catch (fallbackErr) {
          console.error('Fallback JD Parsing Error:', fallbackErr);
          return res.status(400).json({ error: 'Failed to parse the uploaded document. It might be corrupted or protected.' });
        }
      }
    }
    
    if (!jd || !companyUrl || !daysAvailable) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const contentHash = generateContentHash(jd, companyUrl);
    
    // Deduplication check
    const existingKit = await Kit.findOne({ userId: req.user?._id, contentHash });
    if (existingKit) {
      return res.status(200).json({ kit: existingKit, message: 'Kit already exists' });
    }

    const kit = new Kit({
      userId: req.user?._id,
      contentHash,
      source: {
        company_url: companyUrl,
        role: jd.substring(0, 50), // temp
        jd_chars: jd.length
      },
      schedule: {
        days_available: daysAvailable,
        days: []
      }
    });

    await kit.save();

    // Start generation asynchronously
    runGenerationPipeline(kit.id).catch(console.error);

    res.status(201).json({ kit, message: 'Generation started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create kit' });
  }
};

export const getKits = async (req: AuthRequest, res: Response) => {
  try {
    const kits = await Kit.find({ userId: req.user?._id }).sort({ createdAt: -1 });
    res.json({ kits });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch kits' });
  }
};

export const getKitById = async (req: AuthRequest, res: Response) => {
  try {
    const kit = await Kit.findOne({ _id: req.params.id, userId: req.user?._id });
    if (!kit) return res.status(404).json({ error: 'Kit not found' });
    res.json({ kit });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch kit' });
  }
};

export const deleteKit = async (req: AuthRequest, res: Response) => {
  try {
    const kit = await Kit.findOneAndDelete({ _id: req.params.id, userId: req.user?._id });
    if (!kit) return res.status(404).json({ error: 'Kit not found' });
    res.json({ message: 'Kit deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete kit' });
  }
};

export const getGenerationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const kit = await Kit.findOne({ _id: req.params.id, userId: req.user?._id }).select('generationState status error');
    if (!kit) return res.status(404).json({ error: 'Kit not found' });
    res.json({ status: kit.status, generationState: kit.generationState, error: kit.error });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status' });
  }
};


import { evaluateResume } from '../pipeline/resume-evaluation';

export const uploadResume = async (req: AuthRequest, res: Response) => {
  try {
    const kit = await Kit.findOne({ _id: req.params.id, userId: req.user?._id });
    if (!kit) return res.status(404).json({ error: 'Kit not found' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    let textContent = '';
    const file = req.file;

    if (file.mimetype === 'application/pdf') {
      try {
        const parsed = await pdfParse(file.buffer);
        textContent = parsed.text;
      } catch (err) {
        console.warn('Resume Parsing Error with pdf-parse, attempting fallback...', err);
        try {
          textContent = await parsePdfFallback(file.buffer);
        } catch (fallbackErr) {
          console.error('Fallback Resume Parsing Error:', fallbackErr);
          return res.status(400).json({ error: 'Failed to parse the uploaded resume. It might be corrupted or protected.' });
        }
      }
    } else if (file.mimetype === 'text/plain') {
      textContent = file.buffer.toString('utf-8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or TXT.' });
    }

    if (!textContent || textContent.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from file.' });
    }

    const evaluation = await evaluateResume(textContent, kit.role.requirements, kit.role.title);
    
    kit.resume_evaluation = evaluation;
    await kit.save();

    res.json({ message: 'Resume evaluated successfully', evaluation });
  } catch (error: any) {
    console.error('Resume eval error', error);
    res.status(500).json({ error: 'Failed to evaluate resume' });
  }
};

