// Dependencies
import {Check, Clock} from 'lucide-react';
import {useEffect, useState} from 'react';
import type {CSSProperties} from 'react';

// Shared
import {usePhotoUrl} from '../components/assessment/EvidenceGallery';
import {AppShell} from '../components/ui/AppShell';
import {BackLink, buttonPrimary, buttonSecondary, Notice, Skeleton} from '../components/ui';
import {MatrixLoader, SuccessCheck, useShown} from '../components/ui/motion';

// Types
import type {AssessmentDetail, AssessmentProgress, AssessmentStage, PhotoSummary} from '../lib/assessmentTypes';

// Local
import {ApiError, getAssessment, getProgress} from '../lib/api';
import {actionLabel, STAGES} from '../lib/labels';
import {Link, navigate, paths} from '../lib/router';

const DEFAULT_POLL_MS = 2000;
const MAX_POLL_FAILURES = 5;
const SLOW_AFTER_SECONDS = 45;
const VERY_SLOW_AFTER_SECONDS = 240;
const REPORT_DELAY_MS = 1400;
const TIP_INTERVAL_MS = 7000;
const MAX_THUMBNAILS = 6;
const TIPS = [
  'O Score Vencar vai de 0 a 100 e é provisório. Ele resume as evidências, não substitui uma vistoria.',
  'A IA separa o que viu nas fotos do que é hipótese. As hipóteses aparecem marcadas no relatório.',
  'Se a IA encontrar algo que não bate, ela pode fazer uma pergunta antes de concluir.',
  'Cada decisão do agente fica registrada em um histórico que mostra se algo foi alterado.',
];

/** Format elapsed seconds as minutes and seconds. */
function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes} min ${String(seconds % 60).padStart(2, '0')} s` : `${seconds} s`;
}

/** Show the four stages of a run as a vertical timeline. */
function StageTimeline({stage}: {stage: AssessmentStage}) {
  const current = STAGES.findIndex((item) => item.id === stage);
  return (
    <ol className="relative">
      {STAGES.map((item, index) => {
        const done = index < current || stage === 'finished';
        const active = index === current && !done;
        const last = index === STAGES.length - 1;
        return (
          <li key={item.id} aria-current={active ? 'step' : undefined} className="relative flex gap-3 pb-6 last:pb-0">
            {!last && (
              <span aria-hidden="true" className="absolute left-[13px] top-8 bottom-1 w-0.5 overflow-hidden rounded-full bg-steel">
                <span className="block h-full origin-top bg-signal-lime transition-transform duration-[var(--duration-very-slow)] ease-[var(--ease-smooth-out)]" style={{transform: `scaleY(${done ? 1 : 0})`}} />
              </span>
            )}
            <span aria-hidden="true" className={`relative flex size-7 shrink-0 items-center justify-center rounded-full text-label-md font-semibold transition-colors duration-[var(--duration-fast)] ${done ? 'bg-signal-lime text-asphalt-black' : active ? 'bg-electric-cyan text-asphalt-black' : 'border border-steel bg-graphite text-cool-gray'}`}>
              {active && <span className="absolute inset-0 rounded-full bg-electric-cyan/40 motion-safe:animate-ping" />}
              <span className="relative">{done ? <Check className="size-4" /> : index + 1}</span>
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={`text-body-md font-semibold ${done || active ? 'text-ice-white' : 'text-cool-gray'}`}>{item.label}</p>
              <p className="text-body-sm text-cool-gray">{item.hint}</p>
              <span className="sr-only">{done ? 'Etapa concluída' : active ? 'Etapa atual' : 'Etapa pendente'}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Show one photo of the run with a scan line while the AI examines it. */
function ScanningPhoto({assessmentId, photo, index, scanning}: {assessmentId: string; photo: PhotoSummary; index: number; scanning: boolean}) {
  const {url} = usePhotoUrl(assessmentId, photo.id);
  return (
    <li className="v-scan aspect-[4/3] overflow-hidden rounded-lg border border-steel bg-deep-petrol" data-active={scanning} style={{'--stagger-index': index} as CSSProperties}>
      {url ? <img src={url} alt={`Evidência ${photo.evidenceId}`} className="v-pop size-full object-cover" /> : <div className="t-skel-skeleton is-pulsing size-full"><div className="size-full bg-surface-container-high" /></div>}
    </li>
  );
}

/** Add one line to the activity log with a staggered entrance. */
function ActivityItem({label, current}: {label: string; current: boolean}) {
  const shown = useShown();
  return (
    <li className={`t-stagger ${shown ? 'is-shown' : ''}`}>
      <span className="t-stagger-line flex items-start gap-2 text-body-md">
        <span aria-hidden="true" className={`mt-1.5 size-2 shrink-0 rounded-full ${current ? 'bg-electric-cyan' : 'bg-signal-lime'}`} />
        <span className={current ? 'text-ice-white' : 'text-cool-gray'}>{label}</span>
      </span>
    </li>
  );
}

/** Rotate short explanations while the visitor waits. */
function TipCard() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % TIPS.length), TIP_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className="rounded-xl border border-steel bg-deep-petrol p-4">
      <p className="text-label-md font-medium text-electric-cyan">Enquanto isso</p>
      <Tip key={index} text={TIPS[index]} />
      <div aria-hidden="true" className="mt-3 flex gap-1.5">
        {TIPS.map((tip, dot) => <span key={tip} className={`h-1.5 rounded-full transition-[width,background-color] duration-[var(--duration-fast)] ease-[var(--ease-smooth-out)] ${dot === index ? 'w-4 bg-electric-cyan' : 'w-1.5 bg-steel'}`} />)}
      </div>
    </div>
  );
}

/** Reveal one tip with a soft rise. */
function Tip({text}: {text: string}) {
  const shown = useShown();
  return <p className={`t-stagger mt-2 min-h-[4.5rem] ${shown ? 'is-shown' : ''}`}><span className="t-stagger-line text-body-md text-on-surface-variant">{text}</span></p>;
}

/** Follow a run by polling its status until it finishes. */
export function ProgressPage({id}: {id: string}) {
  const [progress, setProgress] = useState<AssessmentProgress | null>(null);
  const [detail, setDetail] = useState<AssessmentDetail | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [activity, setActivity] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    document.title = 'Avaliação em andamento | Vencar';
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    const controller = new AbortController();
    getAssessment(id, controller.signal).then(setDetail).catch(() => undefined);
    return () => {
      window.clearInterval(timer);
      controller.abort();
    };
  }, [id]);
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
        const label = actionLabel(next.lastAction);
        if (next.lastAction) setActivity((current) => (current[current.length - 1] === label ? current : [...current, label]));
        if (next.isFinished) {
          if (next.status === 'completed') {
            setReady(true);
            timer = window.setTimeout(() => navigate(paths.report(id), {replace: true}), REPORT_DELAY_MS);
          } else if (next.status !== 'failed') navigate(paths.report(id), {replace: true});
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
  const working = !failed && !fatalError && !ready;
  const action = actionLabel(progress?.lastAction);
  const vehicleName = detail ? [detail.vehicle.make, detail.vehicle.model, detail.vehicle.year].filter(Boolean).join(' ') : '';
  const photos = (detail?.photos ?? []).slice(0, MAX_THUMBNAILS);
  const scanning = progress?.stage === 'analyzing';
  const title = ready ? 'Relatório pronto' : failed ? 'A análise não foi concluída' : fatalError ? 'Andamento indisponível' : 'Analisando o carro';
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 lg:py-8">
        <div>
          <BackLink href={paths.newAssessment} label="Voltar para nova avaliação" />
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              {vehicleName && <p className="text-label-md font-medium text-electric-cyan">{vehicleName}</p>}
              <h1 className="mt-1 text-headline-lg-mobile font-bold text-ice-white sm:text-headline-md">{title}</h1>
            </div>
            {working && <p className="inline-flex items-center gap-1.5 rounded-full border border-steel bg-deep-petrol px-3 py-1 font-geist-mono text-body-sm text-cool-gray"><Clock aria-hidden="true" className="size-3.5" />{formatElapsed(elapsed)}</p>}
          </div>
          {working && <p className="mt-2 text-body-lg text-cool-gray">Costuma levar menos de um minuto. Você pode sair e voltar pelo mesmo link: o relatório abre sozinho quando ficar pronto.</p>}
        </div>
        {ready && (
          <div role="status" className="v-pop flex items-center gap-4 rounded-xl border border-signal-lime/40 bg-signal-lime/10 p-4 sm:p-5">
            <SuccessCheck className="size-12 shrink-0 text-signal-lime" />
            <div>
              <p className="text-body-lg font-semibold text-ice-white">Análise concluída</p>
              <p className="text-body-md text-on-surface-variant">Abrindo o relatório…</p>
            </div>
          </div>
        )}
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
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5 rounded-xl border border-steel bg-graphite p-4 sm:p-6">
              {working && (
                <div className="flex items-center gap-3 rounded-lg border border-electric-cyan/30 bg-electric-cyan/5 px-4 py-3">
                  <MatrixLoader variant={scanning ? 'scan' : 'orbit'} />
                  <p aria-hidden="true" className="min-w-0 text-body-lg font-medium"><span key={action} className="t-shimmer" data-text={action}>{action}</span></p>
                  <p role="status" className="sr-only">{action}</p>
                </div>
              )}
              {photos.length > 0 && (
                <div>
                  <p className="text-label-md font-medium text-on-surface-variant">{scanning ? 'Examinando as fotos' : 'Fotos enviadas'}</p>
                  <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6">
                    {photos.map((photo, index) => <ScanningPhoto key={photo.id} assessmentId={id} photo={photo} index={index} scanning={scanning && working} />)}
                  </ul>
                </div>
              )}
              {activity.length > 0 && (
                <div>
                  <p className="text-label-md font-medium text-on-surface-variant">O que o agente já fez</p>
                  <ol className="mt-2 space-y-2">
                    {activity.map((label, index) => <ActivityItem key={`${label}-${index}`} label={label} current={working && index === activity.length - 1} />)}
                  </ol>
                </div>
              )}
            </div>
            <aside className="space-y-4">
              <div className="rounded-xl border border-steel bg-graphite p-4 sm:p-5">
                <StageTimeline stage={progress.stage} />
              </div>
              {working && <TipCard />}
            </aside>
          </div>
        )}
        {reconnecting && !fatalError && <Notice tone="warning" role="status" title="Conexão instável">Estamos tentando falar com o servidor de novo. A análise continua mesmo assim.</Notice>}
        {working && elapsed >= VERY_SLOW_AFTER_SECONDS && <Notice tone="warning" title="Está demorando mais que o normal">Seguimos acompanhando. Se passar de 10 minutos, tente abrir este link mais tarde ou começar uma nova avaliação.</Notice>}
        {working && elapsed >= SLOW_AFTER_SECONDS && elapsed < VERY_SLOW_AFTER_SECONDS && <Notice tone="info" title="Ainda trabalhando">Avaliações com várias fotos podem levar alguns minutos.</Notice>}
      </div>
    </AppShell>
  );
}
