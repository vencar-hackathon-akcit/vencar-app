// Dependencies
import {AlertTriangle, ArrowLeft, ArrowRight, Check, Loader2, Pencil} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import type {FormEvent} from 'react';

// Shared
import {AppShell} from '../components/ui/AppShell';
import {BackLink, buttonPrimary, buttonSecondary, Notice, SelectField, TextAreaField, TextField} from '../components/ui';
import {PhotoPicker} from '../components/assessment/PhotoPicker';

// Local
import {ApiError, createAssessment} from '../lib/api';
import {takeAssessmentDraft} from '../lib/assessmentDraft';
import {MAX_PHOTOS} from '../lib/config';
import {navigate, paths} from '../lib/router';
import {requireText, validateMileage, validatePlate, validateYear} from '../lib/validation';

type FieldName = 'make' | 'model' | 'year' | 'plate' | 'mileage' | 'region' | 'usage' | 'description';
type Errors = Partial<Record<FieldName | 'photos', string | null>>;
const EMPTY: Record<FieldName, string> = {make: '', model: '', year: '', plate: '', mileage: '', region: '', usage: '', description: ''};
const USAGE_OPTIONS = ['Particular', 'Aplicativo ou táxi', 'Frota ou locadora', 'Comercial ou carga', 'Não sei informar'];
const VEHICLE_FIELDS: FieldName[] = ['make', 'model', 'year', 'plate', 'mileage'];
const RECOMMENDED_PHOTOS = 4;
const STEPS = [
  {title: 'Veículo', description: 'Os dados que identificam o carro.'},
  {title: 'Fotos', description: 'As evidências que a IA vai examinar.'},
  {title: 'Revisão', description: 'Confira tudo e conte o que você sabe.'},
];

/** Check one field and return its error message. */
function validateField(name: FieldName, value: string): string | null {
  if (name === 'make') return requireText(value, 'Informe a marca do carro.');
  if (name === 'model') return requireText(value, 'Informe o modelo do carro.');
  if (name === 'year') return validateYear(value);
  if (name === 'plate') return validatePlate(value);
  if (name === 'mileage') return value.trim() ? validateMileage(value) : null;
  return null;
}

/** Show where the visitor is in the three steps, letting them go back to finished ones. */
function Stepper({step, onSelect}: {step: number; onSelect: (index: number) => void}) {
  return (
    <nav aria-label="Etapas da avaliação" className="space-y-3">
      <ol className="grid grid-cols-3 gap-2">
        {STEPS.map((item, index) => {
          const done = index < step;
          const current = index === step;
          return (
            <li key={item.title}>
              <button type="button" disabled={!done} onClick={() => onSelect(index)} aria-current={current ? 'step' : undefined} className={`t-press flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left ${done ? 'cursor-pointer hover:bg-surface-container-high' : 'cursor-default'}`}>
                <span aria-hidden="true" className={`flex size-7 shrink-0 items-center justify-center rounded-full text-label-md font-semibold transition-colors duration-[var(--duration-fast)] ${done ? 'bg-signal-lime text-asphalt-black' : current ? 'bg-electric-cyan text-asphalt-black' : 'border border-steel text-cool-gray'}`}>
                  {done ? <Check className="size-4" /> : index + 1}
                </span>
                <span className={`truncate text-body-md font-semibold ${current || done ? 'text-ice-white' : 'text-cool-gray'}`}>{item.title}</span>
                <span className="sr-only">{done ? ', concluída' : current ? ', etapa atual' : ', pendente'}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <div aria-hidden="true" className="h-1 overflow-hidden rounded-full bg-surface-container-high">
        <div className="h-full origin-left rounded-full bg-electric-cyan transition-transform duration-[var(--duration-slow)] ease-[var(--ease-smooth-out)]" style={{transform: `scaleX(${(step + 1) / STEPS.length})`}} />
      </div>
    </nav>
  );
}

/** Show one answer of the review step with a way back to change it. */
function ReviewRow({label, value, onEdit}: {label: string; value: string; onEdit: () => void}) {
  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0">
        <dt className="text-body-sm text-cool-gray">{label}</dt>
        <dd className="mt-0.5 break-words text-body-md font-medium text-ice-white">{value || 'Não informado'}</dd>
      </div>
      <button type="button" onClick={onEdit} aria-label={`Editar ${label.toLowerCase()}`} className="t-press flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-cool-gray hover:bg-surface-container-high hover:text-ice-white">
        <Pencil aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}

/** Collect the vehicle data and photos that open an assessment, one step at a time. */
export function NewAssessmentPage() {
  const [values, setValues] = useState(() => ({...EMPTY, ...takeAssessmentDraft()}));
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState(0);
  const [fewPhotosWarned, setFewPhotosWarned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const headings = useRef<(HTMLHeadingElement | null)[]>([]);
  const firstRender = useRef(true);
  useEffect(() => {
    document.title = 'Nova avaliação | Vencar';
  }, []);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headings.current[step]?.focus({preventScroll: true});
    window.scrollTo({top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  }, [step]);
  /** Build the props shared by every text control. */
  const bind = (name: FieldName) => ({
    id: name,
    value: values[name],
    error: errors[name],
    onChange: (event: {target: {value: string}}) => {
      const value = name === 'plate' ? event.target.value.toUpperCase() : event.target.value;
      setValues((current) => ({...current, [name]: value}));
      if (errors[name]) setErrors((current) => ({...current, [name]: validateField(name, value)}));
    },
    onBlur: () => setErrors((current) => ({...current, [name]: validateField(name, values[name])})),
  });
  /** Validate the vehicle fields and focus the first one that is wrong. */
  const checkVehicle = (): boolean => {
    const next: Errors = {};
    VEHICLE_FIELDS.forEach((name) => {
      next[name] = validateField(name, values[name]);
    });
    setErrors((current) => ({...current, ...next}));
    const firstInvalid = VEHICLE_FIELDS.find((name) => next[name]);
    if (firstInvalid) window.setTimeout(() => document.getElementById(firstInvalid)?.focus(), 0);
    return !firstInvalid;
  };
  /** Require a photo, and nudge once when there are fewer than recommended. */
  const checkPhotos = (): boolean => {
    if (!photos.length) {
      setErrors((current) => ({...current, photos: 'Adicione pelo menos uma foto do carro.'}));
      return false;
    }
    if (photos.length < RECOMMENDED_PHOTOS && !fewPhotosWarned) {
      setFewPhotosWarned(true);
      return false;
    }
    return true;
  };
  /** Move forward when the current step is complete. */
  const goNext = () => {
    if (step === 0 && !checkVehicle()) return;
    if (step === 1 && !checkPhotos()) return;
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };
  /** Validate everything and send the form as multipart. */
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (step < STEPS.length - 1) {
      goNext();
      return;
    }
    if (!checkVehicle()) {
      setStep(0);
      return;
    }
    if (!photos.length) {
      setStep(1);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const form = new FormData();
    (Object.keys(values) as FieldName[]).forEach((name) => form.append(name, values[name].trim()));
    photos.forEach((photo) => form.append('photos', photo));
    try {
      const {id} = await createAssessment(form);
      navigate(paths.progress(id));
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : 'Não foi possível enviar a avaliação. Tente de novo.');
      setSubmitting(false);
    }
  };
  const vehicleName = [values.make, values.model, values.year].filter((item) => item.trim()).join(' ');
  const position = (index: number) => (index === step ? 'current' : index < step ? 'prev' : 'next');
  return (
    <AppShell hideNewAction>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 lg:py-8">
        <div>
          <BackLink href={paths.home} label="Voltar para o início" />
          <h1 className="mt-2 text-headline-lg-mobile font-bold text-ice-white sm:text-headline-md">Nova avaliação</h1>
          <p className="mt-2 text-body-md text-cool-gray">Três passos rápidos. A análise começa assim que você enviar.</p>
        </div>
        <Stepper step={step} onSelect={setStep} />
        <form noValidate onSubmit={handleSubmit} className="space-y-6">
          <div className="t-page-slide">
            <section data-pos={position(0)} inert={step !== 0} aria-labelledby="etapa-veiculo" className="t-page rounded-xl border border-steel bg-graphite p-4 sm:p-6">
              <p className="text-label-md font-medium text-electric-cyan">Etapa 1 de 3</p>
              <h2 id="etapa-veiculo" ref={(element) => { headings.current[0] = element; }} tabIndex={-1} className="mt-1 text-headline-sm font-semibold text-ice-white focus-visible:outline-none">{STEPS[0].description}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-6">
                <div className="sm:col-span-3"><TextField label="Marca" placeholder="Ex.: Jeep" autoComplete="off" {...bind('make')} /></div>
                <div className="sm:col-span-3"><TextField label="Modelo" placeholder="Ex.: Renegade Sport" autoComplete="off" {...bind('model')} /></div>
                <div className="sm:col-span-2"><TextField label="Ano" placeholder="Ex.: 2022" inputMode="numeric" maxLength={4} autoComplete="off" {...bind('year')} /></div>
                <div className="sm:col-span-2"><TextField label="Placa" placeholder="Ex.: ABC1D23" maxLength={8} autoComplete="off" autoCapitalize="characters" {...bind('plate')} /></div>
                <div className="sm:col-span-2"><TextField label="Quilometragem" optional placeholder="Ex.: 38450" inputMode="numeric" autoComplete="off" {...bind('mileage')} /></div>
                <div className="sm:col-span-3"><TextField label="Região" optional placeholder="Ex.: São Paulo, SP" autoComplete="off" {...bind('region')} /></div>
                <div className="sm:col-span-3">
                  <SelectField label="Uso" optional {...bind('usage')}>
                    <option value="">Selecione</option>
                    {USAGE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </SelectField>
                </div>
              </div>
            </section>
            <section data-pos={position(1)} inert={step !== 1} aria-labelledby="etapa-fotos" className="t-page rounded-xl border border-steel bg-graphite p-4 sm:p-6">
              <p className="text-label-md font-medium text-electric-cyan">Etapa 2 de 3</p>
              <h2 id="etapa-fotos" ref={(element) => { headings.current[1] = element; }} tabIndex={-1} className="mt-1 text-headline-sm font-semibold text-ice-white focus-visible:outline-none">{STEPS[1].description}</h2>
              <p className="mt-1 text-body-md text-cool-gray">Fotos nítidas de vários ângulos deixam a análise mais completa.</p>
              <div className="mt-5">
                <PhotoPicker guided hideLabel label="Fotos do carro" hint={`Até ${MAX_PHOTOS} fotos em JPG, PNG ou WebP, com até 15 MB cada.`} files={photos} max={MAX_PHOTOS} error={errors.photos} onChange={(files) => { setPhotos(files); setErrors((current) => ({...current, photos: null})); }} />
              </div>
              {fewPhotosWarned && photos.length > 0 && photos.length < RECOMMENDED_PHOTOS && (
                <div className="v-pop mt-4">
                  <Notice tone="warning" role="status" title={`Você enviou ${photos.length} ${photos.length === 1 ? 'foto' : 'fotos'}. Recomendamos pelo menos ${RECOMMENDED_PHOTOS}.`}>
                    Com poucos ângulos, partes do carro ficam sem avaliação e o score cobre menos. Você pode adicionar mais fotos ou continuar assim.
                  </Notice>
                </div>
              )}
            </section>
            <section data-pos={position(2)} inert={step !== 2} aria-labelledby="etapa-revisao" className="t-page space-y-5 rounded-xl border border-steel bg-graphite p-4 sm:p-6">
              <div>
                <p className="text-label-md font-medium text-electric-cyan">Etapa 3 de 3</p>
                <h2 id="etapa-revisao" ref={(element) => { headings.current[2] = element; }} tabIndex={-1} className="mt-1 text-headline-sm font-semibold text-ice-white focus-visible:outline-none">{STEPS[2].description}</h2>
              </div>
              <dl className="divide-y divide-steel rounded-lg border border-steel bg-deep-petrol px-4">
                <ReviewRow label="Veículo" value={vehicleName} onEdit={() => setStep(0)} />
                <ReviewRow label="Placa" value={values.plate} onEdit={() => setStep(0)} />
                <ReviewRow label="Quilometragem, região e uso" value={[values.mileage && `${values.mileage} km`, values.region, values.usage].filter(Boolean).join(' · ')} onEdit={() => setStep(0)} />
                <ReviewRow label="Fotos" value={`${photos.length} de ${MAX_PHOTOS}`} onEdit={() => setStep(1)} />
              </dl>
              <TextAreaField optional label="Conte o que você sabe sobre o carro" hint="Batidas, reparos, ruídos ou manutenções ajudam a IA a cruzar as evidências." placeholder="Ex.: Bateu a dianteira em 2024 e trocou o para-choque." {...bind('description')} />
              <p className="flex items-start gap-2 rounded-lg border border-warm-amber/40 bg-warm-amber/10 px-3 py-2.5 text-body-sm text-on-surface-variant">
                <AlertTriangle aria-hidden="true" className="mt-px size-4 shrink-0 text-warm-amber" />
                <span><strong className="font-semibold text-ice-white">Use apenas dados de teste.</strong> O que você enviar pode ser usado para treinar o modelo de IA.</span>
              </p>
            </section>
          </div>
          {submitError && <div className="v-pop"><Notice tone="danger" role="alert" title="A avaliação não foi enviada">{submitError} Seus dados continuam no formulário.</Notice></div>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {step > 0 ? (
              <button type="button" onClick={() => setStep(step - 1)} className={`${buttonSecondary} w-full sm:w-auto`}>
                <ArrowLeft aria-hidden="true" className="size-4" />Voltar
              </button>
            ) : <p className="text-body-sm text-cool-gray">Leva menos de 2 minutos para preencher.</p>}
            {step < STEPS.length - 1 ? (
              <button type="submit" className={`${buttonPrimary} w-full sm:w-auto`}>
                {step === 1 && fewPhotosWarned && photos.length > 0 && photos.length < RECOMMENDED_PHOTOS ? `Continuar com ${photos.length} ${photos.length === 1 ? 'foto' : 'fotos'}` : 'Continuar'}
                <ArrowRight aria-hidden="true" className="size-4" />
              </button>
            ) : (
              <button type="submit" disabled={submitting} className={`${buttonPrimary} w-full sm:w-auto`}>
                {submitting && <Loader2 aria-hidden="true" className="size-4 motion-safe:animate-spin" />}
                {submitting ? 'Enviando fotos e dados' : 'Iniciar avaliação'}
              </button>
            )}
          </div>
        </form>
      </div>
    </AppShell>
  );
}
