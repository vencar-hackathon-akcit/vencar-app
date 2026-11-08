// Dependencies
import {useEffect, useId, useLayoutEffect, useRef, useState} from 'react';
import type {CSSProperties} from 'react';

const REEL_SPINS = 2;
const TWINKLE = [7, 2, 11, 5, 14, 9, 0, 12, 3, 15, 6, 10, 13, 1, 8, 4];
const RING = [1, 2, 7, 11, 14, 13, 8, 4];

/** Read a duration token from the root element in milliseconds. */
function readMs(name: string, fallback: number): number {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback;
}

/** Tell whether the visitor asked the system for less motion. */
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Become true on the frame after mount, so CSS entrances run from their start state. */
export function useShown(ready = true): boolean {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!ready) return;
    let second = 0;
    const first = window.requestAnimationFrame(() => {
      second = window.requestAnimationFrame(() => setShown(true));
    });
    return () => {
      window.cancelAnimationFrame(first);
      window.cancelAnimationFrame(second);
    };
  }, [ready]);
  return shown;
}

/** Pulse a 4×4 dot matrix as a quiet loader. */
export function MatrixLoader({variant = 'scan'}: {variant?: 'scan' | 'twinkle' | 'orbit'}) {
  const cycle = 1200;
  return (
    <div aria-hidden="true" className="t-matrix">
      {Array.from({length: 16}, (_, index) => {
        let delay = 0;
        if (variant === 'scan') delay = (index % 4) * (cycle / 10);
        if (variant === 'twinkle') delay = TWINKLE[index] * (cycle / 16);
        if (variant === 'orbit') delay = Math.max(RING.indexOf(index), 0) * (cycle / 8);
        return <i key={index} style={{'--d': String(Math.round(delay))} as CSSProperties} />;
      })}
    </div>
  );
}

/** Spin each digit like a slot-machine reel before landing on the value. */
export function SpinningNumber({value, className = ''}: {value: number; className?: string}) {
  const digits = String(Math.max(0, Math.round(value))).split('').map(Number);
  const strips = useRef<(HTMLDivElement | null)[]>([]);
  const blurs = useRef<(SVGFEGaussianBlurElement | null)[]>([]);
  const filterId = useId().replace(/:/g, '');
  useLayoutEffect(() => {
    if (prefersReducedMotion()) {
      strips.current.forEach((strip, column) => {
        if (strip) strip.style.transform = `translateY(calc(var(--reel-cell) * -${REEL_SPINS * 10 + digits[column]}))`;
      });
      return;
    }
    const duration = readMs('--reel-dur', 1400);
    const stagger = readMs('--reel-stagger', 90);
    const spinBlur = readMs('--reel-spin-blur', 3);
    const frames: number[] = [];
    strips.current.forEach((strip, column) => {
      if (!strip) return;
      strip.style.transition = 'none';
      strip.style.transform = 'translateY(0)';
      void strip.offsetHeight;
      strip.style.transition = `transform var(--reel-dur) var(--reel-ease) ${column * stagger}ms`;
      strip.style.transform = `translateY(calc(var(--reel-cell) * -${REEL_SPINS * 10 + digits[column]}))`;
      const start = performance.now() + column * stagger;
      /** Fade the vertical motion blur out as the reel settles. */
      const decay = (now: number) => {
        const progress = Math.min(Math.max((now - start) / duration, 0), 1);
        blurs.current[column]?.setAttribute('stdDeviation', `0 ${(spinBlur * (1 - progress) ** 2).toFixed(2)}`);
        if (progress < 1) frames[column] = window.requestAnimationFrame(decay);
      };
      frames[column] = window.requestAnimationFrame(decay);
    });
    return () => frames.forEach((frame) => window.cancelAnimationFrame(frame));
  }, [value]);
  return (
    <span className={`t-reel ${className}`}>
      <span className="sr-only">{value}</span>
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        {digits.map((_, column) => (
          <filter key={column} id={`${filterId}-${column}`} x="0" y="-20%" width="100%" height="140%">
            <feGaussianBlur ref={(element) => { blurs.current[column] = element; }} stdDeviation="0 0" />
          </filter>
        ))}
      </svg>
      {digits.map((_, column) => (
        <span key={column} aria-hidden="true" className="t-reel-col">
          <div ref={(element) => { strips.current[column] = element; }} className="t-reel-strip" style={{filter: `url(#${filterId}-${column})`}}>
            {Array.from({length: (REEL_SPINS + 1) * 10}, (_, cell) => <span key={cell} className="t-reel-digit">{cell % 10}</span>)}
          </div>
        </span>
      ))}
    </span>
  );
}

/** Change a short label in place, cross-blurring only the letters that differ. */
export function MorphText({text}: {text: string}) {
  const label = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const element = label.current;
    if (!element) return;
    const previous = element.dataset.text;
    element.dataset.text = text;
    if (previous === undefined || previous === text || prefersReducedMotion()) {
      element.textContent = text;
      return;
    }
    let start = 0;
    while (start < previous.length && start < text.length && previous[start] === text[start]) start += 1;
    let end = 0;
    while (end < previous.length - start && end < text.length - start && previous[previous.length - 1 - end] === text[text.length - 1 - end]) end += 1;
    const swap = document.createElement('span');
    swap.className = 't-morph-swap';
    const outgoing = document.createElement('span');
    outgoing.className = 't-morph-old';
    outgoing.setAttribute('aria-hidden', 'true');
    outgoing.textContent = previous.slice(start, previous.length - end);
    const incoming = document.createElement('span');
    incoming.className = 't-morph-new';
    incoming.textContent = text.slice(start, text.length - end);
    swap.append(outgoing, incoming);
    element.textContent = '';
    element.append(text.slice(0, start), swap, text.slice(text.length - end));
    swap.style.width = `${outgoing.getBoundingClientRect().width}px`;
    void swap.offsetWidth;
    swap.classList.add('is-morphing');
    swap.style.width = `${incoming.getBoundingClientRect().width}px`;
    const timer = window.setTimeout(() => {
      element.textContent = text;
    }, Math.max(readMs('--text-morph-dur', 180), readMs('--text-morph-resize-dur', 240)) + 40);
    return () => window.clearTimeout(timer);
  }, [text]);
  return <span ref={label} className="t-morph" />;
}

/** Celebrate a finished step with a drawn checkmark. */
export function SuccessCheck({className = ''}: {className?: string}) {
  const shown = useShown();
  return (
    <span aria-hidden="true" className={`t-success-check ${className}`} data-state={shown ? 'in' : 'out'}>
      <svg viewBox="0 0 48 48" fill="none" className="size-full">
        <circle cx="24" cy="24" r="22" fill="currentColor" opacity="0.15" />
        <path d="M14 25 L21 32 L34 17" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
