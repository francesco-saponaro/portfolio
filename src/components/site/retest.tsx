import { ScreenSwitcher } from "./client";
import { BotDock } from "./robot";
import { RETEST, RETEST_FIGURES, RETEST_SCREENS, RETEST_STEPS } from "@/data/retest";

// The flagship, as a short case study: what it is, its screens, the real
// scan in four numbers, how a scanner's file becomes a finding, and the links.
export function Retest() {
  return (
    <section className="retest" id="retest" aria-labelledby="fs-retest">
      <div className="wrap retest-intro">
        <div className="retest-words">
          <h2 id="fs-retest" data-in>
            {RETEST.title}
          </h2>
          <p className="retest-lead" data-in>
            {RETEST.lead}
          </p>
          <p className="retest-body" data-in>
            {RETEST.body}
          </p>
          <div className="actions" data-in>
            <a className="btn" href={RETEST.live} rel="noreferrer" target="_blank">
              Open the demo <span aria-hidden="true">↗</span>
            </a>
            <a className="btn ghost" href={RETEST.repo} rel="noreferrer" target="_blank">
              The code <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <div className="retest-screens" data-in>
          <ScreenSwitcher screens={RETEST_SCREENS} />
        </div>
      </div>

      <div className="wrap retest-run">
        <div className="retest-run-head">
          <h3 data-in>A real scan, not sample data.</h3>
          <p data-in>
            I ran five scanners against OWASP Juice Shop, a web shop built to be attacked, on my own laptop, and imported their output unedited.{" "}
            <a className="link" href={RETEST.realRun} rel="noreferrer" target="_blank">
              Every command, and what broke on the way
            </a>
            .
          </p>
          <BotDock className="side-bot retest-bot" point="left" />
        </div>
        <dl className="figures">
          {RETEST_FIGURES.map((f, i) => (
            <div key={f.value} className="figure" data-in style={{ ["--i" as string]: i }}>
              <dt>{f.value}</dt>
              <dd>{f.text}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="wrap retest-how">
        <h3 data-in>From a scanner&apos;s file to a finding.</h3>
        <ol className="pipeline">
          {RETEST_STEPS.map((s, i) => (
            <li key={s.title} data-in style={{ ["--i" as string]: i }}>
              <b>{s.title}</b>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <ul className="retest-stack" aria-label="Built with" data-in>
          {RETEST.stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
