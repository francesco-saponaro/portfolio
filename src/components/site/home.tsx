import Link from "next/link";
import { Nav, SiteFrame } from "./frame";
import { LitText, StoryWatcher } from "./client";
import { SolidShape } from "./solid";
import { BotDock } from "./robot";
import { Projects } from "./projects";
import { FACTS, HERO, HOW, MANIFESTO, PERSON, WORK } from "@/data/site";

// The one page: hero, manifesto, projects, work, how I work, languages and
// place, contact. The robot has a dock in each section and flies between them.
export function Home() {
  return (
    <SiteFrame>
      <Nav />
      <main id="content" className="rb">
        <section className="hero wrap" aria-labelledby="fs-title">
          <div className="hero-text">
            <p className="kicker after-rise">{HERO.kicker}</p>
            <h1 id="fs-title">
              <span className="line reveal-line">
                <span>{HERO.lines[0]}</span>
              </span>
              <span className="line reveal-line soft">
                <span>{HERO.lines[1]}</span>
              </span>
            </h1>
            <p className="hero-lead after-rise">{HERO.lead}</p>
            <div className="actions after-rise">
              <Link href="#work" className="btn">
                See the work <span aria-hidden="true">↓</span>
              </Link>
              <Link href="#contact" className="btn ghost">
                Get in touch <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <BotDock className="hero-bot" still />
        </section>

        <section className="manifesto wrap" aria-label="What I like">
          <LitText text={MANIFESTO} />
          <BotDock className="side-bot manifesto-bot" point="left" />
        </section>

        <Projects />

        <section className="steps" id="work" aria-labelledby="fs-work">
          <div className="wrap steps-head">
            <p className="kicker" data-in>
              Work
            </p>
            <h2 id="fs-work" data-in>
              Where I&apos;ve built things.
            </h2>
          </div>
          <div className="wrap steps-body">
            <div className="stories-stage">
              <SolidShape shape={WORK[0].shape} className="stage-shape" story />
              <BotDock className="stage-bot" point="left" />
              <p className="counter" aria-hidden="true">
                <b data-story-count>1</b> of {WORK.length}
              </p>
            </div>
            <ol className="steps-list">
              {WORK.map((j, i) => (
                <li key={j.org} className={`step${i === 0 ? " on" : ""}`} data-step={j.shape}>
                  <span className="step-time">{j.time}</span>
                  <h3>{j.org}</h3>
                  <p className="step-role">{j.role}</p>
                  <p>{j.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <StoryWatcher id="work" />
        </section>

        <section className="features" id="how" aria-labelledby="fs-how">
          <div className="wrap features-head">
            <h2 id="fs-how" data-in>
              How I work
            </h2>
            <p data-in>Three habits.</p>
            <BotDock className="side-bot features-bot" point="left" />
          </div>
          <div className="wrap how-grid">
            {HOW.map((h, i) => (
              <article key={h.title} className={`card t-${h.tone}`} data-in style={{ ["--i" as string]: i }}>
                <span className="card-n">{String(i + 1).padStart(2, "0")}</span>
                <h3>{h.title}</h3>
                <p>{h.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about wrap" id="about" aria-labelledby="fs-about">
          <div className="about-art">
            <SolidShape shape="pin" className="about-shape" />
            <BotDock className="about-bot" point="left" />
          </div>
          <div className="about-body">
            <h2 id="fs-about" data-in>
              Based in Paris.
            </h2>
            <p data-in>I work in English and Italian, get by in Portuguese, and I&apos;m learning French. Happy in an office here or on a remote team.</p>
            <ul className="about-facts" data-in>
              {FACTS.map((f) => (
                <li key={f.label}>
                  <b>{f.label}</b>
                  {f.text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="cta wrap" id="contact" aria-labelledby="fs-contact">
          <div className="cta-body">
            <h2 id="fs-contact" data-in>
              Say hello.
            </h2>
            <p className="cta-lead" data-in>
              Email is the quickest way to reach me. For the rest, LinkedIn and GitHub.
            </p>
            <a className="mail" href={`mailto:${PERSON.email}`} data-in>
              {PERSON.email}
            </a>
            <div className="others" data-in>
              <ul>
                <li>
                  <a href={PERSON.linkedin} rel="noreferrer" target="_blank">
                    {PERSON.linkedinLabel}
                  </a>
                </li>
                <li>
                  <a href={PERSON.github} rel="noreferrer" target="_blank">
                    {PERSON.githubLabel}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="cta-art">
            <SolidShape shape="plane" className="cta-shape" />
            <BotDock className="cta-bot" />
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
