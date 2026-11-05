import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Link2,
  Loader2,
  Lock,
  LogOut,
  Play,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Unlock,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { TUTORIAL_POSTER, TUTORIAL_VIDEO, useApp } from "../store";
import { cn } from "../utils/cn";

function ModalShell({
  children,
  onClose,
  title,
  subtitle,
  icon,
  accent = "bg-gradient-to-br from-violet-500 to-purple-700",
  wide = false,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  accent?: string;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-[#100a26]/65 p-4 backdrop-blur-[3px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={cn(
          "pop-in relative my-auto w-full overflow-hidden rounded-[26px] border border-[var(--line)] bg-[var(--surface)] shadow-2xl",
          wide ? "max-w-3xl" : "max-w-[470px]"
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm",
                accent
              )}
            >
              {icon}
            </span>
            <div>
              <h2 className="text-[17px] font-bold tracking-tight">{title}</h2>
              {subtitle && <p className="muted mt-0.5 text-[11.5px]">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full bg-[var(--surface-soft)] p-2 text-[var(--muted)] transition hover:bg-[var(--track)] hover:text-[var(--ink)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[78vh] overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------- Auth modal ------------------------------- */

export function AuthModal() {
  const { authOpen, closeAuth, signIn, user, signOut, openGemini } = useApp();
  const [mode, setMode] = useState<"signin" | "register" | "renewal">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authOpen) {
      setError("");
      setBusy(false);
    }
  }, [authOpen]);

  if (!authOpen) return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    if (mode === "register" && name.trim().length < 2) {
      setError("Please tell us your name.");
      return;
    }
    const displayName =
      mode === "register" ? name.trim() : email.split("@")[0].replace(/[._-]/g, " ");
    setBusy(true);
    window.setTimeout(() => {
      signIn(displayName.replace(/\b\w/g, (c) => c.toUpperCase()), email.trim());
    }, 550);
  };

  const demoSignIn = () => {
    setBusy(true);
    window.setTimeout(() => signIn("Hriday Sharma", "hriday@studio.ai"), 400);
  };

  return (
    <ModalShell
      onClose={closeAuth}
      title={user ? "Your studio account" : mode === "signin" ? "Welcome back" : "Create your studio"}
      subtitle={
        user
          ? "You are signed in to Hriday AI Studio"
          : "Unlock Gemini, credits and your personal library"
      }
      icon={<UserRound className="h-5 w-5" />}
    >
      {user ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 text-lg font-bold text-white">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="muted truncate text-xs">{user.email}</p>
            </div>
            <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-emerald-500" />
          </div>
          <div className="grid gap-2">
            <button className="btn btn-primary w-full" onClick={openGemini}>
              <KeyRound className="h-4 w-4" /> Manage Gemini API key
            </button>
            <button
              className="btn btn-soft w-full"
              onClick={() => {
                signOut();
                closeAuth();
              }}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-5 grid grid-cols-3 gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-1">
            {(
              [
                ["signin", "Sign in"],
                ["register", "Register"],
                ["renewal", "Renewal"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => {
                  setMode(value);
                  setError("");
                }}
                className={cn(
                  "rounded-[9px] py-2 text-xs font-semibold transition",
                  mode === value
                    ? "bg-[var(--surface)] text-violet-600 shadow-sm dark:text-violet-300"
                    : "text-[var(--muted)]"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "renewal" ? (
            <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4 text-[11.5px] leading-relaxed">
              <p className="font-bold">License Renewal</p>
              <p>Your license is controlled by the seller. To renew or extend your subscription, contact the seller with your registered email.</p>
              <p>Once renewed, sign in again and your new expiry date will apply automatically.</p>
              <button type="button" onClick={() => setMode("signin")} className="btn btn-green w-full">Back to login</button>
            </div>
          ) : (
          <form onSubmit={submit} className="space-y-3.5">
            {mode === "register" && (
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold" htmlFor="auth-name">
                  Full name
                </label>
                <input
                  id="auth-name"
                  className="field"
                  placeholder="Hriday Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold" htmlFor="auth-email">
                Email address
              </label>
              <input
                id="auth-email"
                className="field"
                type="email"
                placeholder="you@studio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold" htmlFor="auth-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  className="field !pr-11"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] transition hover:text-[var(--ink)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-3 py-2 text-[11px] font-medium text-rose-600 dark:text-rose-300">
                <TriangleAlert className="h-3.5 w-3.5 shrink-0" /> {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn btn-primary w-full !py-3">
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {mode === "signin" ? "Sign in to studio" : "Create free account"}
            </button>
          </form>
          )}

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-[var(--line)]" />
            <span className="muted text-[10px] font-medium uppercase tracking-wider">or</span>
            <span className="h-px flex-1 bg-[var(--line)]" />
          </div>

          <button onClick={demoSignIn} disabled={busy} className="btn btn-soft w-full !py-3">
            <Sparkles className="h-4 w-4 text-violet-500" /> Continue with demo account
          </button>

          <p className="muted mt-4 flex items-start gap-1.5 text-[10px] leading-relaxed">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            Studio-only demo authentication. Your details stay in this browser — no password is sent
            anywhere.
          </p>
        </div>
      )}
    </ModalShell>
  );
}

/* ------------------------------ Gemini modal ------------------------------ */

export function GeminiModal() {
  const { geminiOpen, closeGemini, user, geminiKey, saveGeminiKey, removeGeminiKey, openAuth, pushToast } =
    useApp();
  const [draft, setDraft] = useState(geminiKey);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    if (geminiOpen) setDraft(geminiKey);
  }, [geminiOpen, geminiKey]);

  if (!geminiOpen) return null;

  const masked = geminiKey ? `${geminiKey.slice(0, 4)}••••••••${geminiKey.slice(-4)}` : "";

  return (
    <ModalShell
      onClose={closeGemini}
      title="Connect Gemini API"
      subtitle="Unlock AI-assisted prompts, scripts and direction"
      icon={<Sparkles className="h-5 w-5" />}
      accent="bg-gradient-to-br from-[#22c55e] to-[#0f9d58]"
    >
      {!user && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber-300/50 bg-amber-50 px-3.5 py-3 dark:border-amber-400/20 dark:bg-amber-400/10">
          <Lock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
          <p className="flex-1 text-[11px] font-medium text-amber-800 dark:text-amber-200">
            Sign in first to connect your Gemini API key.
          </p>
          <button
            onClick={() => {
              closeGemini();
              openAuth();
            }}
            className="rounded-lg bg-amber-500 px-2.5 py-1.5 text-[10px] font-bold text-white transition hover:bg-amber-600"
          >
            Sign in
          </button>
        </div>
      )}

      <ol className="space-y-2.5">
        {[
          {
            title: "Open Google AI Studio",
            body: "Go to aistudio.google.com and sign in with your Google account.",
          },
          {
            title: "Create an API key",
            body: "Click “Get API key” → “Create API key”. A free tier is available.",
          },
          {
            title: "Paste it below",
            body: "Your key stays on this device and is never shared with Hriday Studio.",
          },
        ].map((step, index) => (
          <li
            key={step.title}
            className="flex gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-3"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 text-[10px] font-bold text-white">
              {index + 1}
            </span>
            <div>
              <p className="text-[11.5px] font-semibold leading-tight">{step.title}</p>
              <p className="muted mt-1 text-[10.5px] leading-relaxed">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <a
        href="https://aistudio.google.com/app/apikey"
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 transition hover:underline dark:text-emerald-300"
      >
        <Link2 className="h-3.5 w-3.5" /> Open Google AI Studio
      </a>

      {geminiKey && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-300/50 bg-emerald-50 px-3 py-2.5 dark:border-emerald-400/20 dark:bg-emerald-400/10">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-200">
              Connected · {masked}
            </p>
            <p className="text-[10px] text-emerald-600/70 dark:text-emerald-300/60">
              Stored locally on this device
            </p>
          </div>
          <button
            onClick={removeGeminiKey}
            className="ml-auto text-[10px] font-semibold text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-200"
          >
            Disconnect
          </button>
        </div>
      )}

      <div className="mt-4">
        <label htmlFor="gemini-key" className="mb-1.5 block text-[11px] font-semibold">
          Gemini API key
        </label>
        <div className="relative">
          <input
            id="gemini-key"
            className="field !pr-11 font-mono !text-[11px]"
            placeholder="AIzaSy••••••••••••••••"
            type={reveal ? "text" : "password"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={!user}
          />
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? "Hide key" : "Show key"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] transition hover:text-[var(--ink)]"
          >
            {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        onClick={() => {
          if (!user) {
            closeGemini();
            openAuth();
            return;
          }
          if (draft.trim().length < 10) {
            pushToast("That key looks too short — check it and try again.", "error");
            return;
          }
          saveGeminiKey(draft);
        }}
        className="btn btn-green mt-3 w-full !py-3"
      >
        {user ? <KeyRound className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        {user ? "Save API key" : "Sign in to save key"}
      </button>
      <p className="muted mt-2 text-center text-[9.5px]">
        Looking for a free key? Google AI Studio offers a free developer tier.
      </p>
    </ModalShell>
  );
}

/* ----------------------------- Tutorial modal ----------------------------- */

export function TutorialModal() {
  const { tutorialOpen, closeTutorial, setPage } = useApp();
  if (!tutorialOpen) return null;

  return (
    <ModalShell
      onClose={closeTutorial}
      title="How FlowGen works"
      subtitle="A 2-minute tour of your creative studio"
      icon={<Play className="h-5 w-5 fill-white" />}
      wide
    >
      <div className="overflow-hidden rounded-2xl border border-black/20 bg-black shadow-inner">
        <video
          key="tutorial"
          className="aspect-video w-full bg-black"
          src={TUTORIAL_VIDEO}
          poster={TUTORIAL_POSTER}
          controls
          autoPlay
          playsInline
        />
      </div>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
        {[
          { title: "1. Describe", body: "Write a prompt or pick a ready-made style." },
          { title: "2. Generate", body: "FlowGen turns it into video, images or voice." },
          { title: "3. Refine", body: "Save to your library, download and share." },
        ].map((step) => (
          <div
            key={step.title}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-3"
          >
            <p className="text-[11.5px] font-semibold">{step.title}</p>
            <p className="muted mt-1 text-[10.5px] leading-relaxed">{step.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            closeTutorial();
            setPage("video");
          }}
          className="btn btn-primary flex-1 !py-3"
        >
          <Sparkles className="h-4 w-4" /> Try video generation
        </button>
        <button onClick={closeTutorial} className="btn btn-soft !py-3">
          Maybe later
        </button>
      </div>
    </ModalShell>
  );
}

/* -------------------------------- Toasts --------------------------------- */

export function ToastStack() {
  const { toasts, dismissToast } = useApp();
  const icons = {
    success: CheckCircle2,
    info: Info,
    error: XCircle,
  };
  const tones = {
    success: "text-emerald-500",
    info: "text-sky-500",
    error: "text-rose-500",
  };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.tone];
        return (
          <div
            key={toast.id}
            className="pop-in pointer-events-auto flex items-start gap-2.5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3 shadow-xl"
            role="status"
          >
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", tones[toast.tone])} />
            <p className="flex-1 text-[11.5px] font-medium leading-relaxed">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="text-[var(--muted)] transition hover:text-[var(--ink)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function SignedInBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-300">
      <Check className="h-3 w-3" /> {name}
    </span>
  );
}

export function UnlockIcon() {
  return (
    <span className="relative inline-flex h-14 w-14 items-center justify-center">
      <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-400/20 dark:to-orange-500/10" />
      <Unlock className="relative h-6 w-6 text-orange-500" />
      <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-[var(--surface-soft)]">
        <Lock className="h-3 w-3 text-zinc-400" />
      </span>
    </span>
  );
}
