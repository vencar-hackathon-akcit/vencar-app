// Dependencies
import {Armchair, Car, CarFront, Gauge, ImagePlus, X} from 'lucide-react';
import {useEffect, useId, useMemo, useRef, useState} from 'react';
import type {ChangeEvent, DragEvent} from 'react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 15 * 1024 * 1024;
const RECOMMENDED = 4;
const ANGLES = [
  {label: 'Frente', icon: CarFront},
  {label: 'Traseira', icon: Car},
  {label: 'Laterais', icon: Car},
  {label: 'Interior', icon: Armchair},
  {label: 'Painel', icon: Gauge},
];

interface PhotoPickerProps {
  files: File[];
  onChange: (files: File[]) => void;
  max: number;
  error?: string | null;
  label: string;
  hint: string;
  hideLabel?: boolean;
  guided?: boolean;
}

/** Choose, preview and remove photos, by button or drag and drop. */
export function PhotoPicker({files, onChange, max, error, label, hint, hideLabel, guided}: PhotoPickerProps) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const previews = useMemo(() => files.map((file) => ({file, url: URL.createObjectURL(file)})), [files]);
  useEffect(() => () => previews.forEach((item) => URL.revokeObjectURL(item.url)), [previews]);
  /** Add valid files, explaining what had to be left out. */
  const addFiles = (incoming: File[]) => {
    const problems: string[] = [];
    const valid = incoming.filter((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) problems.push(`${file.name} não é JPG, PNG ou WebP.`);
      else if (file.size > MAX_BYTES) problems.push(`${file.name} tem mais de 15 MB.`);
      else return true;
      return false;
    });
    const fresh = valid.filter((file) => !files.some((item) => item.name === file.name && item.size === file.size));
    const room = Math.max(max - files.length, 0);
    if (fresh.length > room) problems.push(`O limite é de ${max} fotos. ${fresh.length - room} ficaram de fora.`);
    setNotice(problems.join(' ') || null);
    if (fresh.length && room) onChange([...files, ...fresh.slice(0, room)]);
  };
  /** Read the files chosen in the system dialog. */
  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  };
  /** Read the files dropped on the area. */
  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  };
  /** Remove one photo and return focus to the picker. */
  const remove = (target: File) => {
    onChange(files.filter((file) => file !== target));
    setNotice(null);
    input.current?.focus();
  };
  const full = files.length >= max;
  const message = notice ?? error;
  return (
    <div className="space-y-3">
      <p className={hideLabel ? 'sr-only' : 'text-label-md font-medium text-ice-white'}>{label}</p>
      {guided && (
        <div className="space-y-2">
          <p className="text-body-sm font-medium text-on-surface-variant">Ângulos que ajudam a IA</p>
          <ul className="flex flex-wrap gap-2">
            {ANGLES.map(({label: angle, icon: Icon}) => (
              <li key={angle} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-steel bg-deep-petrol px-3 text-body-sm text-ice-white">
                <Icon aria-hidden="true" className="size-4 text-electric-cyan" />{angle}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="relative">
        <input ref={input} id={inputId} type="file" multiple accept={ACCEPTED_TYPES.join(',')} disabled={full} onChange={handleInput} aria-describedby={`${inputId}-hint`} aria-invalid={error ? true : undefined} className="peer sr-only" />
        <label htmlFor={inputId} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} className={`v-lift flex min-h-32 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed p-4 text-center peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-electric-cyan ${full ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-deep-petrol'} ${dragging ? 'scale-[1.01] border-electric-cyan bg-deep-petrol' : error ? 'border-coral-red' : 'border-steel'}`}>
          <span aria-hidden="true" className={`flex size-11 items-center justify-center rounded-full bg-electric-cyan/10 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-bounce)] ${dragging ? 'scale-110' : ''}`}><ImagePlus className="size-6 text-electric-cyan" /></span>
          <span className="text-body-md font-medium text-ice-white">{full ? 'Limite de fotos atingido' : dragging ? 'Solte as fotos aqui' : 'Escolher fotos ou arrastar para cá'}</span>
          <span id={`${inputId}-hint`} className="text-body-sm text-cool-gray">{hint}</span>
        </label>
      </div>
      {guided ? (
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-high">
            <div className={`h-full origin-left rounded-full transition-[transform,background-color] duration-[var(--duration-slow)] ease-[var(--ease-smooth-out)] ${files.length >= RECOMMENDED ? 'bg-signal-lime' : 'bg-electric-cyan'}`} style={{transform: `scaleX(${Math.min(files.length / RECOMMENDED, 1)})`}} />
          </div>
          <p aria-live="polite" className="shrink-0 text-body-sm text-cool-gray">{files.length >= RECOMMENDED ? `${files.length} fotos, ótima cobertura` : `${files.length} de ${RECOMMENDED} recomendadas`}</p>
        </div>
      ) : <p aria-live="polite" className="text-body-sm text-cool-gray">{files.length} de {max} {max === 1 ? 'foto' : 'fotos'}</p>}
      {message && <p role="alert" className="text-body-sm font-medium text-coral-red">{message}</p>}
      {previews.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {previews.map(({file, url}, index) => (
            <li key={`${file.name}-${file.size}`} className="v-pop relative overflow-hidden rounded-lg border border-steel bg-deep-petrol">
              <img src={url} alt={`Prévia de ${file.name}`} className="aspect-square w-full object-cover" />
              {guided && index === 0 && <span className="absolute left-1.5 top-1.5 rounded-md bg-[#0B1015]/80 px-1.5 py-0.5 text-label-md font-medium text-[#F2F6F5]">Capa</span>}
              <p className="truncate px-2 py-1 text-body-sm text-cool-gray" title={file.name}>{file.name}</p>
              <button type="button" onClick={() => remove(file)} aria-label={`Remover ${file.name}`} className="t-press absolute right-1 top-1 flex size-11 cursor-pointer items-center justify-center rounded-lg bg-[#0B1015]/80 text-[#F2F6F5] hover:bg-[#0B1015]">
                <X aria-hidden="true" className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
