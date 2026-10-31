// Dependencies
import {useEffect, useRef} from 'react';

// Shared
import {AppShell} from './components/ui/AppShell';
import {buttonPrimary} from './components/ui';

// Local
import {Link, paths, usePath} from './lib/router';
import {LandingPage} from './pages/LandingPage';
import {NewAssessmentPage} from './pages/NewAssessmentPage';
import {ProgressPage} from './pages/ProgressPage';
import {ReportPage} from './pages/ReportPage';

const ASSESSMENT_ROUTE = /^\/avaliacoes\/([^/]+)\/(progresso|relatorio)\/?$/;

/** Offer a way back when the address matches no page. */
function NotFoundPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-16">
        <h1 className="text-headline-md font-bold text-ice-white">Página não encontrada</h1>
        <p className="text-body-lg text-cool-gray">Este endereço não existe. Confira o link ou comece uma nova avaliação.</p>
        <Link href={paths.newAssessment} className={buttonPrimary}>Começar nova avaliação</Link>
      </div>
    </AppShell>
  );
}

/** Pick the page for the current address. */
function renderRoute(path: string) {
  if (path === paths.home) return <LandingPage />;
  if (path.replace(/\/$/, '') === paths.newAssessment) return <NewAssessmentPage />;
  const match = ASSESSMENT_ROUTE.exec(path);
  if (!match) return <NotFoundPage />;
  const id = decodeURIComponent(match[1]);
  return match[2] === 'progresso' ? <ProgressPage key={id} id={id} /> : <ReportPage key={id} id={id} />;
}

/** Route between pages, moving scroll and focus as a page load would. */
export default function App() {
  const path = usePath();
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    document.getElementById('conteudo')?.focus({preventScroll: true});
  }, [path]);
  return renderRoute(path);
}
