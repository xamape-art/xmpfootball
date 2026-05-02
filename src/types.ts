export type Position = 'delantera' | 'extremo';
export type SubscriptionStatus = 'trial' | 'active' | 'inactive';
export type Phase = 'ofensivo' | 'defensivo' | 'ambos';

export interface Player {
  id: string;
  name: string;
  photoUrl?: string;
  team: string;
  position: Position;
  side?: 'derecha' | 'izquierda' | 'ambos';
  age?: number;
  nationality?: string;
  email?: string;
  phone?: string;
  trialStartDate: string;
  subscriptionStatus: SubscriptionStatus;
  notes?: string;
  createdAt: string;
}

export interface ConceptRating {
  conceptId: string;
  rating: number; // 1-5, 0 = not evaluated
  note?: string;
}

export interface MatchInfo {
  opponent?: string;
  competition?: string;
  result?: string;
  venue?: string;
  minute?: number;
}

export interface Analysis {
  id: string;
  playerId: string;
  date: string;
  matchInfo: MatchInfo;
  videoUrl?: string;
  phase: Phase;
  offensiveRatings: ConceptRating[];
  defensiveRatings: ConceptRating[];
  generalObservations?: string;
  strengths: string[];
  improvements: string[];
  nextMatchFocus: string;
  overallRating: number;
  createdAt: string;
}

export interface Concept {
  id: string;
  label: string;
  description?: string;
}

export interface ConceptGroup {
  position: Position;
  phase: 'ofensivo' | 'defensivo';
  concepts: Concept[];
}
