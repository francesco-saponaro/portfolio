import Link from "next/link";
import "./site.css";
import "./robot.css";
import { archivo, instrument } from "./fonts";
import { Motion } from "./client";
import { FlyerStage } from "./flyer-stage";
import { BotDock } from "./robot";
import { PERSON } from "@/data/site";

// The page frame: the fonts, the dust canvas with the flying companion, the skip
// link, the footer and the entrance observer.
export function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className={`zb ${archivo.variable} ${instrument.variable}`}>
      <FlyerStage />
      <a href="#content" className="sr-only">
        Skip to content
      </a>
      {children}
      <Footer />
      <Motion />
    </div>
  );
}

export const NAV_LINKS = [
  { href: "#retest", label: "Retest" },
  { href: "#projects", label: "Projects" },
  { href: "#work", label: "Work" },
  { href: "#how", label: "How I work" },
  { href: "#contact", label: "Contact" },
] as const;

export function Nav() {
  return (
    <header className="wrap" id="top">
      <nav className="nav" aria-label="Main">
        <Link href="/" className="wordmark" aria-label={`${PERSON.name}, home`}>
          <span>{PERSON.name}</span>
        </Link>
        <ul>
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href}>{l.label}</Link>
            </li>
          ))}
        </ul>
        <a href={PERSON.github} className="btn" rel="noreferrer" target="_blank">
          GitHub <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </header>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="notes">
          <p>
            {PERSON.name}, {PERSON.role.toLowerCase()} in {PERSON.city}.
          </p>
          <p>Built with Next.js and TypeScript. The code of this site, like the rest, is on GitHub.</p>
        </div>
        <a href="#top" className="top link">
          Back to top
        </a>
      </div>
      <div className="footer-mid">
        <BotDock className="footer-bot" point="left" />
      </div>
      <div className="footer-meta">
        <nav aria-label="Elsewhere">
          <a href={PERSON.github} rel="noreferrer" target="_blank">
            GitHub
          </a>
          <a href={PERSON.linkedin} rel="noreferrer" target="_blank">
            LinkedIn
          </a>
          <a href={`mailto:${PERSON.email}`}>Email</a>
        </nav>
        <p className="city">
          {PERSON.city}, {year}
        </p>
      </div>
    </footer>
  );
}
