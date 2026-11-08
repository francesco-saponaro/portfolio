import { DragStrip } from "./client";
import { BotDock } from "./robot";
import { PERSON, TONES } from "@/data/site";
import { PROJECTS, type Project } from "@/data/projects";

// The projects strip. With nothing in the list yet it shows one card that
// points at GitHub; with projects, one draggable card each.
export function Projects({ projects = PROJECTS }: { projects?: Project[] }) {
  return (
    <section className="features" id="projects" aria-labelledby="fs-projects">
      <div className="wrap features-head">
        <h2 id="fs-projects" data-in>
          Projects
        </h2>
        <p data-in>Things I&apos;ve built and shipped.</p>
        <BotDock className="side-bot features-bot" />
      </div>
      <DragStrip label="Projects">
        {projects.length === 0 ? (
          <article className="card card-empty t-sky" data-testid="projects-empty">
            <span className="card-n">00</span>
            <h3>More soon.</h3>
            <p>
              The code is on GitHub:{" "}
              <a className="link" href={PERSON.github} rel="noreferrer" target="_blank">
                {PERSON.githubLabel}
              </a>
            </p>
          </article>
        ) : (
          projects.map((p, i) => (
            <article key={p.slug} className={`card t-${TONES[i % TONES.length]}`}>
              <span className="card-n">
                {String(i + 1).padStart(2, "0")} · {p.year}
              </span>
              <ul className="card-stack" aria-label="Stack">
                {p.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <h3>{p.name}</h3>
              <p>{p.summary}</p>
              {p.repo || p.live ? (
                <div className="card-links">
                  {p.live ? (
                    <a className="more" href={p.live} rel="noreferrer" target="_blank">
                      Live <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                  {p.repo ? (
                    <a className="more" href={p.repo} rel="noreferrer" target="_blank">
                      Code <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))
        )}
      </DragStrip>
    </section>
  );
}
