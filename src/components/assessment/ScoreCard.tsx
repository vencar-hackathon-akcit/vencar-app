// Shared
import {Accordion, Badge} from '../ui';

// Types
import type {VehicleScore} from '../../lib/assessmentTypes';

// Local
import {BAND_LABELS, CATEGORY_LABELS} from '../../lib/labels';

const BAND_TONES = {attention: 'danger', regular: 'warning', very_good: 'success'} as const;
const BAND_FILL = {attention: 'bg-coral-red', regular: 'bg-warm-amber', very_good: 'bg-signal-lime'};
const BANDS = [{label: 'Atenção', range: '0 a 40', width: 'w-[40%]'}, {label: 'Regular', range: '41 a 70', width: 'w-[30%]'}, {label: 'Muito bom', range: '71 a 100', width: 'w-[30%]'}];

/** Format a category grade with the Brazilian decimal separator. */
function formatGrade(grade: number): string {
  return grade.toLocaleString('pt-BR', {maximumFractionDigits: 2});
}

/** Show the score as provisional and partial, with what was not evaluated. */
export function ScoreCard({score}: {score: VehicleScore}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-geist-mono text-[48px] font-semibold leading-none text-ice-white">{score.value}<span className="text-headline-sm text-cool-gray">/100</span></p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge tone={BAND_TONES[score.band]}>{BAND_LABELS[score.band]}</Badge>
          <Badge tone="warning">Provisório</Badge>
          {score.isPartial && <Badge tone="neutral">Parcial</Badge>}
        </div>
      </div>
      <div>
        <div role="meter" aria-label="Score Vencar provisório" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score.value} aria-valuetext={`${score.value} de 100, faixa ${BAND_LABELS[score.band]}, provisório`} className="h-2 overflow-hidden rounded-full bg-surface-container-high">
          <div className={`h-full rounded-full ${BAND_FILL[score.band]}`} style={{width: `${score.value}%`}} />
        </div>
        <div aria-hidden="true" className="mt-1 flex text-body-sm text-cool-gray">
          {BANDS.map((band) => <span key={band.label} className={band.width}>{band.range}</span>)}
        </div>
      </div>
      <p className="text-body-sm text-on-surface-variant">Não é um veredito: a escala é provisória e o cálculo cobriu {score.coveragePercent}% do que seria avaliado.</p>
      <ul className="divide-y divide-steel border-y border-steel">
        {score.categories.map((item) => (
          <li key={item.category} className="flex min-h-10 items-center justify-between gap-3 py-1.5">
            <span className="text-body-md text-ice-white">{CATEGORY_LABELS[item.category]}</span>
            {item.evaluated && item.grade !== null ? <span className="font-geist-mono text-body-md text-ice-white">{formatGrade(item.grade)}/10</span> : <Badge tone="neutral">Não avaliado</Badge>}
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
