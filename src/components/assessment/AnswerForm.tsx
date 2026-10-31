// Dependencies
import {Loader2} from 'lucide-react';
import {useState} from 'react';
import type {FormEvent} from 'react';

// Shared
import {buttonPrimary, Notice, TextAreaField, TextField} from '../ui';

// Types
import type {VehicleData} from '../../lib/assessmentTypes';

// Local
import {ApiError, answerAssessment} from '../../lib/api';
import {MAX_PHOTOS} from '../../lib/config';
import {navigate, paths} from '../../lib/router';
import {validatePlate, validateYear} from '../../lib/validation';
import {PhotoPicker} from './PhotoPicker';

type VehicleField = 'make' | 'model' | 'year' | 'plate';

/** Collect what the agent asked for and start a new run. */
export function AnswerForm({assessmentId, vehicle, photoCount}: {assessmentId: string; vehicle: VehicleData; photoCount: number}) {
  const [answer, setAnswer] = useState('');
  const [fields, setFields] = useState<Record<VehicleField, string>>({make: vehicle.make, model: vehicle.model, year: vehicle.year, plate: vehicle.plate});
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Partial<Record<VehicleField, string | null>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const room = Math.max(MAX_PHOTOS - photoCount, 0);
  const changed = (Object.keys(fields) as VehicleField[]).filter((name) => fields[name].trim() !== vehicle[name].trim() && fields[name].trim());
  /** Build the props shared by the vehicle fields. */
  const bind = (name: VehicleField) => ({
    id: `answer-${name}`,
    value: fields[name],
    error: errors[name],
    optional: true,
    autoComplete: 'off',
    onChange: (event: {target: {value: string}}) => setFields((current) => ({...current, [name]: name === 'plate' ? event.target.value.toUpperCase() : event.target.value})),
  });
  /** Validate the answer and send only what the user provided. */
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const next = {
      year: changed.includes('year') ? validateYear(fields.year) : null,
      plate: changed.includes('plate') ? validatePlate(fields.plate) : null,
    };
    setErrors(next);
    if (next.year || next.plate) return;
    if (!answer.trim() && !changed.length && !photos.length) {
      setFormError('Escreva uma resposta, corrija um dado do carro ou adicione uma foto para continuar.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    const form = new FormData();
    form.append('answer', answer.trim());
    changed.forEach((name) => form.append(name, fields[name].trim()));
    photos.forEach((photo) => form.append('photos', photo));
    try {
      await answerAssessment(assessmentId, form);
      navigate(paths.progress(assessmentId));
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Não foi possível enviar sua resposta. Tente de novo.');
      setSubmitting(false);
    }
  };
  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <TextAreaField id="answer" label="Sua resposta" optional placeholder="Responda às perguntas acima com o que você sabe." value={answer} onChange={(event) => setAnswer(event.target.value)} />
      <fieldset className="space-y-3">
        <legend className="text-label-md font-medium text-ice-white">Dados do carro</legend>
        <p className="text-body-sm text-cool-gray">Preencha o que falta ou corrija o que estiver errado.</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TextField label="Marca" {...bind('make')} />
          <TextField label="Modelo" {...bind('model')} />
          <TextField label="Ano" inputMode="numeric" maxLength={4} {...bind('year')} />
          <TextField label="Placa" maxLength={8} {...bind('plate')} />
        </div>
      </fieldset>
      <PhotoPicker label="Novas fotos (opcional)" hint={room ? `Você ainda pode enviar ${room} ${room === 1 ? 'foto' : 'fotos'}.` : 'Esta avaliação já tem o máximo de 10 fotos.'} files={photos} max={room} onChange={setPhotos} />
      {formError && <Notice tone="danger" role="alert" title="Sua resposta não foi enviada">{formError}</Notice>}
      <button type="submit" disabled={submitting} className={`${buttonPrimary} w-full sm:w-auto`}>
        {submitting && <Loader2 aria-hidden="true" className="size-4 motion-safe:animate-spin" />}
        {submitting ? 'Enviando resposta' : 'Enviar e continuar a análise'}
      </button>
    </form>
  );
}
