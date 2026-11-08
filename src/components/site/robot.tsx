// The robot: a glossy mint helmet with a dark visor and two glowing
// eyes, an antenna, ear pods, a small body whose chest screen types the three
// dots like a reply on its way, and a thruster flame because it flies.
// The same markup is drawn by the flying stage (robot-stage.tsx) and, as a
// still picture, inside the hero dock for visitors without script.

export function RobotSvg({ idp }: { idp: string }) {
  const u = (n: string) => `url(#${idp}-${n})`;
  return (
    <svg viewBox="-100 -125 200 230" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${idp}-shell`} cx="0.36" cy="0.26" r="0.86">
          <stop offset="0" stopColor="#e2fff8" />
          <stop offset="0.2" stopColor="#97f8e1" />
          <stop offset="0.52" stopColor="#2fe0c4" />
          <stop offset="0.84" stopColor="#119e82" />
          <stop offset="1" stopColor="#0a6656" />
        </radialGradient>
        <linearGradient id={`${idp}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.55" stopColor="#03241d" stopOpacity="0" />
          <stop offset="1" stopColor="#03241d" stopOpacity="0.38" />
        </linearGradient>
        <linearGradient id={`${idp}-visor`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#163a4a" />
          <stop offset="0.55" stopColor="#071821" />
          <stop offset="1" stopColor="#02070b" />
        </linearGradient>
        <radialGradient id={`${idp}-pod`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffd9c4" />
          <stop offset="0.45" stopColor="#ff7a45" />
          <stop offset="1" stopColor="#b3401a" />
        </radialGradient>
        <radialGradient id={`${idp}-tip`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset="0.5" stopColor="#ffe071" />
          <stop offset="1" stopColor="#ff9a45" />
        </radialGradient>
        <linearGradient id={`${idp}-flame`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff7d6" />
          <stop offset="0.28" stopColor="#ffe071" />
          <stop offset="0.62" stopColor="#ff7a45" />
          <stop offset="1" stopColor="#ff7a45" stopOpacity="0" />
        </linearGradient>
        <filter id={`${idp}-glow`} x="-1" y="-1" width="3" height="3">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${idp}-soft`} x="-1" y="-0.5" width="3" height="2">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      <g data-part="root">
        <g data-part="flame" transform="translate(0 80)">
          <path d="M-17 0C-17 18-7 40 0 64 7 40 17 18 17 0Z" fill={u("flame")} filter={u("soft")} />
          <path d="M-7 0C-7 10-3 22 0 33 3 22 7 10 7 0Z" fill="#fffbea" opacity="0.92" />
        </g>
        <ellipse cx="0" cy="78" rx="17" ry="7" fill="#0b4a3f" />
        <g data-part="armL" transform="translate(-33 32) rotate(14)">
          <rect x="-7" y="-4" width="14" height="38" rx="7" fill={u("shell")} />
          <circle cx="0" cy="38" r="9.5" fill={u("shell")} />
        </g>
        <g data-part="armR" transform="translate(33 32) rotate(-14)">
          <rect x="-7" y="-4" width="14" height="38" rx="7" fill={u("shell")} />
          <circle cx="0" cy="38" r="9.5" fill={u("shell")} />
        </g>
        <path d="M-38 46C-38 23-20 14 0 14S38 23 38 46 22 82 0 82-38 69-38 46Z" fill={u("shell")} />
        <path d="M-38 46C-38 23-20 14 0 14S38 23 38 46 22 82 0 82-38 69-38 46Z" fill={u("shade")} />
        <ellipse cx="-17" cy="28" rx="11" ry="5" transform="rotate(-20 -17 28)" fill="#fff" opacity="0.5" />
        <rect x="-19" y="38" width="38" height="20" rx="10" fill="#06212a" />
        <circle className="rb-dot" cx="-9" cy="48" r="3" fill="#8ff7de" />
        <circle className="rb-dot" cx="0" cy="48" r="3" fill="#8ff7de" />
        <circle className="rb-dot" cx="9" cy="48" r="3" fill="#8ff7de" />
        <path data-part="stalk" d="M0-80Q0-92 0-104" stroke="#0e8a72" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <circle data-part="tip" cx="0" cy="-107" r="8" fill={u("tip")} filter={u("glow")} />
        <ellipse cx="-64" cy="-32" rx="11" ry="17" fill={u("pod")} />
        <ellipse cx="64" cy="-32" rx="11" ry="17" fill={u("pod")} />
        <rect x="-64" y="-86" width="128" height="110" rx="50" fill={u("shell")} />
        <rect x="-64" y="-86" width="128" height="110" rx="50" fill={u("shade")} />
        <g data-part="face">
          <rect x="-50" y="-68" width="100" height="72" rx="34" fill={u("visor")} stroke="#8ff7de" strokeOpacity="0.32" strokeWidth="1.5" />
          <path d="M-38-56Q-22-64 0-64" stroke="#fff" strokeOpacity="0.16" strokeWidth="4" strokeLinecap="round" fill="none" />
          <g data-part="eyes">
            <g data-part="eyeL">
              <ellipse cx="-19" cy="-33" rx="8.5" ry="12" fill="#b4fff0" filter={u("glow")} />
            </g>
            <g data-part="eyeR">
              <ellipse cx="19" cy="-33" rx="8.5" ry="12" fill="#b4fff0" filter={u("glow")} />
            </g>
            <g data-part="happy" opacity="0" stroke="#b4fff0" strokeWidth="5" strokeLinecap="round" fill="none" filter={u("glow")}>
              <path d="M-28-30Q-19-42-10-30" />
              <path d="M10-30Q19-42 28-30" />
            </g>
            <path data-part="mouth" d="M-7-13Q0-8 7-13" stroke="#5ff0d4" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.85" />
          </g>
        </g>
        <ellipse cx="-30" cy="-74" rx="22" ry="7" transform="rotate(-14 -30 -74)" fill="#fff" opacity="0.62" />
        <circle cx="-50" cy="-57" r="3" fill="#fff" opacity="0.7" />
        <ellipse data-part="hit" cx="0" cy="-20" rx="70" ry="100" fill="transparent" />
      </g>
    </svg>
  );
}

// A place on the page where the robot comes to hover. `point` makes it point
// at whatever is on that side (a shape, a list). The hero dock carries a still
// robot for visitors without script; the stage hides it once it flies.
export function BotDock({ className, point, still }: { className?: string; point?: "left" | "right"; still?: boolean }) {
  return (
    <div className={`bot-dock${className ? ` ${className}` : ""}`} data-bot={point ?? ""} aria-hidden="true">
      {still ? <RobotSvg idp="zbrs" /> : null}
    </div>
  );
}

// The nav logo: the robot's head, blinking.
export function RobotMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={`mark rmark${className ? ` ${className}` : ""}`} aria-hidden="true" focusable="false">
      <path d="M16 6.5V3.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="3" r="2.4" fill="#ff7a45" />
      <ellipse cx="3.6" cy="17.5" rx="2" ry="3.2" fill="#ff7a45" />
      <ellipse cx="28.4" cy="17.5" rx="2" ry="3.2" fill="#ff7a45" />
      <rect x="4" y="6" width="24" height="22" rx="10" fill="currentColor" />
      <rect x="7.6" y="10.4" width="16.8" height="12.4" rx="6.2" fill="var(--bg)" />
      <ellipse className="eye" cx="12.6" cy="16.6" rx="1.7" ry="2.4" fill="#b4fff0" />
      <ellipse className="eye" cx="19.4" cy="16.6" rx="1.7" ry="2.4" fill="#b4fff0" />
    </svg>
  );
}
