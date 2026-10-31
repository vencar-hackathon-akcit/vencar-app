export type AssessmentStatus = 'processing' | 'completed' | 'needs_input' | 'inconclusive' | 'failed';
export type AssessmentStage = 'received' | 'analyzing' | 'validating' | 'finished';
export type Category = 'structural' | 'mechanical' | 'electrical' | 'aesthetic' | 'documentation';
export type Confidence = 'low' | 'medium' | 'high';
export type Severity = 'minor' | 'moderate' | 'severe';
export type ScoreBand = 'attention' | 'regular' | 'very_good';
export type EventKind = 'step' | 'tool' | 'decision' | 'user_input';
export interface VehicleData {
  make: string;
  model: string;
  year: string;
  plate: string;
  mileage: string;
  region: string;
  usage: string;
}
export interface AssessmentAccepted {
  id: string;
  status: AssessmentStatus;
}
export interface AssessmentProgress {
  id: string;
  status: AssessmentStatus;
  stage: AssessmentStage;
  lastAction: string | null;
  isFinished: boolean;
  pollAfterMs: number | null;
  error: string | null;
  updatedAt: string;
}
export interface Evidence {
  id: string;
  kind: string;
  content: string;
  photoId?: string | null;
}
export interface PhotoAssessment {
  evidenceId: string;
  usable: boolean;
  reason: string;
}
export interface Damage {
  evidenceId: string;
  location: string;
  damageType: string;
  severity: Severity;
  category: Category;
  confidence: Confidence;
  observation: string;
}
export interface Hypothesis {
  description: string;
  confidence: Confidence;
  evidenceIds: string[];
  whatWouldConfirm: string;
}
export interface Conflict {
  description: string;
  evidenceIds: string[];
}
export interface CategoryScore {
  category: Category;
  evaluated: boolean;
  grade: number | null;
  reason: string;
}
export interface VehicleScore {
  value: number;
  band: ScoreBand;
  isPartial: boolean;
  isProvisional?: boolean;
  coveragePercent: number;
  categories: CategoryScore[];
}
export interface Dossier {
  status: AssessmentStatus;
  statusReason: string;
  vehicle: VehicleData;
  evidence?: Evidence[];
  photoAssessments?: PhotoAssessment[];
  damages?: Damage[];
  hypotheses?: Hypothesis[];
  conflicts?: Conflict[];
  pendingInformation?: string[];
  questions?: string[];
  limitations?: string[];
  warnings?: string[];
  score?: VehicleScore | null;
  summary?: string;
  recommendation?: string;
  requiresHumanValidation?: boolean;
  humanValidationReason?: string;
}
export interface AgentEvent {
  run: number;
  kind: EventKind;
  name: string;
  input?: unknown;
  output?: unknown;
  createdAt: string;
  hash: string;
}
export interface PhotoSummary {
  id: string;
  evidenceId: string;
  filename: string;
}
export interface AssessmentDetail {
  id: string;
  vehicle: VehicleData;
  description: string;
  status: AssessmentStatus;
  dossier?: Dossier | null;
  error?: string | null;
  createdAt: string;
  updatedAt: string;
  events: AgentEvent[];
  historyIntact: boolean;
  photos: PhotoSummary[];
}
