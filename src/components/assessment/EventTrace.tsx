// Dependencies
import {ShieldAlert, ShieldCheck} from 'lucide-react';

// Shared
import {Accordion, Badge} from '../ui';

// Types
import type {AgentEvent} from '../../lib/assessmentTypes';

// Local
import {ACTION_LABELS, EVENT_KIND_LABELS, formatDateTime} from '../../lib/labels';

/** Show a raw event payload without breaking the layout. */
function Payload({label, value}: {label: string; value: unknown}) {
  if (value === null || value === undefined) return null;
  return (
    <details className="mt-2">
      <summary className="min-h-6 cursor-pointer text-body-sm text-electric-cyan">{label}</summary>
      <pre className="mt-1 max-h-64 overflow-auto rounded bg-surface-container-lowest p-2 font-geist-mono text-body-sm text-on-surface-variant">{JSON.stringify(value, null, 2)}</pre>
    </details>
  );
}

/** Show the history of the agent, collapsed by default, with its integrity verdict. */
export function EventTrace({events, historyIntact}: {events: AgentEvent[]; historyIntact: boolean}) {
  const Icon = historyIntact ? ShieldCheck : ShieldAlert;
  return (
    <div className="rounded-xl border border-steel bg-graphite p-4 sm:p-5">
      <Accordion title="Rastro da análise" summary={<Badge tone="neutral">{events.length} {events.length === 1 ? 'registro' : 'registros'}</Badge>}>
        <p className={`mb-3 flex items-start gap-2 text-body-md ${historyIntact ? 'text-signal-lime' : 'text-coral-red'}`}>
          <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          {historyIntact ? 'Histórico íntegro: nenhum registro foi alterado depois de gravado.' : 'Histórico com divergência: um ou mais registros podem ter sido alterados. Não confie neste relatório sem revisar.'}
        </p>
        {events.length === 0 ? <p className="text-body-md text-cool-gray">Ainda não há registros nesta avaliação.</p> : (
          <ol className="space-y-2">
            {events.map((event) => (
              <li key={event.hash} className="rounded-lg border border-steel bg-deep-petrol p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">Execução {event.run}</Badge>
                  <Badge tone="neutral">{EVENT_KIND_LABELS[event.kind] ?? event.kind}</Badge>
                  <span className="text-body-md font-medium text-ice-white">{ACTION_LABELS[event.name] ?? event.name}</span>
                </div>
                <p className="mt-1 break-all font-geist-mono text-body-sm text-cool-gray">{formatDateTime(event.createdAt)} · {event.hash.slice(0, 12)}</p>
                <Payload label="Ver entrada" value={event.input} />
                <Payload label="Ver saída" value={event.output} />
              </li>
            ))}
          </ol>
        )}
      </Accordion>
    </div>
  );
}
