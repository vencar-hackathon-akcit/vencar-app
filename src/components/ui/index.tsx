// Dependencies
import {AlertTriangle, ArrowLeft, CheckCircle2, ChevronDown, Info, XCircle} from 'lucide-react';
import {useEffect, useId, useRef, useState} from 'react';
import type {InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes} from 'react';

// Local
import {Link} from '../../lib/router';

export const buttonPrimary = 't-press inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-electric-cyan px-5 py-2.5 text-body-md font-semibold text-asphalt-black hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer';
export const buttonSecondary = 't-press inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-steel bg-deep-petrol px-5 py-2.5 text-body-md font-medium text-ice-white hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer';
const inputClass = 't-input w-full rounded-lg border bg-deep-petrol px-3 py-2.5 text-body-md text-ice-white placeholder:text-cool-gray focus:outline-2 focus:outline-electric-cyan aria-invalid:border-coral-red border-steel min-h-11';

type Tone = 'info' | 'success' | 'warning' | 'danger';
const TONES: Record<Tone, {box: string; text: string; icon: typeof Info}> = {
  info: {box: 'border-electric-cyan/40 bg-electric-cyan/10', text: 'text-electric-cyan', icon: Info},
  success: {box: 'border-signal-lime/40 bg-signal-lime/10', text: 'text-signal-lime', icon: CheckCircle2},
  warning: {box: 'border-warm-amber/40 bg-warm-amber/10', text: 'text-warm-amber', icon: AlertTriangle},
  danger: {box: 'border-coral-red/40 bg-coral-red/10', text: 'text-coral-red', icon: XCircle},
};

/** Show a message whose tone is carried by an icon and text, not only by color. */
export function Notice({tone, title, children, role}: {tone: Tone; title: string; children?: ReactNode; role?: 'alert' | 'status'}) {
  const {box, text, icon: Icon} = TONES[tone];
  return (
    <div role={role} className={`flex gap-3 rounded-xl border p-4 ${box}`}>
      <Icon aria-hidden="true" className={`mt-0.5 size-5 shrink-0 ${text}`} />
      <div className="min-w-0 space-y-1">
        <p className="text-body-md font-semibold text-ice-white">{title}</p>
        {children && <div className="text-body-md text-on-surface-variant">{children}</div>}
      </div>
    </div>
  );
}

/** Link back to the previous screen of the flow. */
export function BackLink({href, label}: {href: string; label: string}) {
  return (
    <Link href={href} className="t-press -ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-body-md font-medium text-cool-gray hover:text-ice-white">
      <ArrowLeft aria-hidden="true" className="size-4" />
      {label}
    </Link>
  );
}

/** Show a short label with a tone. */
export function Badge({tone, children}: {tone: Tone | 'neutral'; children: ReactNode}) {
  const classes = tone === 'neutral' ? 'border-steel bg-deep-petrol text-on-surface-variant' : `${TONES[tone].box} ${TONES[tone].text}`;
  return <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-label-md font-medium ${classes}`}>{children}</span>;
}

/** Group a titled part of a page. */
export function Section({title, description, children, id}: {title: string; description?: string; children: ReactNode; id?: string}) {
  const headingId = useId();
  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-20 rounded-xl border border-steel bg-graphite p-4 sm:p-5">
      <h2 id={headingId} className="text-headline-sm font-semibold text-ice-white">{title}</h2>
      {description && <p className="mt-1 text-body-md text-cool-gray">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Show or hide content with an animated panel. */
export function Accordion({title, children, defaultOpen = false, summary}: {title: string; children: ReactNode; defaultOpen?: boolean; summary?: ReactNode}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  return (
    <div className="t-acc" data-open={open}>
      <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)} className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 text-left">
        <span className="flex flex-wrap items-center gap-2 text-body-md font-semibold text-ice-white">{title}{summary}</span>
        <span className="t-acc-chevron text-cool-gray"><ChevronDown aria-hidden="true" className="size-5" /></span>
      </button>
      <div id={panelId} className="t-acc-panel">
        <div className="t-acc-panel-inner min-h-0"><div className="pt-3">{children}</div></div>
      </div>
    </div>
  );
}

/** Reserve space with pulsing bars while content loads. */
export function Skeleton({lines = 3}: {lines?: number}) {
  return (
    <div aria-hidden="true" className="t-skel-skeleton is-pulsing space-y-3">
      {Array.from({length: lines}, (_, index) => <div key={index} className="h-4 rounded bg-surface-container-high" style={{width: `${100 - index * 12}%`}} />)}
    </div>
  );
}

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string | null;
  optional?: boolean;
  hideLabel?: boolean;
}

/** Lay out a label, hint and error around a control, shaking when an error appears. */
function FieldShell({label, hint, error, optional, hideLabel, id, children}: FieldShellProps & {id: string; children: ReactNode}) {
  const wrapper = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const control = wrapper.current?.querySelector('.t-input');
    if (!error || !control) return;
    control.classList.remove('is-shaking');
    void (control as HTMLElement).offsetWidth;
    control.classList.add('is-shaking');
    const timer = window.setTimeout(() => control.classList.remove('is-shaking'), 300);
    return () => window.clearTimeout(timer);
  }, [error]);
  return (
    <div ref={wrapper} className="flex flex-col gap-1.5">
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'text-label-md font-medium text-ice-white'}>
        {label}
        {optional && <span className="font-normal text-cool-gray"> (opcional)</span>}
      </label>
      {children}
      {hint && <p id={`${id}-hint`} className="text-body-sm text-cool-gray">{hint}</p>}
      {error && <p id={`${id}-error`} className="text-body-sm font-medium text-coral-red">{error}</p>}
    </div>
  );
}

/** Build the attributes that tie a control to its hint and error. */
function describedBy(id: string, hint?: string, error?: string | null) {
  const ids = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ');
  return {'aria-describedby': ids || undefined, 'aria-invalid': error ? true : undefined};
}

/** Render a labelled text input. */
export function TextField({label, hint, error, optional, id, ...props}: FieldShellProps & {id: string} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell {...{label, hint, error, optional, id}}>
      <input id={id} name={id} aria-required={optional ? undefined : true} className={inputClass} {...describedBy(id, hint, error)} {...props} />
    </FieldShell>
  );
}

/** Render a labelled multiline input. */
export function TextAreaField({label, hint, error, optional, hideLabel, id, ...props}: FieldShellProps & {id: string} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell {...{label, hint, error, optional, hideLabel, id}}>
      <textarea id={id} name={id} rows={3} className={inputClass} {...describedBy(id, hint, error)} {...props} />
    </FieldShell>
  );
}

/** Render a labelled select. */
export function SelectField({label, hint, error, optional, id, children, ...props}: FieldShellProps & {id: string} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell {...{label, hint, error, optional, id}}>
      <div className="relative">
        <select id={id} name={id} className={`${inputClass} cursor-pointer appearance-none pr-10`} {...describedBy(id, hint, error)} {...props}>{children}</select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-cool-gray" />
      </div>
    </FieldShell>
  );
}
