import { Category, UserRole } from '@prisma/client';

export enum LessonType {
  THEORY = 'THEORY',
  PRACTICE = 'PRACTICE',
  QUIZ = 'QUIZ',
  PROJECT = 'PROJECT',
  CHALLENGE = 'CHALLENGE',
}

export interface PathMetadata {
  tags?: string[];
  prerequisites?: string[];
  outcomes?: string[];
  [key: string]: unknown;
}

export interface UnitMetadata {
  resources?: string[];
  estimatedDifficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  [key: string]: unknown;
}

export interface LessonMetadata {
  videoUrl?: string;
  readingTime?: number;
  resources?: string[];
  [key: string]: unknown;
}

export interface LessonContent {
  sections?: Array<{
    type: 'text' | 'code' | 'video' | 'quiz';
    content: string;
    language?: string;
  }>;
  summary?: string;
  [key: string]: unknown;
}

export interface CreatePathData {
  slug: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  order?: number;
  isPublished?: boolean;
  category: Category;
  targetRole?: UserRole;
  estimatedHours?: number;
  totalXp?: number;
  metadata?: PathMetadata;
}

export interface CreateUnitData {
  pathId: string;
  slug: string;
  title: string;
  description: string;
  icon?: string;
  order?: number;
  isPublished?: boolean;
  estimatedHours?: number;
  totalXp?: number;
  prerequisites?: string[];
  learningGoals?: string[];
  metadata?: UnitMetadata;
}

export interface CreateLessonData {
  unitId: string;
  slug: string;
  title: string;
  description: string;
  icon?: string;
  order?: number;
  isPublished?: boolean;
  lessonType?: LessonType;
  estimatedMinutes?: number;
  xpReward?: number;
  content?: LessonContent;
  metadata?: LessonMetadata;
}

export interface PathWithRelations {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  order: number;
  isPublished: boolean;
  category: Category;
  targetRole?: UserRole;
  estimatedHours: number;
  totalXp: number;
  metadata: PathMetadata;
  createdAt: Date;
  updatedAt: Date;
  units?: UnitWithRelations[];
  _count?: {
    units: number;
  };
}

export interface UnitWithRelations {
  id: string;
  pathId: string;
  slug: string;
  title: string;
  description: string;
  icon?: string;
  order: number;
  isPublished: boolean;
  estimatedHours: number;
  totalXp: number;
  prerequisites: string[];
  learningGoals: string[];
  metadata: UnitMetadata;
  createdAt: Date;
  updatedAt: Date;
  path?: PathWithRelations;
  lessons?: LessonWithRelations[];
  _count?: {
    lessons: number;
  };
}

export interface LessonWithRelations {
  id: string;
  unitId: string;
  slug: string;
  title: string;
  description: string;
  icon?: string;
  order: number;
  isPublished: boolean;
  lessonType: LessonType;
  estimatedMinutes: number;
  xpReward: number;
  content?: LessonContent;
  metadata: LessonMetadata;
  createdAt: Date;
  updatedAt: Date;
  unit?: UnitWithRelations;
  challenges?: unknown[];
  _count?: {
    challenges: number;
  };
}
