// Dependencies
import {useSyncExternalStore} from 'react';
import type {AnchorHTMLAttributes, MouseEvent} from 'react';

const NAVIGATION_EVENT = 'vencar:navigate';

/** Subscribe to every kind of URL change. */
function subscribe(listener: () => void): () => void {
  window.addEventListener('popstate', listener);
  window.addEventListener(NAVIGATION_EVENT, listener);
  return () => {
    window.removeEventListener('popstate', listener);
    window.removeEventListener(NAVIGATION_EVENT, listener);
  };
}

/** Read the current path as React state. */
export function usePath(): string {
  return useSyncExternalStore(subscribe, () => window.location.pathname);
}

/** Change the URL without reloading the page. */
export function navigate(path: string, options: {replace?: boolean} = {}): void {
  if (options.replace) window.history.replaceState(null, '', path);
  else window.history.pushState(null, '', path);
  window.dispatchEvent(new Event(NAVIGATION_EVENT));
}

/** Render a real link that navigates inside the app. */
export function Link({href, onClick, ...props}: AnchorHTMLAttributes<HTMLAnchorElement> & {href: string}) {
  /** Keep modified clicks, such as open in a new tab, with the browser. */
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(href);
  };
  return <a href={href} onClick={handleClick} {...props} />;
}

export const paths = {
  home: '/',
  newAssessment: '/avaliacoes/nova',
  /** Build the progress page path. */
  progress: (id: string) => `/avaliacoes/${encodeURIComponent(id)}/progresso`,
  /** Build the report page path. */
  report: (id: string) => `/avaliacoes/${encodeURIComponent(id)}/relatorio`,
};
