import { useState } from "react";
import {
  BellRing,
  CheckCircle2,
  CircleUserRound,
  CreditCard,
  Crown,
  KeyRound,
  LogOut,
  Mail,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
  Video,
  Image as ImageIcon,
  AudioLines,
  Users,
  CalendarDays,
  ArrowRight,
  Lock,
} from "lucide-react";
import {
  Card,
  CardHeading,
  IconTile,
  PageHeader,
  ProgressBar,
  StatusChip,
} from "../components/ui";
import { useApp } from "../store";
import { cn } from "../utils/cn";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition",
        checked ? "bg-gradient-to-r from-violet-500 to-purple-600" : "bg-[var(--track)]"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all",
          checked ? "left-[22px]" : "left-0.5"
        )}
      />
    </button>
  );
}

export function Account() {
  const {
    user,
    openAuth,
    signOut,
    theme,
    toggleTheme,
    geminiKey,
    openGemini,
    removeGeminiKey,
    videoUsed,
    imageUsed,
    allowance,
    remainingVideo,
    remainingImages,
    generations,
    characters,
    clearStudio,
    pushToast,
  } = useApp();

  const [autoplay, setAutoplay] = useState(true);
  const [emails, setEmails] = useState(true);
  const [productNews, setProductNews] = useState(false);

  if (!user) {
    return (
      <div className="fade-in">
        <PageHeader
          icon={CircleUserRound}
          accent="blue"
          title="My Account"
          subtitle="Your credits, library and studio preferences"
          eyebrow="Studio"
        />
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="relative overflow-hidden p-6 text-center">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-300/25 blur-3xl dark:bg-violet-600/10" />
            <div className="relative">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-[0_16px_30px_-16px_rgba(109,40,217,.9)]">
                <UserRound className="h-7 w-7" />
              </span>
              <h2 className="mt-4 text-xl font-bold">Sign in to your studio</h2>
              <p className="muted mx-auto mt-2 max-w-sm text-[12px] leading-relaxed">
                Unlock your personal library, track credits across every tool and connect a Gemini
                API key for smarter creative direction.
              </p>
              <div className="mx-auto mt-5 grid max-w-md gap-2 text-left">
                {[
                  "Save and organise every generation",
                  "Track video and image credits live",
                  "Connect Gemini for AI-assisted prompts",
                  "Pick up where you left off on any device",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <p className="text-[10.5px] font-medium">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button onClick={openAuth} className="btn btn-primary !px-6 !py-3">
                  Sign in or create account <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => pushToast("Connecting Gemini requires a studio account.", "info")}
                  className="btn btn-soft !py-3"
                >
                  <Sparkles className="h-4 w-4" /> About Gemini
                </button>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-4 sm:p-5">
              <CardHeading icon={Crown} accent="orange" title="Free plan includes" />
              <ul className="mt-3 space-y-2">
                {[
                  "1000 video credits / month",
                  "1000 image credits / month",
                  "Unlimited voiceovers & characters",
                  "30 days of library history",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-xl border border-amber-300/40 bg-amber-50/80 p-3 dark:bg-amber-400/5">
                <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-amber-700 dark:text-amber-200">
                  <Lock className="h-3.5 w-3.5" /> Gemini API requires sign in
                </p>
                <p className="mt-1 text-[9.5px] leading-relaxed text-amber-700/80 dark:text-amber-200/70">
                  Your API key stays on your device — we never store or transmit it.
                </p>
              </div>
            </Card>
            <Card className="p-4 sm:p-5">
              <CardHeading icon={ShieldCheck} accent="green" title="Privacy first" />
              <p className="muted mt-2 text-[10.5px] leading-relaxed">
                Studio accounts are stored in this browser for the demo. No passwords, prompts or API
                keys leave your device.
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const favoriteCount = generations.filter((g) => g.favorite).length;
  const joined = new Date(user.joinedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="fade-in">
      <PageHeader
        icon={CircleUserRound}
        accent="blue"
        title="My Account"
        subtitle="Manage your profile, plan and studio preferences"
        eyebrow="Studio"
        actions={
          <>
            <StatusChip tone="green">
              <ShieldCheck className="h-2.5 w-2.5" /> Signed in
            </StatusChip>
            <button onClick={signOut} className="btn btn-ghost !py-2.5">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="relative h-24 bg-gradient-to-r from-[#4c1d95] via-[#7c3aed] to-[#c084fc]">
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(255,255,255,.6) 1px, transparent 0)",
                  backgroundSize: "18px 18px",
                }}
              />
              <span className="absolute right-3 top-3 rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur">
                Free plan
              </span>
            </div>
            <div className="relative px-4 pb-4 sm:px-5 sm:pb-5">
              <div className="-mt-9 flex items-end justify-between gap-3">
                <span className="flex h-[72px] w-[72px] items-center justify-center rounded-3xl border-4 border-[var(--surface)] bg-gradient-to-br from-violet-500 to-purple-700 text-2xl font-bold text-white shadow-lg">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                <button
                  onClick={() => pushToast("Profile editing is coming soon in v6.1.", "info")}
                  className="btn btn-soft mb-1 !py-2 text-[10px]"
                >
                  Edit profile
                </button>
              </div>
              <div className="mt-2.5">
                <h2 className="text-lg font-bold">{user.name}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="muted flex items-center gap-1 text-[10px]">
                    <Mail className="h-3 w-3" /> {user.email}
                  </span>
                  <span className="muted flex items-center gap-1 text-[10px]">
                    <CalendarDays className="h-3 w-3" /> Joined {joined}
                  </span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { label: "Creations", value: generations.length, icon: Sparkles },
                  { label: "Favourites", value: favoriteCount, icon: ShieldCheck },
                  { label: "Characters", value: characters.length, icon: Users },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="soft-panel px-2.5 py-2 text-center">
                    <Icon className="mx-auto h-3.5 w-3.5 text-violet-500" />
                    <p className="mt-1 text-sm font-bold">{value}</p>
                    <p className="muted text-[8.5px]">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <CardHeading
              icon={CreditCard}
              accent="violet"
              title="Plan & credit usage"
              right={
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                  Free
                </span>
              }
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="soft-panel p-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                    <Video className="h-3.5 w-3.5 text-rose-500" /> Video credits
                  </span>
                  <span className="text-[10px] font-bold text-rose-500">{remainingVideo} left</span>
                </div>
                <p className="muted mt-1 text-[9.5px]">{videoUsed} of {allowance} used</p>
                <ProgressBar value={videoUsed} max={allowance} className="mt-2 !h-2" />
              </div>
              <div className="soft-panel p-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                    <ImageIcon className="h-3.5 w-3.5 text-violet-500" /> Image credits
                  </span>
                  <span className="text-[10px] font-bold text-violet-500">{remainingImages} left</span>
                </div>
                <p className="muted mt-1 text-[9.5px]">{imageUsed} of {allowance} used</p>
                <ProgressBar value={imageUsed} max={allowance} tone="green" className="mt-2 !h-2" />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-violet-200/50 bg-violet-50/70 px-3 py-2.5 dark:bg-violet-500/5">
              <div>
                <p className="text-[10.5px] font-semibold">Need more room to create?</p>
                <p className="muted text-[9px]">Pro adds 400 monthly credits and 4K exports.</p>
              </div>
              <button
                onClick={() => pushToast("You're on the Pro waitlist — we'll email you soon.")}
                className="btn btn-primary !py-2 text-[10px]"
              >
                Upgrade <Crown className="h-3 w-3" />
              </button>
            </div>
            <p className="muted mt-2 text-[9px]">
              Credits refresh on the 1st of every month. Failed generations are never charged.
            </p>
          </Card>

          <Card className="p-4 sm:p-5">
            <CardHeading icon={KeyRound} accent="green" title="API & integrations" />
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-3">
              <IconTile icon={Sparkles} accent={geminiKey ? "green" : "purple"} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-semibold">Google Gemini API</p>
                <p className="muted mt-0.5 truncate text-[9.5px]">
                  {geminiKey
                    ? `Connected · ${geminiKey.slice(0, 4)}••••${geminiKey.slice(-4)}`
                    : "Not connected — add a key to unlock AI assist"}
                </p>
              </div>
              {geminiKey ? (
                <div className="flex gap-1.5">
                  <button onClick={openGemini} className="btn btn-soft !py-2 text-[10px]">
                    Manage
                  </button>
                  <button onClick={removeGeminiKey} className="btn btn-red !py-2 text-[10px]">
                    Disconnect
                  </button>
                </div>
              ) : (
                <button onClick={openGemini} className="btn btn-green !py-2 text-[10px]">
                  Connect key
                </button>
              )}
            </div>
            <p className="muted mt-2 flex items-start gap-1.5 text-[9px] leading-relaxed">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
              Your Gemini key is stored only in this browser&apos;s local storage and is never sent to
              our servers.
            </p>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 sm:p-5">
            <CardHeading icon={Sparkles} accent="violet" title="Preferences" />
            <div className="mt-3 divide-y divide-[var(--line)]">
              <div className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-soft)]">
                    {theme === "light" ? <Moon className="h-3.5 w-3.5 text-violet-500" /> : <Sun className="h-3.5 w-3.5 text-amber-500" />}
                  </span>
                  <div>
                    <p className="text-[10.5px] font-semibold">Dark mode</p>
                    <p className="muted text-[8.5px]">Easier on the eyes at night</p>
                  </div>
                </div>
                <Toggle checked={theme === "dark"} onChange={toggleTheme} label="Dark mode" />
              </div>
              <div className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-soft)]">
                    <Video className="h-3.5 w-3.5 text-rose-500" />
                  </span>
                  <div>
                    <p className="text-[10.5px] font-semibold">Autoplay previews</p>
                    <p className="muted text-[8.5px]">Play rendered clips on open</p>
                  </div>
                </div>
                <Toggle checked={autoplay} onChange={setAutoplay} label="Autoplay previews" />
              </div>
              <div className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-soft)]">
                    <BellRing className="h-3.5 w-3.5 text-orange-500" />
                  </span>
                  <div>
                    <p className="text-[10.5px] font-semibold">Email updates</p>
                    <p className="muted text-[8.5px]">Studio news and offers</p>
                  </div>
                </div>
                <Toggle checked={emails} onChange={setEmails} label="Email updates" />
              </div>
              <div className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-soft)]">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                  </span>
                  <div>
                    <p className="text-[10.5px] font-semibold">Product experiments</p>
                    <p className="muted text-[8.5px]">Try early FlowGen features</p>
                  </div>
                </div>
                <Toggle checked={productNews} onChange={setProductNews} label="Product experiments" />
              </div>
            </div>
            <button
              onClick={() => pushToast("Preferences saved for this session.")}
              className="btn btn-soft mt-3 w-full !py-2.5 text-[10.5px]"
            >
              Save preferences
            </button>
          </Card>

          <Card className="p-4 sm:p-5">
            <CardHeading icon={AudioLines} accent="orange" title="Studio activity" />
            <div className="mt-3 space-y-2">
              {[
                { icon: Video, label: "Videos generated", value: generations.filter((g) => g.kind === "video").length, accent: "text-rose-500" },
                { icon: ImageIcon, label: "Images generated", value: generations.filter((g) => g.kind === "image").length, accent: "text-violet-500" },
                { icon: AudioLines, label: "Voiceovers", value: generations.filter((g) => g.kind === "speech").length, accent: "text-orange-500" },
                { icon: Users, label: "Characters", value: characters.length, accent: "text-blue-500" },
              ].map(({ icon: Icon, label, value, accent }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <Icon className={cn("h-3.5 w-3.5", accent)} />
                  <span className="flex-1 text-[10.5px]">{label}</span>
                  <span className="rounded-md bg-[var(--surface-soft)] px-2 py-0.5 text-[10px] font-bold">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <CardHeading icon={RotateCcw} accent="orange" title="Studio data" />
            <p className="muted mt-2 text-[10.5px] leading-relaxed">
              Resetting clears generated assets, saved characters and API keys from this device. Your
              account stays intact.
            </p>
            <button
              onClick={() => {
                if (window.confirm("Reset studio data? This clears your library, characters and Gemini key on this device.")) {
                  clearStudio();
                  removeGeminiKey();
                }
              }}
              className="btn btn-ghost mt-3 w-full !border-rose-300/50 !py-2.5 text-[10.5px] !text-rose-600 hover:!bg-rose-50 dark:!text-rose-300 dark:hover:!bg-rose-500/10"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset studio data
            </button>
            <div className="muted mt-2 flex items-center justify-center gap-1 text-[8.5px]">
              <ShieldCheck className="h-2.5 w-2.5" /> Demo account · local storage only
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
