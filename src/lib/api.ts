// Types
import type {AssessmentAccepted, AssessmentDetail, AssessmentProgress} from './assessmentTypes';

// Local
import {API_BASE_URL, API_TOKEN} from './config';

const ASSESSMENTS_PATH = `${API_BASE_URL}/api/v1/assessments`;
const MESSAGES_BY_CODE: Record<string, string> = {
  unauthorized: 'Não conseguimos confirmar seu acesso. Verifique o token configurado e tente de novo.',
  assessment_not_found: 'Não encontramos esta avaliação. Confira o link ou comece uma nova.',
  assessment_busy: 'A avaliação ainda está em andamento. Aguarde terminar para enviar novas informações.',
  invalid_photo: 'Um dos arquivos não é uma imagem válida. Remova-o e tente de novo.',
  too_many_photos: 'A avaliação aceita no máximo 10 fotos. Remova algumas e tente de novo.',
  agent_failure: 'A análise não pôde ser concluída. Tente de novo em alguns minutos.',
  validation_error: 'Alguns dados não foram aceitos. Revise o formulário e tente de novo.',
  internal_error: 'O servidor teve um problema. Tente de novo em alguns minutos.',
};
const NETWORK_MESSAGE = 'Não conseguimos falar com o servidor. Verifique se a API está no ar e tente de novo.';
const UNKNOWN_MESSAGE = 'Algo deu errado ao falar com o servidor. Tente de novo.';

export class ApiError extends Error {
  code: string;
  status: number;
  fields: string[];
  /** Keep the API failure details alongside a message fit for the user. */
  constructor(message: string, code: string, status: number, fields: string[] = []) {
    super(message);
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
  /** Tell failures that may pass on their own from those that will not. */
  get isTransient(): boolean {
    return this.status === 0 || this.status >= 500;
  }
}

/** Call the API with the auth header and turn every failure into an ApiError. */
async function send(url: string, init: RequestInit = {}): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, {...init, headers: {Authorization: `Bearer ${API_TOKEN}`}});
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(NETWORK_MESSAGE, 'network_error', 0);
  }
  if (response.ok) return response;
  const body = await response.json().catch(() => ({}));
  const code = typeof body.code === 'string' ? body.code : 'unknown';
  throw new ApiError(MESSAGES_BY_CODE[code] ?? UNKNOWN_MESSAGE, code, response.status, body.fields ?? []);
}

/** Open an assessment from the multipart intake form. */
export async function createAssessment(form: FormData): Promise<AssessmentAccepted> {
  const response = await send(ASSESSMENTS_PATH, {method: 'POST', body: form});
  return response.json();
}

/** Send the user's answer and start a new agent run. */
export async function answerAssessment(id: string, form: FormData): Promise<AssessmentAccepted> {
  const response = await send(`${ASSESSMENTS_PATH}/${encodeURIComponent(id)}/answers`, {method: 'POST', body: form});
  return response.json();
}

/** Read the lightweight progress of a run. */
export async function getProgress(id: string, signal?: AbortSignal): Promise<AssessmentProgress> {
  const response = await send(`${ASSESSMENTS_PATH}/${encodeURIComponent(id)}/status`, {signal});
  return response.json();
}

/** Read the full assessment with its dossier and history. */
export async function getAssessment(id: string, signal?: AbortSignal): Promise<AssessmentDetail> {
  const response = await send(`${ASSESSMENTS_PATH}/${encodeURIComponent(id)}`, {signal});
  return response.json();
}

/** Download an evidence photo, which requires the auth header. */
export async function getPhotoBlob(id: string, photoId: string, signal?: AbortSignal): Promise<Blob> {
  const response = await send(`${ASSESSMENTS_PATH}/${encodeURIComponent(id)}/photos/${encodeURIComponent(photoId)}`, {signal});
  return response.blob();
}
