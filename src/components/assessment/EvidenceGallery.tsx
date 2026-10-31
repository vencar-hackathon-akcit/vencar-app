// Dependencies
import {ImageOff, X} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';

// Shared
import {Badge} from '../ui';

// Types
import type {PhotoAssessment, PhotoSummary} from '../../lib/assessmentTypes';

// Local
import {getPhotoBlob} from '../../lib/api';

/** Fetch a protected photo as a blob and keep its temporary URL. */
function usePhotoUrl(assessmentId: string, photoId: string): {url: string | null; failed: boolean} {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let created: string | null = null;
    getPhotoBlob(assessmentId, photoId, controller.signal)
      .then((blob) => {
        created = URL.createObjectURL(blob);
        setUrl(created);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => {
      controller.abort();
      if (created) URL.revokeObjectURL(created);
    };
  }, [assessmentId, photoId]);
  return {url, failed};
}

/** Show one evidence photo, its assessment and an enlarged view. */
function EvidenceCard({assessmentId, photo, assessment}: {assessmentId: string; photo: PhotoSummary; assessment?: PhotoAssessment}) {
  const {url, failed} = usePhotoUrl(assessmentId, photo.id);
  const dialog = useRef<HTMLDialogElement>(null);
  const alt = `Evidência ${photo.evidenceId}: ${photo.filename}`;
  return (
    <li id={`evidencia-${photo.evidenceId}`} className="scroll-mt-20 overflow-hidden rounded-lg border border-steel bg-deep-petrol">
      {url ? (
        <button type="button" onClick={() => dialog.current?.showModal()} aria-label={`Ampliar evidência ${photo.evidenceId}`} className="block w-full cursor-zoom-in">
          <img src={url} alt={alt} className="aspect-[4/3] w-full object-cover" />
        </button>
      ) : failed ? (
        <div className="flex aspect-[4/3] flex-col items-center justify-center gap-1 p-2 text-center text-body-sm text-cool-gray">
          <ImageOff aria-hidden="true" className="size-5" />
          Não foi possível carregar esta foto.
        </div>
      ) : (
        <div className="t-skel-skeleton is-pulsing"><div className="aspect-[4/3] bg-surface-container-high" /></div>
      )}
      <div className="space-y-2 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-geist-mono text-label-md font-semibold text-ice-white">{photo.evidenceId}</span>
          {assessment && <Badge tone={assessment.usable ? 'success' : 'warning'}>{assessment.usable ? 'Foto utilizável' : 'Foto não utilizável'}</Badge>}
        </div>
        <p className="truncate text-body-sm text-cool-gray" title={photo.filename}>{photo.filename}</p>
        {assessment?.reason && <p className="text-body-sm text-on-surface-variant">{assessment.reason}</p>}
      </div>
      {url && (
        <dialog ref={dialog} aria-label={alt} onClick={(event) => { if (event.target === dialog.current) dialog.current?.close(); }} className="t-modal m-auto max-h-[90vh] max-w-[90vw] overflow-hidden rounded-xl border border-steel bg-graphite p-0 backdrop:bg-[#0B1015]/80">
          <img src={url} alt={alt} className="max-h-[90vh] max-w-full object-contain" />
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Fechar foto ampliada" className="absolute right-2 top-2 flex size-11 cursor-pointer items-center justify-center rounded-lg bg-[#0B1015]/80 text-[#F2F6F5]">
            <X aria-hidden="true" className="size-5" />
          </button>
        </dialog>
      )}
    </li>
  );
}

/** Show the evidence photos of an assessment with what the AI said about each. */
export function EvidenceGallery({assessmentId, photos, assessments}: {assessmentId: string; photos: PhotoSummary[]; assessments: PhotoAssessment[]}) {
  if (!photos.length) return <p className="text-body-md text-cool-gray">Nenhuma foto foi enviada nesta avaliação.</p>;
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {photos.map((photo) => <EvidenceCard key={photo.id} assessmentId={assessmentId} photo={photo} assessment={assessments.find((item) => item.evidenceId === photo.evidenceId)} />)}
    </ul>
  );
}
