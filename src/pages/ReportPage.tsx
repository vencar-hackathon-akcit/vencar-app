// Dependencies
import {Lightbulb, UserCheck} from 'lucide-react';
import {useEffect, useState} from 'react';

// Shared
import {AnswerForm} from '../components/assessment/AnswerForm';
import {EventTrace} from '../components/assessment/EventTrace';
import {EvidenceGallery} from '../components/assessment/EvidenceGallery';
import {ScoreCard} from '../components/assessment/ScoreCard';
import {AppShell} from '../components/ui/AppShell';
import {BackLink, Badge, buttonPrimary, buttonSecondary, Notice, Section, Skeleton} from '../components/ui';

// Types
import type {AssessmentDetail, AssessmentStatus, Confidence, Damage, Dossier, Severity} from '../lib/assessmentTypes';

// Local
import {ApiError, getAssessment} from '../lib/api';
import {CATEGORY_LABELS, CONFIDENCE_LABELS, formatDateTime, humanizeField, SEVERITY_LABELS, STATUS_LABELS} from '../lib/labels';
import {Link, navigate, paths} from '../lib/router';

const STATUS_TONES: Record<AssessmentStatus, 'info' | 'success' | 'warning' | 'danger'> = {processing: 'info', completed: 'success', needs_input: 'warning', inconclusive: 'warning', failed: 'danger'};
const SEVERITY_TONES: Record<Severity, 'warning' | 'danger' | 'neutral'> = {minor: 'neutral', moderate: 'warning', severe: 'danger'};
const CONFIDENCE_ORDER: Confidence[] = ['high', 'medium', 'low'];
const DEFAULT_HUMAN_REASON = 'Este relatório foi gerado com apoio de IA e não substitui a vistoria de um profissional.';

/** Link an evidence id to its photo when there is one. */
function EvidenceChip({id, photoIds}: {id: string; photoIds: Set<string>}) {
  const classes = 'inline-flex min-h-6 items-center rounded border border-steel px-1.5 font-geist-mono text-body-sm';
  if (photoIds.has(id)) return <a href={`#evidencia-${id}`} aria-label={`Ver evidência ${id}`} className={`${classes} text-electric-cyan underline underline-offset-2`}>{id}</a>;
  return <span className={`${classes} text-cool-gray`}>{id}</span>;
}

/** Show a plain list, or nothing when it is empty. */
function PlainList({items}: {items: string[]}) {
  return <ul className="list-disc space-y-1.5 pl-5 text-body-md text-on-surface-variant">{items.map((item) => <li key={item}>{humanizeField(item)}</li>)}</ul>;
}

/** Show one damage that was observed in the evidence. */
function DamageItem({damage, photoIds}: {damage: Damage; photoIds: Set<string>}) {
  return (
    <li className="rounded-lg border border-steel bg-deep-petrol p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-body-md font-semibold text-ice-white">{damage.damageType}, {damage.location}</h3>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge tone={SEVERITY_TONES[damage.severity]}>Severidade {SEVERITY_LABELS[damage.severity].toLowerCase()}</Badge>
        <Badge tone="neutral">{CATEGORY_LABELS[damage.category]}</Badge>
        <Badge tone="neutral">{CONFIDENCE_LABELS[damage.confidence]}</Badge>
        <EvidenceChip id={damage.evidenceId} photoIds={photoIds} />
      </div>
      {damage.observation && <p className="mt-2 text-body-md text-on-surface-variant">{damage.observation}</p>}
    </li>
  );
}

/** Show the state of the assessment in words the user can act on. */
function StatusNotice({detail, dossier}: {detail: AssessmentDetail; dossier?: Dossier | null}) {
  const reason = dossier?.statusReason;
  if (detail.status === 'completed') return null;
  if (detail.status === 'needs_input') return <Notice tone="warning" title="Precisamos de mais informações para continuar">{reason}</Notice>;
  if (detail.status === 'inconclusive') return <Notice tone="warning" title="Não foi possível chegar a uma conclusão">{reason ?? 'As evidências não foram suficientes. Isso não significa que o carro esteja bem ou mal.'}</Notice>;
  if (detail.status === 'failed') {
    return (
      <Notice tone="danger" role="alert" title="A análise foi interrompida e o relatório não foi gerado">
        <p>Isso não diz nada sobre o estado do carro.</p>
        {detail.error && <p className="mt-2 break-words text-body-sm text-cool-gray">Detalhe técnico: {detail.error}</p>}
      </Notice>
    );
  }
  return null;
}

/** Show everything the dossier contains, keeping observations and hypotheses apart. */
function DossierSections({detail, dossier}: {detail: AssessmentDetail; dossier: Dossier}) {
  const photoIds = new Set(detail.photos.map((photo) => photo.evidenceId));
  const damages = dossier.damages ?? [];
  const hypotheses = [...(dossier.hypotheses ?? [])].sort((a, b) => CONFIDENCE_ORDER.indexOf(a.confidence) - CONFIDENCE_ORDER.indexOf(b.confidence));
  const analyzed = detail.status === 'completed' || damages.length > 0 || hypotheses.length > 0;
  const textEvidence = (dossier.evidence ?? []).filter((item) => !photoIds.has(item.id) && item.content && item.content !== detail.description);
  const notes = [
    {title: 'Informações pendentes', items: dossier.pendingInformation ?? []},
    {title: 'Limitações', items: dossier.limitations ?? []},
    {title: 'Alertas', items: dossier.warnings ?? []},
  ].filter((note) => note.items.length);
  return (
    <>
      {analyzed && <><Section title="Avarias observadas" description="O que as evidências mostram.">
        {damages.length ? <ul className="grid gap-3 md:grid-cols-2">{damages.map((damage, index) => <DamageItem key={`${damage.evidenceId}-${index}`} damage={damage} photoIds={photoIds} />)}</ul> : <p className="text-body-md text-cool-gray">Nenhuma avaria foi observada nas evidências enviadas. Isso não garante que o carro não tenha avarias.</p>}
      </Section>
      <section aria-labelledby="hipoteses" className="rounded-xl border-2 border-dashed border-warm-amber/50 bg-graphite p-4 sm:p-5">
        <h2 id="hipoteses" className="flex items-center gap-2 text-headline-sm font-semibold text-ice-white"><Lightbulb aria-hidden="true" className="size-5 text-warm-amber" />Hipóteses da IA</h2>
        <p className="mt-1 text-body-md text-on-surface-variant">Possibilidades levantadas pela IA. Não são diagnóstico nem fato observado, e precisam ser confirmadas por um profissional.</p>
        {hypotheses.length ? (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {hypotheses.map((item) => (
              <li key={item.description} className="rounded-lg border border-dashed border-steel p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="warning">Hipótese</Badge>
                  <Badge tone="neutral">{CONFIDENCE_LABELS[item.confidence]}</Badge>
                  {item.evidenceIds.map((id) => <EvidenceChip key={id} id={id} photoIds={photoIds} />)}
                </div>
                <p className="mt-2 text-body-md text-ice-white">{item.description}</p>
                {item.whatWouldConfirm && <p className="mt-2 text-body-md text-on-surface-variant"><span className="font-semibold">Como confirmar:</span> {item.whatWouldConfirm}</p>}
              </li>
            ))}
          </ul>
        ) : <p className="mt-4 text-body-md text-cool-gray">A IA não levantou hipóteses nesta avaliação.</p>}
      </section></>}
      {!!dossier.conflicts?.length && (
        <Section title="Conflitos entre evidências" description="Pontos em que as informações não batem. Vale conferir pessoalmente.">
          <ul className="grid gap-3 md:grid-cols-2">
            {dossier.conflicts.map((conflict) => (
              <li key={conflict.description} className="rounded-lg border border-steel bg-deep-petrol p-4">
                <p className="text-body-md text-ice-white">{conflict.description}</p>
                <div className="mt-2 flex flex-wrap gap-2">{conflict.evidenceIds.map((id) => <EvidenceChip key={id} id={id} photoIds={photoIds} />)}</div>
              </li>
            ))}
          </ul>
        </Section>
      )}
      {notes.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {notes.map((note) => <Section key={note.title} title={note.title}><PlainList items={note.items} /></Section>)}
        </div>
      )}
      {textEvidence.length > 0 && (
        <Section title="Outras evidências" description="Informações em texto usadas na análise.">
          <ul className="space-y-2">
            {textEvidence.map((item) => <li key={item.id} className="text-body-md text-on-surface-variant"><span className="mr-2 font-geist-mono text-body-sm text-ice-white">{item.id}</span>{item.content}</li>)}
          </ul>
        </Section>
      )}
    </>
  );
}

/** Show the vehicle data as a compact list. */
function VehicleFacts({detail}: {detail: AssessmentDetail}) {
  const {vehicle} = detail;
  const facts = [['Marca', vehicle.make], ['Modelo', vehicle.model], ['Ano', vehicle.year], ['Placa', vehicle.plate], ['Quilometragem', vehicle.mileage && `${vehicle.mileage} km`], ['Região', vehicle.region], ['Uso', vehicle.usage]];
  return (
    <>
      <dl className="grid grid-cols-2 gap-3">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="text-body-sm text-cool-gray">{label}</dt>
            <dd className="mt-0.5 break-words text-body-md font-medium text-ice-white">{value || 'Não informado'}</dd>
          </div>
        ))}
      </dl>
      {detail.description && <p className="mt-4 border-t border-steel pt-4 text-body-md text-on-surface-variant"><span className="font-semibold">Descrição enviada:</span> {detail.description}</p>}
    </>
  );
}

/** Load and show an assessment report in any of its states. */
export function ReportPage({id}: {id: string}) {
  const [detail, setDetail] = useState<AssessmentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    document.title = 'Relatório | Vencar';
    const controller = new AbortController();
    setError(null);
    getAssessment(id, controller.signal)
      .then((next) => {
        if (next.status === 'processing') {
          navigate(paths.progress(id), {replace: true});
          return;
        }
        setDetail(next);
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(reason instanceof ApiError ? reason.message : 'Não foi possível carregar o relatório.');
      });
    return () => controller.abort();
  }, [id, attempt]);
  const dossier = detail?.dossier;
  const vehicleName = detail ? [detail.vehicle.make, detail.vehicle.model, detail.vehicle.year].filter(Boolean).join(' ') : '';
  return (
    <AppShell>
      <div className="mx-auto max-w-[1240px] space-y-6 px-4 py-6 lg:px-6 lg:py-8">
        <BackLink href={paths.newAssessment} label="Voltar para nova avaliação" />
        {error && (
          <>
            <h1 className="text-headline-lg-mobile font-bold text-ice-white sm:text-headline-md">Relatório indisponível</h1>
            <Notice tone="danger" role="alert" title="Não conseguimos abrir o relatório">
              <p>{error}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setAttempt((value) => value + 1)} className={buttonPrimary}>Tentar de novo</button>
                <Link href={paths.newAssessment} className={buttonSecondary}>Começar nova avaliação</Link>
              </div>
            </Notice>
          </>
        )}
        {!detail && !error && (
          <div className="space-y-6">
            <p role="status" className="text-body-md text-cool-gray">Carregando o relatório</p>
            {[0, 1, 2].map((item) => <div key={item} className="rounded-xl border border-steel bg-graphite p-6"><Skeleton lines={4} /></div>)}
          </div>
        )}
        {detail && (
          <>
            <div>
              <p className="text-label-md font-medium text-electric-cyan">Dossiê técnico</p>
              <h1 className="mt-1 text-headline-lg-mobile font-bold text-ice-white sm:text-headline-md">{vehicleName || 'Veículo sem identificação'}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone={STATUS_TONES[detail.status]}>{STATUS_LABELS[detail.status]}</Badge>
                <span className="text-body-sm text-cool-gray">Atualizado em {formatDateTime(detail.updatedAt)}</span>
              </div>
            </div>
            <StatusNotice detail={detail} dossier={dossier} />
            {dossier && (
            <div className="flex gap-3 rounded-xl border border-electric-cyan/40 bg-electric-cyan/10 p-4">
              <UserCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-electric-cyan" />
              <div>
                <p className="text-body-md font-semibold text-ice-white">Precisa de validação humana</p>
                <p className="text-body-md text-on-surface-variant">{dossier?.humanValidationReason || DEFAULT_HUMAN_REASON}</p>
              </div>
            </div>
            )}
            <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
              <aside className="space-y-6 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
                <Section title="Score Vencar">
                  {dossier?.score ? <ScoreCard score={dossier.score} /> : <p className="text-body-md text-cool-gray">Sem score nesta avaliação. O Score Vencar só aparece quando a análise é concluída.</p>}
                </Section>
                <Section title="Veículo"><VehicleFacts detail={detail} /></Section>
              </aside>
              <div className="min-w-0 space-y-6">
                {detail.status === 'needs_input' && (
                  <Section title="O que precisamos saber" id="responder">
                    {!!dossier?.questions?.length && <div className="mb-5"><PlainList items={dossier.questions} /></div>}
                    <AnswerForm assessmentId={id} vehicle={detail.vehicle} photoCount={detail.photos.length} />
                  </Section>
                )}
                {(dossier?.summary || dossier?.recommendation) && (
                  <Section title="Resumo da IA">
                    {dossier.summary && <p className="text-body-md text-on-surface-variant">{dossier.summary}</p>}
                    {dossier.recommendation && <p className="mt-3 text-body-md text-on-surface-variant"><span className="font-semibold text-ice-white">Recomendação:</span> {dossier.recommendation}</p>}
                  </Section>
                )}
                <Section title="Fotos e evidências" description={detail.photos.length ? 'Toque em uma foto para ampliar.' : undefined}>
                  <EvidenceGallery assessmentId={id} photos={detail.photos} assessments={dossier?.photoAssessments ?? []} />
                </Section>
                {dossier ? <DossierSections detail={detail} dossier={dossier} /> : <Section title="Conteúdo do relatório"><p className="text-body-md text-cool-gray">Esta avaliação não gerou conteúdo de relatório. Você pode começar uma nova com os mesmos dados.</p></Section>}
                <EventTrace events={detail.events} historyIntact={detail.historyIntact} />
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
