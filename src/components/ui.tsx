import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export const accentGradients: Record<string, string> = {
  purple: "from-violet-500 to-purple-700",
  violet: "from-[#8b5cf6] to-[#6d28d9]",
  green: "from-[#34d399] to-[#0f9d58]",
  red: "from-[#fb7185] to-[#dc2626]",
  blue: "from-[#38bdf8] to-[#2563eb]",
  sky: "from-[#7dd3fc] to-[#0ea5e9]",
  orange: "from-[#fdba74] to-[#f97316]",
  pink: "from-[#f9a8d4] to-[#db2777]",
  cyan: "from-[#67e8f9] to-[#0891b2]",
  teal: "from-[#5eead4] to-[#0d9488]",
};

export function IconTile({
  icon: Icon,
  accent = "purple",
  className,
  size = "md",
}: {
  icon: LucideIcon;
  accent?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-8 w-8 rounded-[10px] [&>svg]:h-4 [&>svg]:w-4",
    md: "h-10 w-10 rounded-xl [&>svg]:h-5 [&>svg]:w-5",
    lg: "h-12 w-12 rounded-2xl [&>svg]:h-6 [&>svg]:w-6",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-gradient-to-br text-white shadow-sm",
        accentGradients[accent] ?? accentGradients.purple,
        sizes[size],
        className
      )}
    >
      <Icon />
    </span>
  );
}

export function Card({
  children,
  className,
  flat = false,
}: {
  children: ReactNode;
  className?: string;
  flat?: boolean;
}) {
  return <div className={cn(flat ? "card-flat" : "card", className)}>{children}</div>;
}

export function CardHeading({
  title,
  icon,
  accent = "purple",
  right,
}: {
  title: string;
  icon: LucideIcon;
  accent?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <IconTile icon={icon} accent={accent} size="sm" />
        <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  icon,
  accent = "purple",
  actions,
  eyebrow,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-[26px] border border-[var(--line)] bg-[var(--surface)] px-5 py-5 shadow-[var(--shadow)] sm:px-6">
      <div className="flex items-center gap-4">
        <IconTile icon={icon} accent={accent} size="lg" />
        <div>
          {eyebrow && (
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-500">
              {eyebrow}
            </p>
          )}
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
          <p className="muted mt-1 text-xs sm:text-[13px]">{subtitle}</p>
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CreditPill({
  remaining,
  label,
  icon: Icon,
}: {
  remaining: number;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-violet-50 px-3.5 py-2 text-xs font-semibold text-violet-700 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-200">
      <Icon className="h-4 w-4" />
      {remaining} {label}
    </span>
  );
}

export function ProgressBar({
  value,
  max,
  tone = "violet",
  className,
}: {
  value: number;
  max: number;
  tone?: "violet" | "green" | "orange";
  className?: string;
}) {
  const percent = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  const tones = {
    violet: "from-[#a78bfa] to-[#7c3aed]",
    green: "from-[#4ade80] to-[#16a34a]",
    orange: "from-[#fdba74] to-[#f97316]",
  };
  return (
    <div
      className={cn("h-2.5 w-full overflow-hidden rounded-full", className)}
      style={{ background: "var(--track)" }}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", tones[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function GhostButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn("btn btn-ghost", className)} {...props}>
      {children}
    </button>
  );
}

export function PrimaryButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn("btn btn-primary", className)} {...props}>
      {children}
    </button>
  );
}

export function GreenButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn("btn btn-green", className)} {...props}>
      {children}
    </button>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-soft)] px-6 py-12 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-purple-200 text-violet-600 dark:from-violet-500/20 dark:to-purple-500/10 dark:text-violet-300">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="text-[15px] font-semibold">{title}</h3>
      <p className="muted mt-1.5 max-w-sm text-xs leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatusChip({
  children,
  tone = "violet",
  className,
}: {
  children: ReactNode;
  tone?: "violet" | "green" | "orange" | "blue" | "rose";
  className?: string;
}) {
  const tones = {
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-300 border-violet-500/20",
    green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20",
    orange: "bg-orange-500/10 text-orange-600 dark:text-orange-300 border-orange-500/20",
    blue: "bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/20",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function LinkArrow({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 transition hover:text-violet-800 dark:text-violet-300 dark:hover:text-violet-200"
    >
      {children}
      <ArrowUpRight className="h-3.5 w-3.5" />
    </button>
  );
}

export function ProBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
      <Sparkles className="h-3 w-3" /> Pro
    </span>
  );
}
