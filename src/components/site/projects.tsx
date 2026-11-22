import { DragStrip } from "./client";
import { BotDock } from "./robot";
import { PERSON } from "@/data/site";
import { PROJECTS, type Project } from "@/data/projects";

// The projects strip: one draggable card each, the running app's screenshot on
// top. With nothing in the list it shows one card that points at GitHub.
export function Projects({ projects = PROJECTS }: { projects?: Project[] }) {
  return (
    <section className="features" id="projects" aria-labelledby="fs-projects">
      <div className="wrap features-head">
        <h2 id="fs-projects" data-in>
          More projects
        </h2>
        <p data-in>Each one runs in the browser. Drag the row or scroll it.</p>
        <BotDock className="side-bot features-bot" />
      </div>
      <DragStrip label="Projects">
        {projects.length === 0 ? (
          <article className="card card-empty t-sky" data-testid="projects-empty">
            <h3>More soon.</h3>
            <p>
              The code is on GitHub:{" "}
              <a className="link" href={PERSON.github} rel="noreferrer" target="_blank">
                {PERSON.githubLabel}
              </a>
            </p>
          </article>
        ) : (
          projects.map((p) => (
            <article key={p.slug} className="card project">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="project-shot" src={p.image.src} alt={p.image.alt} width={960} height={600} loading="lazy" decoding="async" draggable={false} />
              ) : null}
              <div className="project-body">
                <h3>{p.name}</h3>
                <p>{p.summary}</p>
                <ul className="card-stack" aria-label="Stack">
                  {p.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                {p.repo || p.live ? (
                  <div className="card-links">
                    {p.live ? (
                      <a className="more" href={p.live} rel="noreferrer" target="_blank">
                        Open it <span aria-hidden="true">↗</span>
                      </a>
                    ) : null}
                    {p.repo ? (
                      <a className="more" href={p.repo} rel="noreferrer" target="_blank">
                        Code <span aria-hidden="true">↗</span>
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </article>
          ))
        )}
      </DragStrip>
    </section>
  );
}
