import { useEffect, useRef, type CSSProperties } from 'react'
import type { Project } from '../data'
import { useLang } from '../i18n'
import { pauseScroll, resumeScroll } from '../motion'
import { ArrowUpRight } from './Icons'

/**
 * What the modal needs. Featured projects pass themselves (they have a metric); archive projects have no
 * metric, so they pass their tagline as `kicker` instead.
 */
export type CaseData = Pick<Project, 'title' | 'image' | 'glow' | 'href' | 'stack' | 'story'> & { metric?: Project['metric']; kicker?: string }

type Props = { project: CaseData | null; onClose: () => void }

/** Problem → solution → result for one project, in a native modal dialog. */
export function CaseStudy({ project, onClose }: Props) {
  const { t } = useLang()
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialog.current!
    if (project && !el.open) {
      el.showModal()
      pauseScroll()
    }
    if (!project && el.open) el.close()
  }, [project])

  const s = t.ui.story

  return (
    <dialog
      ref={dialog}
      className="case"
      onClose={() => {
        resumeScroll()
        onClose()
      }}
      // Click on the backdrop (the dialog box itself, outside the panel) closes it.
      onClick={(e) => e.target === e.currentTarget && dialog.current!.close()}
      data-lenis-prevent
      aria-labelledby="case-title"
    >
      {project && (
        <article className="case__panel" style={{ '--glow': project.glow } as CSSProperties}>
          <button className="round round--ghost case__close" onClick={() => dialog.current!.close()} aria-label={s.close}>
            ✕
          </button>
          <div className="case__art">
            <img src={project.image} alt="" />
          </div>
          <div className="case__body">
            <h3 id="case-title" className="case__title">
              {project.title}
            </h3>
            <p className="case__metric">
              {project.metric ? (
                <>
                  <strong>{project.metric.value}</strong> {project.metric.label}
                </>
              ) : (
                project.kicker
              )}
            </p>
            <ol className="case__steps">
              {(
                [
                  [s.problem, project.story.problem],
                  [s.solution, project.story.solution],
                  [s.result, project.story.result],
                ] as const
              ).map(([label, text], i) => (
                <li key={label} style={{ '--i': i } as CSSProperties}>
                  <span>{label}</span>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
            <ul className="project__stack">
              {project.stack.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <a className="case__visit" href={project.href} target="_blank" rel="noreferrer">
              {s.visit}
              <ArrowUpRight size={14} />
            </a>
          </div>
        </article>
      )}
    </dialog>
  )
}
