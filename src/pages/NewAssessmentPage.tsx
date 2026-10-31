// Dependencies
import {AlertTriangle, Loader2} from 'lucide-react';
import {useEffect, useState} from 'react';
import type {FormEvent} from 'react';

// Shared
import {AppShell} from '../components/ui/AppShell';
import {BackLink, buttonPrimary, Notice, Section, SelectField, TextAreaField, TextField} from '../components/ui';
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
const FIELD_ORDER: (FieldName | 'photos')[] = ['make', 'model', 'year', 'plate', 'mileage', 'photos'];

/** Check one field and return its error message. */
function validateField(name: FieldName, value: string): string | null {
  if (name === 'make') return requireText(value, 'Informe a marca do carro.');
  if (name === 'model') return requireText(value, 'Informe o modelo do carro.');
  if (name === 'year') return validateYear(value);
  if (name === 'plate') return validatePlate(value);
  if (name === 'mileage') return value.trim() ? validateMileage(value) : null;
  return null;
}

/** Collect the vehicle data and photos that open an assessment. */
export function NewAssessmentPage() {
  const [values, setValues] = useState(() => ({...EMPTY, ...takeAssessmentDraft()}));
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  useEffect(() => {
    document.title = 'Nova avaliação | Vencar';
  }, []);
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
  /** Validate everything and send the form as multipart. */
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {photos: photos.length ? null : 'Adicione pelo menos uma foto do carro.'};
    (Object.keys(values) as FieldName[]).forEach((name) => {
      next[name] = validateField(name, values[name]);
    });
    setErrors(next);
    const firstInvalid = FIELD_ORDER.find((name) => next[name]);
    if (firstInvalid) {
      const target = firstInvalid === 'photos' ? document.querySelector<HTMLElement>('input[type="file"]') : document.getElementById(firstInvalid);
      target?.focus();
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
  return (
    <AppShell hideNewAction>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 lg:py-8">
        <div>
          <BackLink href={paths.home} label="Voltar para o início" />
          <h1 className="mt-2 text-headline-lg-mobile font-bold text-ice-white sm:text-headline-md">Nova avaliação</h1>
          <p className="mt-2 text-body-md text-cool-gray">Preencha os dados do carro e envie as fotos para gerar o dossiê.</p>
        </div>
        <p className="flex items-start gap-2 rounded-lg border border-warm-amber/40 bg-warm-amber/10 px-3 py-2.5 text-body-sm text-on-surface-variant">
          <AlertTriangle aria-hidden="true" className="mt-px size-4 shrink-0 text-warm-amber" />
          <span><strong className="font-semibold text-ice-white">Use apenas dados de teste.</strong> O que você enviar pode ser usado para treinar o modelo de IA.</span>
        </p>
        <form noValidate onSubmit={handleSubmit} className="space-y-6">
          <Section title="Veículo">
            <div className="grid gap-4 sm:grid-cols-6">
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
          </Section>
          <Section title="Fotos" description="Mostre a frente, a traseira, as laterais e o interior.">
            <PhotoPicker hideLabel label="Fotos do carro" hint={`Até ${MAX_PHOTOS} fotos em JPG, PNG ou WebP, com até 15 MB cada.`} files={photos} max={MAX_PHOTOS} error={errors.photos} onChange={(files) => { setPhotos(files); setErrors((current) => ({...current, photos: null})); }} />
          </Section>
          <Section title="Descrição (opcional)" description="Conte o que você sabe: batidas, reparos, ruídos ou manutenções.">
            <TextAreaField hideLabel optional label="Descrição do carro" placeholder="Ex.: Bateu a dianteira em 2024 e trocou o para-choque." {...bind('description')} />
          </Section>
          {submitError && <Notice tone="danger" role="alert" title="A avaliação não foi enviada">{submitError} Seus dados continuam no formulário.</Notice>}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-body-sm text-cool-gray">A análise leva de alguns segundos a alguns minutos.</p>
            <button type="submit" disabled={submitting} className={`${buttonPrimary} w-full shrink-0 sm:w-auto`}>
              {submitting && <Loader2 aria-hidden="true" className="size-4 motion-safe:animate-spin" />}
              {submitting ? 'Enviando fotos e dados' : 'Iniciar avaliação'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
