import { EYES, FACE } from "./dotmatrix";

// A place on the page where the dot companion (flyer-stage.tsx) comes to
// rest: `point` says which way the content is. The hero's dock also draws
// the companion's face, still, for visitors without script; the stage hides
// it once it runs.
export function BotDock({ className, point, still }: { className?: string; point?: "left" | "right"; still?: boolean }) {
  return (
    <div className={`bot-dock${className ? ` ${className}` : ""}`} data-bot={point ?? ""} aria-hidden="true">
      {still ? <DotFace /> : null}
    </div>
  );
}

function DotFace() {
  const isEye = (x: number, y: number) => EYES.some(([ex, ey]) => ex === x && ey === y);
  return (
    <svg viewBox="-60 -60 120 120" focusable="false">
      {FACE.map(([x, y]) => (
        <circle key={`${x},${y}`} cx={x * 10} cy={y * 10} r={isEye(x, y) ? 4.2 : 2.8} fill="#ffffff" opacity={isEye(x, y) ? 1 : 0.4} />
      ))}
    </svg>
  );
}
