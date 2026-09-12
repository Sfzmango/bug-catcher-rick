import type { Sev } from '../lib/severity';

export interface TrainerCard {
  name: string;
  number: string;
  trainerClass: string;
  type: string;
  role: string;
  description: string;
  badge: string;
}

export interface ToolGrant {
  name: string;
  granted: boolean;
  note?: string;
}

export interface AutoDetectStep {
  title: string;
  detail: string;
}

export interface Move {
  field: string;
  description: string;
  tag?: string;
}

export interface CardinalRule {
  title: string;
  detail: string;
}

export interface CircuitBreaker {
  failure: string;
  action: string;
}

export interface TokenBudget {
  cap: number;
  checkpoint: number;
  halt: number;
}

export interface SevRubricRow {
  sev: Sev;
  name: string;
  meaning: string;
  route: string;
}
