import mongoose, { Document, Schema } from 'mongoose';

export interface IRequirement {
  id: string;
  text: string;
  kind: 'technical' | 'behavioural' | 'domain';
  priority: 'must' | 'nice';
}

export interface IQuestion {
  id: string;
  requirement_ids: string[];
  category: 'technical' | 'behavioural' | 'system-design' | 'company-fit';
  prompt: string;
  answer_outline: string;
  difficulty: number;
  source?: 'generated' | 'edited' | 'pinned' | 'deleted';
  edited?: boolean;
  pinned?: boolean;
}

export interface IFlashcard {
  id: string;
  front: string;
  back: string;
  requirement_ids: string[];
  source?: 'generated' | 'edited' | 'pinned' | 'deleted';
  edited?: boolean;
  pinned?: boolean;
}

export interface IKit extends Document {
  userId: mongoose.Types.ObjectId;
  status: 'ok' | 'failed';
  generationState: 'queued' | 'researching' | 'generating' | 'validating' | 'completed' | 'failed' | 'partial';
  contentHash: string;
  source: {
    company: string;
    company_url: string;
    role: string;
    location: string;
    jd_chars: number;
    researched_at: string;
    pages_used: string[];
  };
  company_brief: {
    summary: string;
    what_they_do: string;
    sources: string[];
  };
  role: {
    title: string;
    seniority: string;
    responsibilities: string[];
    requirements: IRequirement[];
  };
  questions: IQuestion[];
  flashcards: IFlashcard[];
  schedule: {
    days_available: number;
    days: {
      day: number;
      focus: string;
      question_ids: string[];
      minutes: number;
    }[];
  };
  coverage: {
    uncovered_requirement_ids: string[];
    passes: number;
  };
  resume_evaluation?: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    summary: string;
  };
  error?: any;
  createdAt: Date;
  updatedAt: Date;
}

const RequirementSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  kind: { type: String, enum: ['technical', 'behavioural', 'domain'], required: true },
  priority: { type: String, enum: ['must', 'nice'], required: true }
}, { _id: false });

const QuestionSchema = new Schema({
  id: { type: String, required: true },
  requirement_ids: [{ type: String }],
  category: { type: String, enum: ['technical', 'behavioural', 'system-design', 'company-fit'], required: true },
  prompt: { type: String, required: true },
  answer_outline: { type: String, required: true },
  difficulty: { type: Number, required: true },
  source: { type: String, enum: ['generated', 'edited', 'pinned', 'deleted'], default: 'generated' },
  edited: { type: Boolean, default: false },
  pinned: { type: Boolean, default: false }
}, { _id: false });

const FlashcardSchema = new Schema({
  id: { type: String, required: true },
  front: { type: String, required: true },
  back: { type: String, required: true },
  requirement_ids: [{ type: String }],
  source: { type: String, enum: ['generated', 'edited', 'pinned', 'deleted'], default: 'generated' },
  edited: { type: Boolean, default: false },
  pinned: { type: Boolean, default: false }
}, { _id: false });

const KitSchema = new Schema<IKit>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['ok', 'failed'], default: 'ok' },
  generationState: { type: String, enum: ['queued', 'researching', 'generating', 'validating', 'completed', 'failed', 'partial'], default: 'queued' },
  contentHash: { type: String, required: true },
  source: {
    company: { type: String, default: '' },
    company_url: { type: String, default: '' },
    role: { type: String, default: '' },
    location: { type: String, default: '' },
    jd_chars: { type: Number, default: 0 },
    researched_at: { type: String, default: '' },
    pages_used: [{ type: String }]
  },
  company_brief: {
    summary: { type: String, default: '' },
    what_they_do: { type: String, default: '' },
    sources: [{ type: String }]
  },
  role: {
    title: { type: String, default: '' },
    seniority: { type: String, default: '' },
    responsibilities: [{ type: String }],
    requirements: [RequirementSchema]
  },
  questions: [QuestionSchema],
  flashcards: [FlashcardSchema],
  schedule: {
    days_available: { type: Number, default: 5 },
    days: [{
      day: { type: Number, required: true },
      focus: { type: String, required: true },
      question_ids: [{ type: String }],
      minutes: { type: Number, required: true }
    }]
  },
  coverage: {
    uncovered_requirement_ids: [{ type: String }],
    passes: { type: Number, default: 0 }
  },
  resume_evaluation: {
    score: { type: Number },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    summary: { type: String }
  },
  error: { type: Schema.Types.Mixed }
}, { timestamps: true });

export const Kit = mongoose.model<IKit>('Kit', KitSchema);
