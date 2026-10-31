const STORAGE_KEY = 'vencar-assessment-draft';

export interface AssessmentDraft {
  plate: string;
  mileage: string;
  region: string;
}

/** Keep what the visitor typed on the landing page for the intake form. */
export function saveAssessmentDraft(draft: AssessmentDraft): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    return;
  }
}

/** Read the draft once and clear it. */
export function takeAssessmentDraft(): Partial<AssessmentDraft> {
  try {
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}
