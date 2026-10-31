// Dependencies
import {Check} from 'lucide-react';
import {useEffect, useState} from 'react';

// Shared
import {AppShell} from '../components/ui/AppShell';
import {BackLink, buttonPrimary, buttonSecondary, Notice, Skeleton} from '../components/ui';

// Types
import type {AssessmentProgress, AssessmentStage} from '../lib/assessmentTypes';

// Local
import {ApiError, getProgress} from '../lib/api';
import {actionLabel, STAGES} from '../lib/labels';
import {Link, navigate, paths} from '../lib/router';

const DEFAULT_POLL_MS = 2000;
const MAX_POLL_FAILURES = 5;
const SLOW_AFTER_SECONDS = 45;
const VERY_SLOW_AFTER_SECONDS = 240;

/** Format elapsed seconds as minutes and seconds. */
function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes} min ${String(seconds % 60).padStart(2, '0')} s` : `${seconds} s`;
}

/** Show the four stages of a run, with the current one marked. */
function StageList({stage}: {stage: AssessmentStage}) {
  const current = STAGES.findIndex((item) => item.id === stage);
  return (
    <ol className="grid gap-3 sm:grid-cols-4">
      {STAGES.map((item, index) => {
        const done = index < current || stage === 'finished';
        const active = index === current && !done;
        return (
          <li key={item.id} aria-current={active ? 'step' : undefined} className={`t-press rounded-xl border p-3 ${active ? 'border-electric-cyan bg-electric-cyan/10' : 'border-steel bg-deep-petrol'}`}>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className={`flex size-6 shrink-0 items-center justify-center rounded-full text-label-md font-semibold ${done ? 'bg-signal-lime text-asphalt-black' : active ? 'bg-electric-cyan text-asphalt-black' : 'bg-surface-container-high text-on-surface-variant'}`}>
                {done ? <Check className="size-4" /> : index + 1}
              </span>
              <span className={`text-body-md font-semibold ${done || active ? 'text-ice-white' : 'text-cool-gray'}`}>{item.label}</span>
            </div>
            <p className="mt-1 text-body-sm text-cool-gray">{item.hint}</p>
            <span className="sr-only">{done ? 'Etapa concluída' : active ? 'Etapa atual' : 'Etapa pendente'}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** Follow a run by polling its status until it finishes. */
export function ProgressPage({id}: {id: string}) {
  const [progress, setProgress] = useState<AssessmentProgress | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    document.title = 'Avaliação em andamento | Vencar';
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    let timer: number;
    let failures = 0;
    /** Ask for the status and schedule the next call only after this one ends. */
    const poll = async () => {
      try {
        const next = await getProgress(id, controller.signal);
        failures = 0;
        setReconnecting(false);
        setProgress(next);
        if (next.isFinished) {
          if (next.status !== 'failed') navigate(paths.report(id), {replace: true});
          return;
        }
        timer = window.setTimeout(poll, next.pollAfterMs ?? DEFAULT_POLL_MS);
      } catch (error) {
        if (controller.signal.aborted) return;
        failures += 1;
        const transient = error instanceof ApiError && error.isTransient;
        if (!transient || failures >= MAX_POLL_FAILURES) {
          setFatalError(error instanceof ApiError ? error.message : 'Não foi possível acompanhar a avaliação.');
          return;
        }
        setReconnecting(true);
        timer = window.setTimeout(poll, DEFAULT_POLL_MS * 2 ** failures);
      }
    };
    poll();
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [id, attempt]);
  /** Restart polling after a failure the user chose to retry. */
  const retry = () => {
    setFatalError(null);
    setReconnecting(false);
    setAttempt((value) => value + 1);
  };
  const failed = progress?.status === 'failed';
  const action = actionLabel(progress?.lastAction);
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 lg:py-8">
        <div>
          <BackLink href={paths.newAssessment} label="Voltar para nova avaliação" />
          <h1 className="mt-2 text-headline-lg-mobile font-bold text-ice-white sm:text-headline-md">{failed ? 'A análise não foi concluída' : fatalError ? 'Andamento indisponível' : 'Analisando o carro'}</h1>
          {!failed && !fatalError && <p className="mt-2 text-body-lg text-cool-gray">Você pode ficar nesta página ou voltar depois pelo mesmo link. O relatório abre sozinho quando ficar pronto.</p>}
        </div>
        {fatalError && (
          <Notice tone="danger" role="alert" title="Não conseguimos acompanhar a avaliação">
            <p>{fatalError}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={retry} className={buttonPrimary}>Tentar de novo</button>
              <Link href={paths.newAssessment} className={buttonSecondary}>Começar nova avaliação</Link>
            </div>
          </Notice>
        )}
        {failed && (
          <Notice tone="danger" role="alert" title="Algo interrompeu a análise e o relatório não foi gerado">
            <p>Isso não diz nada sobre o estado do carro. Você pode começar uma nova avaliação com os mesmos dados.</p>
            {progress?.error && <p className="mt-2 break-words text-body-sm text-cool-gray">Detalhe técnico: {progress.error}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={paths.newAssessment} className={buttonPrimary}>Começar nova avaliação</Link>
              <Link href={paths.report(id)} className={buttonSecondary}>Ver o que foi registrado</Link>
            </div>
          </Notice>
        )}
        {!progress && !fatalError && (
          <div className="rounded-xl border border-steel bg-graphite p-6">
            <p role="status" className="sr-only">Carregando o andamento</p>
            <Skeleton />
          </div>
        )}
        {progress && !fatalError && (
          <div className="space-y-6 rounded-xl border border-steel bg-graphite p-4 sm:p-6">
            <StageList stage={progress.stage} />
            {!failed && (
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-steel pt-4">
                <p aria-hidden="true" className="text-body-lg font-medium"><span key={action} className="t-shimmer" data-text={action}>{action}</span></p>
                <p role="status" className="sr-only">{action}</p>
                <p className="font-geist-mono text-body-sm text-cool-gray">Aguardando há {formatElapsed(elapsed)}</p>
              </div>
            )}
          </div>
        )}
        {reconnecting && !fatalError && <Notice tone="warning" role="status" title="Conexão instável">Estamos tentando falar com o servidor de novo. A análise continua mesmo assim.</Notice>}
        {!failed && !fatalError && elapsed >= VERY_SLOW_AFTER_SECONDS && <Notice tone="warning" title="Está demorando mais que o normal">Seguimos acompanhando. Se passar de 10 minutos, tente abrir este link mais tarde ou começar uma nova avaliação.</Notice>}
        {!failed && !fatalError && elapsed >= SLOW_AFTER_SECONDS && elapsed < VERY_SLOW_AFTER_SECONDS && <Notice tone="info" title="Ainda trabalhando">Avaliações com várias fotos podem levar alguns minutos.</Notice>}
      </div>
    </AppShell>
  );
}
