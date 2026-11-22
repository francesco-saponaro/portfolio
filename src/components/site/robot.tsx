// The avatar: Francesco, drawn in the site's glossy 3D style. A shaved head
// with a shine on it, dark brows, brown eyes, a salt-and-pepper beard that
// goes grey at the chin, a black T-shirt with three mint dots that type like
// a reply on its way, and a mint jetpack whose flame keeps him in the air.
// The parts keep the robot's names (eyes, mouth, arms, flame) because the
// flying stage (robot-stage.tsx) animates them by name; the same markup is
// drawn, still, inside the hero dock for visitors without script.

export function RobotSvg({ idp }: { idp: string }) {
  const u = (n: string) => `url(#${idp}-${n})`;
  return (
    <svg viewBox="-100 -125 200 230" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${idp}-skin`} cx="0.38" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffe6d6" />
          <stop offset="0.35" stopColor="#f2c0a2" />
          <stop offset="0.75" stopColor="#d9957a" />
          <stop offset="1" stopColor="#a8634c" />
        </radialGradient>
        <radialGradient id={`${idp}-skin2`} cx="0.4" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#f6cdb2" />
          <stop offset="1" stopColor="#c07b60" />
        </radialGradient>
        <linearGradient id={`${idp}-scalp`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5d5550" stopOpacity="0.32" />
          <stop offset="1" stopColor="#5d5550" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${idp}-beard`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b3634" />
          <stop offset="0.5" stopColor="#5b5652" />
          <stop offset="0.82" stopColor="#9c9893" />
          <stop offset="1" stopColor="#d6d3ce" />
        </linearGradient>
        <radialGradient id={`${idp}-tee`} cx="0.35" cy="0.2" r="0.9">
          <stop offset="0" stopColor="#3a414b" />
          <stop offset="0.5" stopColor="#1a1e24" />
          <stop offset="1" stopColor="#090b0e" />
        </radialGradient>
        <radialGradient id={`${idp}-pack`} cx="0.36" cy="0.26" r="0.86">
          <stop offset="0" stopColor="#e2fff8" />
          <stop offset="0.25" stopColor="#97f8e1" />
          <stop offset="0.6" stopColor="#2fe0c4" />
          <stop offset="1" stopColor="#0a6656" />
        </radialGradient>
        <linearGradient id={`${idp}-flame`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff7d6" />
          <stop offset="0.28" stopColor="#ffe071" />
          <stop offset="0.62" stopColor="#ff7a45" />
          <stop offset="1" stopColor="#ff7a45" stopOpacity="0" />
        </linearGradient>
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
        <rect x="-50" y="16" width="16" height="54" rx="8" fill={u("pack")} />
        <rect x="34" y="16" width="16" height="54" rx="8" fill={u("pack")} />
        <g data-part="armL" transform="translate(-33 32) rotate(14)">
          <rect x="-6.5" y="8" width="13" height="30" rx="6.5" fill={u("skin2")} />
          <rect x="-9.5" y="-6" width="19" height="22" rx="9.5" fill={u("tee")} />
          <circle cx="0" cy="38" r="9" fill={u("skin2")} />
        </g>
        <g data-part="armR" transform="translate(33 32) rotate(-14)">
          <rect x="-6.5" y="8" width="13" height="30" rx="6.5" fill={u("skin2")} />
          <rect x="-9.5" y="-6" width="19" height="22" rx="9.5" fill={u("tee")} />
          <circle cx="0" cy="38" r="9" fill={u("skin2")} />
        </g>
        <rect x="-15" y="2" width="30" height="22" rx="8" fill={u("skin2")} />
        <path d="M-40 50C-40 24-22 14 0 14S40 24 40 50 24 82 0 82-40 72-40 50Z" fill={u("tee")} />
        <path d="M-15 16Q0 29 15 16" stroke="#2c3138" strokeWidth="3" strokeLinecap="round" fill="none" />
        <ellipse cx="-20" cy="28" rx="10" ry="4" transform="rotate(-20 -20 28)" fill="#fff" opacity="0.12" />
        <circle className="rb-dot" cx="-9" cy="50" r="3" fill="#8ff7de" />
        <circle className="rb-dot" cx="0" cy="50" r="3" fill="#8ff7de" />
        <circle className="rb-dot" cx="9" cy="50" r="3" fill="#8ff7de" />
        <ellipse cx="-57" cy="-30" rx="10" ry="15" fill={u("skin2")} />
        <ellipse cx="57" cy="-30" rx="10" ry="15" fill={u("skin2")} />
        <path d="M-58-38Q-52-30-57-22" stroke="#a8634c" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M58-38Q52-30 57-22" stroke="#a8634c" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
        <ellipse cx="0" cy="-36" rx="57" ry="62" fill={u("skin")} />
        <path d="M-56-46C-52-84-26-98 0-98S52-84 56-46C40-70 20-78 0-78S-40-70-56-46Z" fill={u("scalp")} />
        <path
          d="M-56-38C-58-6-42 22 0 28 42 22 58-6 56-38 51-24 40-12 26-9 16-15 8-17 0-17S-16-15-26-9C-40-12-51-24-55-38Z"
          fill={u("beard")}
        />
        <path d="M-24-15Q0-26 24-15Q13-10 0-12Q-13-10-24-15Z" fill="#45403d" />
        <g data-part="face">
          <path d="M-35-51Q-22-58-8-52" stroke="#2e2622" strokeWidth="6.5" strokeLinecap="round" fill="none" />
          <path d="M35-51Q22-58 8-52" stroke="#2e2622" strokeWidth="6.5" strokeLinecap="round" fill="none" />
          <path d="M-3-44C-5-34-10-27-10-22C-10-17-5-16 0-16S10-17 10-22C10-27 5-34 3-44Z" fill="#c9836a" opacity="0.45" />
          <ellipse cx="-3" cy="-30" rx="2" ry="6" fill="#fff" opacity="0.28" />
          <ellipse cx="-5" cy="-19.5" rx="2.6" ry="1.6" fill="#8a4d3d" opacity="0.8" />
          <ellipse cx="5" cy="-19.5" rx="2.6" ry="1.6" fill="#8a4d3d" opacity="0.8" />
          <g data-part="eyes">
            <g data-part="eyeL">
              <ellipse cx="-19" cy="-33" rx="9.5" ry="7.5" fill="#fffaf6" />
              <circle cx="-19" cy="-33" r="5.6" fill="#5a3320" />
              <circle cx="-19" cy="-33" r="2.8" fill="#1b0f09" />
              <circle cx="-17" cy="-35.2" r="1.6" fill="#fff" />
              <path d="M-29-34Q-19-43-9-34" stroke="#6f4636" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </g>
            <g data-part="eyeR">
              <ellipse cx="19" cy="-33" rx="9.5" ry="7.5" fill="#fffaf6" />
              <circle cx="19" cy="-33" r="5.6" fill="#5a3320" />
              <circle cx="19" cy="-33" r="2.8" fill="#1b0f09" />
              <circle cx="21" cy="-35.2" r="1.6" fill="#fff" />
              <path d="M9-34Q19-43 29-34" stroke="#6f4636" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </g>
            <g data-part="happy" opacity="0" stroke="#3a2418" strokeWidth="3.5" strokeLinecap="round" fill="none">
              <path d="M-28-31Q-19-40-10-31" />
              <path d="M10-31Q19-40 28-31" />
            </g>
            <path data-part="mouth" d="M-7-13Q0-8 7-13" stroke="#8a4d3d" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        </g>
        <ellipse cx="-24" cy="-82" rx="20" ry="7" transform="rotate(-16 -24 -82)" fill="#fff" opacity="0.55" />
        <circle cx="-44" cy="-68" r="3" fill="#fff" opacity="0.6" />
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
