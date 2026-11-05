import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Film,
  Image as ImageIcon,
  Info,
  Layers3,
  Moon,
  Play,
  Sparkles,
  Sun,
  UploadCloud,
  UserRound,
  Video,
  Wand2,
} from "lucide-react";
import { Card, CardHeading, IconTile, ProgressBar } from "../components/ui";
import { UnlockIcon } from "../components/Modals";
import { TUTORIAL_POSTER, useApp } from "../store";
import { cn } from "../utils/cn";

function HeroWaves() {
  return (
    <svg
      viewBox="0 0 900 320"
      className="pointer-events-none absolute -right-24 -top-28 h-[420px] w-[860px] max-w-none opacity-55 sm:opacity-100"
      aria-hidden
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="hero-wave-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="hero-wave-violet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id="hero-wave-pale" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ede9fe" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ddd6fe" stopOpacity="0.1" />
        </linearGradient>
        <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="700" cy="80" r="220" fill="url(#hero-glow)" />
      <path
        d="M60 190C190 70 320 52 455 96c120 39 170 108 300 74 64-17 111-58 165-94v260H60Z"
        fill="url(#hero-wave-pale)"
      />
      <path
        d="M160 212C282 92 404 76 536 124c116 42 168 96 306 48 22-8 44-18 68-30v200H160Z"
        fill="url(#hero-wave-blue)"
      />
      <path
        d="M320 232c104-92 208-108 324-62 100 40 156 78 276 34v140H320Z"
        fill="url(#hero-wave-violet)"
      />
      <g fill="#ffffff" opacity="0.5">
        <circle cx="620" cy="40" r="4" />
        <circle cx="782" cy="118" r="3" />
        <circle cx="530" cy="22" r="2.5" />
      </g>
    </svg>
  );
}

function StatCard({
  icon,
  accent,
  value,
  label,
  hint,
}: {
  icon: typeof Video;
  accent: string;
  value: string | number;
  label: string;
  hint?: string;
}) {
  return (
    <Card className="group relative overflow-hidden !rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-0.5 sm:p-5">
      <svg
        viewBox="0 0 200 90"
        className="pointer-events-none absolute -bottom-2 right-0 h-[80px] w-[150px] opacity-70"
        aria-hidden
      >
        <path
          d="M0 74c34-32 64-34 96-10 28 21 56 18 104-10v36H0Z"
          fill="currentColor"
          className="text-violet-100 dark:text-violet-500/10"
        />
        <path
          d="M34 84c30-26 56-26 84-6 22 16 44 12 82-10v22H34Z"
          fill="currentColor"
          className="text-sky-100 dark:text-sky-500/10"
        />
      </svg>
      <div className="relative">
        <IconTile icon={icon} accent={accent} size="md" className="mb-3" />
        <p className="text-[30px] font-bold leading-none tracking-tight sm:text-[32px]">{value}</p>
        <p className="muted mt-2 text-[11.5px] font-medium sm:text-xs">{label}</p>
        {hint && <p className="mt-0.5 text-[9.5px] text-violet-500 dark:text-violet-300">{hint}</p>}
      </div>
    </Card>
  );
}

export function Dashboard() {
  const {
    user,
    theme,
    toggleTheme,
    openAuth,
    openGemini,
    openTutorial,
    videoUsed,
    imageUsed,
    allowance,
    chart,
    generations,
    geminiKey,
    setPage,
    maxConcurrent,
  } = useApp();

  const videos = generations.filter((g) => g.kind === "video").length;
  const images = generations.filter((g) => g.kind === "image").length;
  const firstName = user ? user.name.split(" ")[0] : "";
  const weekTotal = chart.reduce((sum, day) => sum + day.count, 0);
  const maxBar = Math.max(1, ...chart.map((day) => day.count));
  const maskedKey = geminiKey ? `${geminiKey.slice(0, 4)}••••${geminiKey.slice(-4)}` : "";

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="hero-surface relative mb-5 overflow-hidden rounded-[26px] border border-white/60 px-4 pb-6 pt-6 shadow-[var(--shadow)] sm:px-7 sm:pb-8 sm:pt-7 dark:border-white/5">
        <HeroWaves />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-stretch gap-3.5 sm:gap-4">
            <span className="w-[5px] shrink-0 rounded-full bg-gradient-to-b from-[#7c3aed] via-[#8b5cf6] to-[#c4b5fd]" />
            <div>
              <h1 className="text-[26px] font-extrabold leading-tight tracking-tight sm:text-[38px]">
                Welcome back{firstName ? `, ${firstName}` : ""}
              </h1>
              <p className="mt-1 text-[12px] font-medium text-[#4b3a78] sm:text-[15px] dark:text-violet-200/80">
                Here&apos;s what&apos;s happening in your studio
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/80 px-3 py-2 text-[11.5px] font-semibold text-[#3d2c6b] shadow-sm backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-violet-100 dark:hover:bg-white/10"
              aria-label="Toggle color theme"
            >
              {theme === "light" ? (
                <Moon className="h-3.5 w-3.5 text-violet-600" />
              ) : (
                <Sun className="h-3.5 w-3.5 text-amber-300" />
              )}
              {theme === "light" ? "Dark" : "Light"}
            </button>

            <button
              onClick={openGemini}
              className="btn btn-green !rounded-full !px-3.5 !py-2.5 text-[10.5px] sm:text-[11.5px]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">How to get Gemini key - press me</span>
              <span className="sm:hidden">Get Gemini key</span>
            </button>

            <button
              onClick={openAuth}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/80 px-3 py-2 text-[11px] font-semibold text-[#3d2c6b] shadow-sm backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-violet-100 dark:hover:bg-white/10"
            >
              <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface-soft)]">
                <UserRound className="h-3.5 w-3.5" />
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white",
                    user ? "bg-emerald-500" : "bg-zinc-400"
                  )}
                />
              </span>
              <span className="max-w-[140px] truncate">
                {user ? user.name : "- Not signed in"}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          icon={Video}
          accent="sky"
          value={videos}
          label="Videos generated"
          hint={user ? `${Math.max(0, allowance - videoUsed)} credits left` : undefined}
        />
        <StatCard
          icon={ImageIcon}
          accent="green"
          value={images}
          label="Images generated"
          hint={user ? `${Math.max(0, allowance - imageUsed)} credits left` : undefined}
        />
        <StatCard icon={Layers3} accent="violet" value={maxConcurrent} label="Max concurrent" />
        <StatCard
          icon={CalendarDays}
          accent="orange"
          value={user ? "30 days" : "0 days"}
          label="License expires"
          hint={user ? "Free plan active" : undefined}
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.85fr_1fr]">
        <div className="flex flex-col gap-4">
          {/* Activity chart */}
          <Card className="p-4 sm:p-5">
            <CardHeading
              icon={Clock3}
              title="Last 7 days"
              right={
                <div className="flex items-center gap-2">
                  <span className="chip !text-[10px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" /> Generations
                  </span>
                  <span className="text-[10.5px] font-semibold text-violet-600 dark:text-violet-300">
                    {weekTotal} this week
                  </span>
                </div>
              }
            />
            <div className="relative mt-5">
              {weekTotal === 0 && (
                <p className="muted pointer-events-none absolute left-1/2 top-6 z-10 -translate-x-1/2 whitespace-nowrap text-[10.5px]">
                  No generations yet — your next creation starts here.
                </p>
              )}
              <div className="flex h-[86px] items-end gap-2 sm:gap-4">
                {chart.map((day, index) => {
                  const height = day.count ? 26 + (day.count / maxBar) * 54 : 7;
                  return (
                    <div
                      key={day.date}
                      className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                      title={`${day.count} generation${day.count === 1 ? "" : "s"} on ${day.label}`}
                    >
                      {day.count > 0 && (
                        <span className="text-[9.5px] font-bold text-violet-500 dark:text-violet-300">
                          {day.count}
                        </span>
                      )}
                      <div
                        className={cn(
                          "w-full max-w-[104px] rounded-full transition-all duration-500 group-hover:opacity-85",
                          day.isToday
                            ? "bg-gradient-to-r from-[#22c55e] to-[#0f9d58]"
                            : index === chart.length - 2
                              ? "bg-[#d7c8fb] dark:bg-[#3a2b60]"
                              : "bg-[#d9cbf8] dark:bg-[#33284f]"
                        )}
                        style={{ height: `${day.isToday ? Math.max(height, 10) : height}px` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-2 sm:gap-4">
                {chart.map((day) => (
                  <span
                    key={day.date}
                    className={cn(
                      "text-center text-[10.5px] font-medium",
                      day.isToday
                        ? "font-bold text-emerald-600 dark:text-emerald-300"
                        : "muted"
                    )}
                  >
                    {day.label}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Tutorial */}
          <Card className="flex flex-1 flex-col p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <IconTile icon={Play} accent="violet" size="sm" className="[&>svg]:fill-white" />
                <h2 className="text-[16px] font-semibold tracking-tight">Watch: how FlowGen works</h2>
              </div>
              <button
                onClick={openTutorial}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--muted)] transition hover:text-violet-600 dark:hover:text-violet-300"
              >
                Full tutorial - click to watch
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-white">
                  <Play className="h-2 w-2 fill-white" />
                </span>
              </button>
            </div>

            <button
              onClick={openTutorial}
              className="group relative mt-4 block aspect-[16/8] w-full overflow-hidden rounded-2xl bg-[#100b22] text-left shadow-inner sm:aspect-[16/7]"
              aria-label="Play the FlowGen tutorial"
            >
              <img
                src={TUTORIAL_POSTER}
                alt="Purple and blue abstract FlowGen tutorial preview"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0920] via-[#0d0920]/35 to-[#0d0920]/20" />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 backdrop-blur">
                <Film className="h-3 w-3 text-violet-300" />
                <span className="text-[9.5px] font-semibold text-white/90">
                  FlowGen · Studio tutorial
                </span>
              </div>
              <span className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/30 px-2 py-1 text-[9px] font-medium text-white/70 backdrop-blur">
                2:14
              </span>
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="animate-pulse-ring flex h-[58px] w-[58px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff3b30] to-[#dc2626] shadow-[0_14px_30px_-10px_rgba(239,68,68,0.9)] transition group-hover:scale-110 sm:h-[70px] sm:w-[70px]">
                  <Play className="ml-0.5 h-7 w-7 fill-white text-white sm:h-8 sm:w-8" />
                </span>
              </span>
              <span className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="text-[11px] font-medium text-white/80">
                  From prompt to final cut in one flow
                </span>
                <span className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1 rounded-full",
                        i === 0 ? "w-5 bg-violet-400" : "w-1.5 bg-white/25"
                      )}
                    />
                  ))}
                </span>
              </span>
            </button>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          {/* Plan */}
          <Card className="p-4 sm:p-5">
            <CardHeading
              icon={ClipboardList}
              title="Your plan"
              right={
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                  Free
                </span>
              }
            />
            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[11.5px] font-medium">
                  <span>Video Credits : {videoUsed} used</span>
                  <span className="muted">{allowance - videoUsed} left</span>
                </div>
                <ProgressBar value={videoUsed} max={allowance} />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[11.5px] font-medium">
                  <span>Image Credits : {imageUsed} used</span>
                  <span className="muted">{allowance - imageUsed} left</span>
                </div>
                <ProgressBar value={imageUsed} max={allowance} tone="green" />
              </div>
            </div>
            <div className="mt-5 flex items-start gap-2 border-t border-[var(--line)] pt-4">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500 dark:text-violet-300" />
              <p className="muted text-[10.5px] leading-relaxed">
                20 credits per generation - failed generations are free (credits are only used on a
                successful download).
              </p>
            </div>
            <button
              onClick={() => setPage("account")}
              className="muted mt-3 flex w-full items-center justify-center gap-1.5 text-[10.5px] font-semibold text-violet-600 transition hover:text-violet-800 dark:text-violet-300 dark:hover:text-violet-200"
            >
              View usage & billing
              <UploadCloud className="h-3 w-3 rotate-180" />
            </button>
          </Card>

          {/* Gemini */}
          <Card className="relative flex flex-1 flex-col items-center justify-center overflow-hidden p-5 text-center">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-200/30 blur-2xl dark:bg-violet-500/10" />
            {!user ? (
              <>
                <UnlockIcon />
                <h2 className="mt-4 text-[19px] font-bold tracking-tight">Gemini API</h2>
                <p className="muted mt-1.5 max-w-[260px] text-[11.5px] leading-relaxed">
                  Please sign in first to use this feature.
                </p>
                <button onClick={openAuth} className="btn btn-primary mt-4 !px-4 !py-2.5 text-[11px]">
                  <UserRound className="h-3.5 w-3.5" /> Sign in to unlock
                </button>
                <p className="muted mt-3 flex items-center gap-1 text-[9.5px]">
                  <Wand2 className="h-3 w-3" /> Smart prompts, scripts & direction
                </p>
              </>
            ) : geminiKey ? (
              <>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-200 text-emerald-600 dark:from-emerald-400/20 dark:to-teal-500/10 dark:text-emerald-300">
                  <CheckCircle2 className="h-7 w-7" />
                </span>
                <h2 className="mt-4 text-[19px] font-bold tracking-tight">Gemini connected</h2>
                <p className="muted mt-1.5 text-[11.5px]">Key {maskedKey} · stored locally</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button onClick={openGemini} className="btn btn-primary !px-4 !py-2.5 text-[11px]">
                    <Sparkles className="h-3.5 w-3.5" /> Manage key
                  </button>
                  <button
                    onClick={() => setPage("video")}
                    className="btn btn-ghost !px-4 !py-2.5 text-[11px]"
                  >
                    Create with Gemini
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-200 text-emerald-600 dark:from-emerald-400/20 dark:to-teal-500/10 dark:text-emerald-300">
                  <Sparkles className="h-7 w-7" />
                </span>
                <h2 className="mt-4 text-[19px] font-bold tracking-tight">Gemini API</h2>
                <p className="muted mt-1.5 max-w-[260px] text-[11.5px] leading-relaxed">
                  You&apos;re signed in. Add your Gemini key to unlock AI-assisted creation.
                </p>
                <button
                  onClick={openGemini}
                  className="btn btn-green mt-4 !px-4 !py-2.5 text-[11px]"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Connect API key
                </button>
              </>
            )}
          </Card>
        </div>
      </div>

      <footer className="muted mt-5 flex flex-wrap items-center justify-between gap-2 px-1 pb-2 text-[10px]">
        <p>© 2026 Hriday AI Studio · Create • Edit • Innovate</p>
        <div className="flex items-center gap-3">
          <button onClick={openTutorial} className="transition hover:text-violet-500">
            Studio guide
          </button>
          <span className="h-1 w-1 rounded-full bg-[var(--line-strong)]" />
          <button onClick={openGemini} className="transition hover:text-violet-500">
            Gemini help
          </button>
          <span className="h-1 w-1 rounded-full bg-[var(--line-strong)]" />
          <span>v6.0.1</span>
        </div>
      </footer>
    </div>
  );
}
