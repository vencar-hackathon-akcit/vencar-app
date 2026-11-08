// Dependencies
import type {CSSProperties} from 'react';

// Shared
import {Accordion, Badge} from '../ui';
import {SpinningNumber, useShown} from '../ui/motion';

// Types
import type {VehicleScore} from '../../lib/assessmentTypes';

// Local
import {BAND_LABELS, CATEGORY_LABELS} from '../../lib/labels';

const BAND_TONES = {attention: 'danger', regular: 'warning', very_good: 'success'} as const;
const BAND_TEXT = {attention: 'text-coral-red', regular: 'text-warm-amber', very_good: 'text-signal-lime'};
const RING_RADIUS = 52;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/** Format a category grade with the Brazilian decimal separator. */
function formatGrade(grade: number): string {
  return grade.toLocaleString('pt-BR', {maximumFractionDigits: 2});
}

/** Pick the bar color for a category grade from 0 to 10. */
function gradeFill(grade: number): string {
  if (grade >= 7) return 'bg-signal-lime';
  if (grade >= 4) return 'bg-warm-amber';
  return 'bg-coral-red';
}

/** Draw the score as a ring that fills up while its digits spin into place. */
function ScoreRing({score}: {score: VehicleScore}) {
  const shown = useShown();
  const offset = RING_LENGTH * (1 - (shown ? score.value : 0) / 100);
  return (
    <div role="meter" aria-label="Score Vencar provisório" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score.value} aria-valuetext={`${score.value} de 100, faixa ${BAND_LABELS[score.band]}, provisório`} className="relative mx-auto size-40">
      <svg aria-hidden="true" viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={RING_RADIUS} fill="none" strokeWidth="10" className="stroke-surface-container-high" />
        <circle cx="60" cy="60" r={RING_RADIUS} fill="none" strokeWidth="10" strokeLinecap="round" stroke="currentColor" strokeDasharray={RING_LENGTH} strokeDashoffset={offset} className={`v-ring-value ${BAND_TEXT[score.band]}`} />
      </svg>
      <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center">
        <SpinningNumber value={score.value} className="font-geist-mono text-[44px] font-semibold leading-none text-ice-white" />
        <span className="text-body-sm text-cool-gray">de 100</span>
      </div>
    </div>
  );
}

/** Show the score as provisional and partial, with what was not evaluated. */
export function ScoreCard({score}: {score: VehicleScore}) {
  const shown = useShown();
  return (
    <div className="space-y-4">
      <ScoreRing score={score} />
      <div className="flex flex-wrap justify-center gap-2">
        <Badge tone={BAND_TONES[score.band]}>{BAND_LABELS[score.band]}</Badge>
        <Badge tone="warning">Provisório</Badge>
        {score.isPartial && <Badge tone="neutral">Parcial</Badge>}
      </div>
      <p className="text-center text-body-sm text-on-surface-variant">Não é um veredito: a escala é provisória e o cálculo cobriu {score.coveragePercent}% do que seria avaliado.</p>
      <ul className={`space-y-3 border-y border-steel py-3 ${shown ? 'is-shown' : ''}`}>
        {score.categories.map((item, index) => (
          <li key={item.category}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-body-md text-ice-white">{CATEGORY_LABELS[item.category]}</span>
              {item.evaluated && item.grade !== null ? <span className="font-geist-mono text-body-md text-ice-white">{formatGrade(item.grade)}/10</span> : <Badge tone="neutral">Não avaliado</Badge>}
            </div>
            <div aria-hidden="true" className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-container-high">
              {item.evaluated && item.grade !== null && <div className={`v-fill h-full rounded-full ${gradeFill(item.grade)}`} style={{'--fill': item.grade / 10, '--stagger-index': index} as CSSProperties} />}
            </div>
          </li>
        ))}
      </ul>
      <Accordion title="Ver motivos">
        <ul className="space-y-2">
          {score.categories.map((item) => <li key={item.category} className="text-body-sm text-cool-gray"><span className="font-medium text-on-surface-variant">{CATEGORY_LABELS[item.category]}:</span> {item.reason}</li>)}
        </ul>
      </Accordion>
    </div>
  );
}
