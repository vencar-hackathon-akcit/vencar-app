// Types
import type {AssessmentStage, AssessmentStatus, Category, Confidence, EventKind, ScoreBand, Severity} from './assessmentTypes';

export const STATUS_LABELS: Record<AssessmentStatus, string> = {
  processing: 'Em análise',
  completed: 'Concluída',
  needs_input: 'Precisa da sua resposta',
  inconclusive: 'Inconclusiva',
  failed: 'Falhou',
};
export const STAGES: {id: AssessmentStage; label: string; hint: string}[] = [
  {id: 'received', label: 'Recebido', hint: 'Dados e fotos registrados'},
  {id: 'analyzing', label: 'Em análise', hint: 'A IA examina as evidências'},
  {id: 'validating', label: 'Em validação', hint: 'Regras conferem o resultado'},
  {id: 'finished', label: 'Finalizado', hint: 'Relatório pronto para revisão'},
];
export const CATEGORY_LABELS: Record<Category, string> = {
  structural: 'Estrutura',
  mechanical: 'Mecânica',
  electrical: 'Elétrica',
  aesthetic: 'Estética',
  documentation: 'Documentação',
};
export const SEVERITY_LABELS: Record<Severity, string> = {minor: 'Leve', moderate: 'Moderada', severe: 'Grave'};
export const CONFIDENCE_LABELS: Record<Confidence, string> = {low: 'Confiança baixa', medium: 'Confiança média', high: 'Confiança alta'};
export const BAND_LABELS: Record<ScoreBand, string> = {attention: 'Atenção', regular: 'Regular', very_good: 'Muito bom'};
export const EVENT_KIND_LABELS: Record<EventKind, string> = {step: 'Etapa', tool: 'Ferramenta', decision: 'Decisão', user_input: 'Sua resposta'};
export const ACTION_LABELS: Record<string, string> = {
  received: 'Recebemos os dados e as fotos',
  missing_data_requested: 'Identificamos dados que faltam',
  orchestrator: 'Planejando os próximos passos da análise',
  analyze_bodywork: 'Examinando a lataria nas fotos',
  analyze_interior: 'Examinando o interior nas fotos',
  get_vehicle_history: 'Consultando o histórico do veículo',
  submit_conclusion: 'Reunindo as conclusões',
  validated: 'Conferindo as conclusões com as regras do relatório',
  dossier_issued: 'Relatório emitido',
  failed: 'A análise foi interrompida',
  user_answer: 'Recebemos sua resposta',
};
const DEFAULT_ACTION_LABEL = 'Analisando as evidências';

/** Translate an agent action into plain Portuguese, whatever the backend adds later. */
export function actionLabel(action: string | null | undefined): string {
  if (!action) return 'Preparando a análise';
  return ACTION_LABELS[action] ?? DEFAULT_ACTION_LABEL;
}
const FIELD_LABELS: Record<string, string> = {
  make: 'marca',
  model: 'modelo',
  year: 'ano',
  plate: 'placa',
  mileage: 'quilometragem',
  region: 'região',
  usage: 'uso',
  photos: 'fotos',
  description: 'descrição',
};

/** Replace raw field names the backend may send inside a sentence. */
export function humanizeField(text: string): string {
  const bare = FIELD_LABELS[text.trim()];
  if (bare) return bare.charAt(0).toUpperCase() + bare.slice(1);
  return text.replace(/^(Informe: )(\w+)(\.?)$/, (match, prefix: string, field: string, end: string) => (FIELD_LABELS[field] ? `${prefix}${FIELD_LABELS[field]}${end}` : match));
}

/** Format an API timestamp for Brazilian readers. */
export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', {dateStyle: 'short', timeStyle: 'medium'});
}
