// The mark: a rounded tile in the mint of the robot's helmet with the two
// initials drawn as one stroke each, in the ground colour. The nav gives it
// the same little hop as the rest of the site's marks.
export const F_PATH = "M16 10.2H9.4v11.6M9.4 16h4.8";
export const S_PATH = "M24.4 11.7c-.7-1.1-1.9-1.7-3.3-1.7-1.9 0-3.3 1.1-3.3 2.6 0 1.5 1.1 2.1 3.2 2.6 2.2.5 3.7 1.2 3.7 3.1 0 1.8-1.5 3.2-3.7 3.2-1.6 0-2.9-.6-3.7-1.8";

export function FsMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={`mark${className ? ` ${className}` : ""}`} aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="28" height="28" rx="9" fill="currentColor" />
      <g className="letter" fill="none" stroke="#06111a" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={F_PATH} />
        <path d={S_PATH} />
      </g>
    </svg>
  );
}
