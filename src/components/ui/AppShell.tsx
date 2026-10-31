// Dependencies
import {Moon, Plus, Sun} from 'lucide-react';
import type {ReactNode} from 'react';

// Local
import {Link, paths} from '../../lib/router';
import {useTheme} from '../../lib/theme';
import {buttonPrimary} from './index';

/** Frame every page with the skip link, header and footer. */
export function AppShell({children, hideNewAction = false}: {children: ReactNode; hideNewAction?: boolean}) {
  const {theme, toggleTheme} = useTheme();
  const isLight = theme === 'light';
  return (
    <div className="flex min-h-screen flex-col bg-asphalt-black text-on-surface">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-electric-cyan focus:px-4 focus:py-2 focus:text-asphalt-black">Pular para o conteúdo</a>
      <header className="sticky top-0 z-50 border-b border-steel/40 bg-graphite/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-3 px-4 lg:px-6">
          <Link href={paths.home} className="flex min-h-11 items-center text-headline-sm font-bold tracking-tight text-ice-white">Ven<span className="text-electric-cyan">car</span></Link>
          <div className="flex items-center gap-2">
            {!hideNewAction && <Link href={paths.newAssessment} className={buttonPrimary}><Plus aria-hidden="true" className="size-4" />Nova avaliação</Link>}
            <button type="button" onClick={toggleTheme} aria-label={isLight ? 'Usar tema escuro' : 'Usar tema claro'} className="t-press flex size-11 cursor-pointer items-center justify-center rounded-lg text-cool-gray hover:bg-surface-container-high hover:text-ice-white">
              {isLight ? <Moon aria-hidden="true" className="size-5" /> : <Sun aria-hidden="true" className="size-5" />}
            </button>
          </div>
        </div>
      </header>
      <main id="conteudo" tabIndex={-1} className="flex-1">{children}</main>
      <footer className="border-t border-steel/40 bg-surface-container-lowest py-6">
        <p className="mx-auto max-w-[1240px] px-4 text-body-sm text-cool-gray lg:px-6">Vencar, projeto do AKCIT CAMP. Os relatórios são gerados com apoio de IA e precisam de validação humana.</p>
      </footer>
    </div>
  );
}
