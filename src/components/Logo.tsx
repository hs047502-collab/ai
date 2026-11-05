import { useId } from "react";

export function LogoMark({ className = "h-14 w-14" }: { className?: string }) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");
  const headId = `hriday-head-${uid}`;
  const brainA = `hriday-brain-a-${uid}`;
  const brainB = `hriday-brain-b-${uid}`;
  const brainC = `hriday-brain-c-${uid}`;
  const brainD = `hriday-brain-d-${uid}`;
  const clipId = `hriday-clip-${uid}`;

  return (
    <svg
      viewBox="0 0 128 128"
      className={className}
      role="img"
      aria-label="Hriday AI Studio logo"
    >
      <defs>
        <linearGradient id={headId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a1672" />
          <stop offset="100%" stopColor="#14063f" />
        </linearGradient>
        <linearGradient id={brainA} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id={brainB} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id={brainC} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id={brainD} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <clipPath id={clipId}>
          <path d="M62 12c-24 0-42 17-42 41 0 13 5 21 11 28 3 4 5 8 5 13v18c0 4 3 7 7 7h23c8 0 14-4 18-11 12-5 21-17 21-32 0-15-6-26-15-34-2-9-9-17-17-22-4-4-7-8-11-8Z" />
        </clipPath>
      </defs>

      {/* dotted halo */}
      <g fill="#8b5cf6" opacity="0.8">
        <circle cx="14" cy="34" r="2.2" />
        <circle cx="11" cy="44" r="1.7" />
        <circle cx="16" cy="53" r="1.4" />
        <circle cx="12" cy="62" r="2" />
        <circle cx="49" cy="8" r="1.8" />
        <circle cx="39" cy="5" r="1.3" />
        <circle cx="58" cy="4" r="1.5" />
        <circle cx="72" cy="6" r="1.2" />
      </g>

      {/* head silhouette */}
      <path
        d="M62 12c-24 0-42 17-42 41 0 13 5 21 11 28 3 4 5 8 5 13v18c0 4 3 7 7 7h23c8 0 14-4 18-11 12-5 21-17 21-32 0-15-6-26-15-34-2-9-9-17-17-22-4-4-7-8-11-8Z"
        fill={`url(#${headId})`}
      />

      {/* brain lobes */}
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M59 21c-9 0-16 5-17 13-6 2-9 7-9 13 0 5 3 9 7 11-1 6 3 12 10 13 2 5 7 8 13 8V21h-4Z"
          fill={`url(#${brainA})`}
        />
        <path
          d="M64 21v38c6 0 11-3 13-8 7-1 11-7 10-13 4-2 7-6 7-11 0-6-3-11-9-13-1-8-8-13-17-13h-4Z"
          fill={`url(#${brainB})`}
        />
        <path
          d="M60 60c-7 0-12 4-13 10 4 1 7 4 8 8-4 3-5 8-2 12h7V60Z"
          fill={`url(#${brainC})`}
        />
        <path
          d="M68 60c7 0 12 4 13 10-4 1-7 4-8 8 4 3 5 8 2 12h-7V60Z"
          fill={`url(#${brainD})`}
        />
        <g fill="none" stroke="#f8fafc" strokeWidth="1.6" strokeLinecap="round" opacity="0.75">
          <path d="M49 32c5 1 8 4 9 8" />
          <path d="M46 45c4-1 8 0 11 3" />
          <path d="M55 55c-3 1-5 4-5 7" />
          <path d="M75 30c-4 2-7 5-8 9" />
          <path d="M81 43c-4-1-8 0-11 3" />
          <path d="M72 55c3 1 5 4 5 7" />
          <path d="M58 70c3 1 5 3 6 6" />
          <path d="M72 70c-3 1-5 3-6 6" />
        </g>
      </g>

      {/* circuit nodes on brain */}
      <g>
        <circle cx="52" cy="35" r="2.4" fill="#e0f2fe" />
        <circle cx="76" cy="33" r="2.2" fill="#fce7f3" />
        <circle cx="60" cy="49" r="2" fill="#dcfce7" />
        <circle cx="80" cy="51" r="2.4" fill="#fef3c7" />
      </g>

      {/* face profile line */}
      <path
        d="M95 67c5 0 9-3 11-7 1-3 0-6-3-7-2 0-4 0-6-1"
        fill="none"
        stroke="#1c1150"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}

export function LogoLockup({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <LogoMark className={compact ? "h-10 w-10" : "h-[74px] w-[74px]"} />
      <div className={compact ? "mt-1" : "mt-2"}>
        <p
          className={`font-extrabold tracking-tight ${compact ? "text-[15px]" : "text-[22px]"}`}
          style={{ color: "var(--ink)" }}
        >
          Hriday <span className="text-violet-600 dark:text-violet-400">AI Studio</span>
        </p>
        {!compact && (
          <p className="mt-0.5 text-[10.5px] font-medium tracking-[0.04em] text-violet-500 dark:text-violet-300">
            Create • Edit • Innovate
          </p>
        )}
      </div>
    </div>
  );
}
