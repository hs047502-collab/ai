import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bookmark,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Film,
  FolderOpen,
  History,
  Infinity as InfinityIcon,
  Link2,
  ListPlus,
  Loader2,
  Lock,
  Pencil,
  PenLine,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Square,
  Trash2,
  Unlock,
  Volume2,
  Upload,
  UserRound,
  Wand2,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useApp, VIDEO_POSTERS, VIDEO_SOURCES, GENERATED_IMAGES, uid } from "../store";
import { cn } from "../utils/cn";
import { VOICES } from "../pages/TextToSpeech";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type JobStatus = "queued" | "running" | "done" | "failed" | "stopped";

interface Job {
  id: string;
  prompt: string;
  label: string;
  progress: number;
  status: JobStatus;
  cost: number;
  seconds: number;
  thumb?: string;
  src?: string;
  error?: string;
  narrator?: string;
  score?: string;
  merged?: boolean;
  speed: number;
}

export interface StudioTab {
  id: string;
  label: string;
  icon: LucideIcon;
  needsImage?: number;
  hint: string;
}

export interface StudioConfig {
  kind: "video" | "image";
  title: string;
  subtitle: string;
  tabs: StudioTab[];
  models: string[];
  resolutions: { id: string; label: string; sub: string; multiplier: number }[];
  ratios: string[];
  defaultFolder: string;
  presetStyles: string[];
  placeholder: string;
  baseCost: number;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const LENGTH_OPTIONS = [
  { id: "per", label: "Per prompt (1 clip each)", seconds: 0 },
  { id: "30", label: "30 seconds", seconds: 30 },
  { id: "60", label: "1 minute", seconds: 60 },
  { id: "180", label: "3 minutes", seconds: 180 },
  { id: "300", label: "5 minutes", seconds: 300 },
  { id: "600", label: "10 minutes", seconds: 600 },
  { id: "custom", label: "Custom length…", seconds: -1 },
];

const CLIP_LENGTHS = [4, 6, 8];

const BRIEF_SUBJECTS = ["young boatman", "street food vendor", "robot gardener", "schoolteacher in a tiny village", "documentary filmmaker", "curious teenager"];
const BRIEF_SETTINGS = ["a misty riverbank in Bangladesh", "a rain-soaked Dhaka rooftop", "an abandoned cinema hall", "a night bus crossing the countryside", "a floating market at dawn", "a monsoon tea garden in Sylhet"];
const BRIEF_ACTIONS = ["discovers a glowing map", "receives an impossible phone call", "watches the sky split in two", "finds a door that was not there yesterday", "chases a light over the rooftops", "meets a stranger who knows everything"];
const BRIEF_MOODS = ["quiet and melancholic", "tense and electric", "warm and nostalgic", "dreamlike and surreal", "urgent and cinematic"];
const BRIEF_LIGHTS = ["golden-hour light", "neon glow and reflections", "soft overcast glow", "candlelight flicker", "harsh noon sun"];
const BRIEF_PALETTES = ["deep teal, violet and amber", "dusty orange and cream", "black, white and one red accent", "emerald, gold and midnight blue"];

export function splitPrompts(text: string, autoSplit: boolean): string[] {
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (!autoSplit) return blocks;
  // Long single blocks (scripts) are split into sentences so each becomes a scene.
  return blocks.flatMap((block) => {
    if (block.length < 220) return [block];
    const sentences = block
      .split(/(?<=[.!?।])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    // group very short sentences together
    const grouped: string[] = [];
    sentences.forEach((sentence) => {
      const last = grouped[grouped.length - 1];
      if (last && last.length < 60) grouped[grouped.length - 1] = `${last} ${sentence}`;
      else grouped.push(sentence);
    });
    return grouped.length ? grouped : [block];
  });
}

function formatLength(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s ? `${m}m ${s}s` : `${m} min`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function loadJobs(key: string): Job[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return (JSON.parse(raw) as Job[]).map((j) =>
      j.status === "running" ? { ...j, status: "queued", progress: 0 } : j
    );
  } catch {
    return [];
  }
}

function loadHistory(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as string[];
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Small UI bits                                                       */
/* ------------------------------------------------------------------ */

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[11px] font-medium">
      {label}
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => onChange(!on)}
        className={cn(
          "relative h-[22px] w-10 rounded-full transition",
          on ? "bg-gradient-to-r from-[#22c55e] to-[#0f9d58]" : "bg-[var(--track)]"
        )}
      >
        <span
          className={cn(
            "absolute top-[3px] h-4 w-4 rounded-full bg-white shadow transition-all",
            on ? "left-[21px]" : "left-[3px]"
          )}
        />
      </button>
    </label>
  );
}

function StatusBadge({ status }: { status: JobStatus }) {
  const map: Record<JobStatus, { label: string; cls: string; icon: ReactNode }> = {
    queued: { label: "Queued", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-300", icon: <Clock3 className="h-3 w-3" /> },
    running: { label: "Running", cls: "bg-violet-500/10 text-violet-600 dark:text-violet-300", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    done: { label: "Done", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300", icon: <CheckCircle2 className="h-3 w-3" /> },
    failed: { label: "Failed", cls: "bg-rose-500/10 text-rose-600 dark:text-rose-300", icon: <XCircle className="h-3 w-3" /> },
    stopped: { label: "Stopped", cls: "bg-zinc-500/10 text-zinc-500", icon: <Square className="h-3 w-3" /> },
  };
  const m = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-semibold", m.cls)}>
      {m.icon}
      {m.label}
    </span>
  );
}

function MiniModal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center overflow-y-auto bg-[#100a26]/65 p-4 backdrop-blur-[3px]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={cn("pop-in my-auto w-full overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl", wide ? "max-w-3xl" : "max-w-lg")}>
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3.5">
          <h3 className="text-[15px] font-bold">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-full bg-[var(--surface-soft)] p-1.5 text-[var(--muted)] hover:text-[var(--ink)]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[78vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export function BatchStudio({ config }: { config: StudioConfig }) {
  const {
    user,
    openAuth,
    pushToast,
    addGeneration,
    remainingVideo,
    remainingImages,
    maxConcurrent,
    characters,
    customStyles,
    addCustomStyle,
    removeCustomStyle,
    pendingPrompts,
    setPendingPrompts,
    setPage,
    vault,
    saveSnippet,
    removeSnippet,
  } = useApp();

  const isVideo = config.kind === "video";
  const storeKey = `hriday.queue.${config.kind}`;
  const remaining = isVideo ? remainingVideo : remainingImages;

  // settings
  const [tab, setTab] = useState(config.tabs[0].id);
  const [folder, setFolder] = useState(() => localStorage.getItem(`${storeKey}.folder`) || config.defaultFolder);
  const [model, setModel] = useState(config.models[0]);
  const [ratio, setRatio] = useState(config.ratios[0]);
  const [resolution, setResolution] = useState(config.resolutions[0].id);
  const [styles, setStyles] = useState<string[]>([]);
  const [customStyleDraft, setCustomStyleDraft] = useState("");
  const [clipLength, setClipLength] = useState(8);
  const [lengthMode, setLengthMode] = useState("per");
  const [customMinutes, setCustomMinutes] = useState(2);
  const [autoMerge, setAutoMerge] = useState(true);
  const [batchSize, setBatchSize] = useState(1);
  const [autoSplit, setAutoSplit] = useState(true);
  const [autoNumber, setAutoNumber] = useState(true);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [castIds, setCastIds] = useState<string[]>([]);
  const [refImages, setRefImages] = useState<string[]>([]);
  const [text, setText] = useState("");

  // queue
  const [jobs, setJobs] = useState<Job[]>(() => loadJobs(storeKey));
  const jobsRef = useRef<Job[]>(jobs);
  const [running, setRunning] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState<"all" | JobStatus>("all");

  // modals
  const [showPrefixes, setShowPrefixes] = useState(false);
  const [showCast, setShowCast] = useState(false);
  const [rewriteJob, setRewriteJob] = useState<Job | null>(null);
  const [preview, setPreview] = useState<Job | null>(null);
  const [narrator, setNarrator] = useState("None");
  const [score, setScore] = useState("None");
  const [showVault, setShowVault] = useState(false);
  const [vaultTag, setVaultTag] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const historyRef = useRef<string[]>(loadHistory(`${storeKey}.history`));

  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const remainingRef = useRef(remaining);
  remainingRef.current = remaining;
  const pendingMergeRef = useRef<string[] | null>(null);

  const commit = (next: Job[]) => {
    jobsRef.current = next;
    setJobs(next);
  };

  useEffect(() => {
    try {
      localStorage.setItem(storeKey, JSON.stringify(jobs.slice(0, 400)));
    } catch {
      /* ignore */
    }
  }, [jobs, storeKey]);

  useEffect(() => {
    localStorage.setItem(`${storeKey}.folder`, folder);
  }, [folder, storeKey]);

  // prompts handed over from AI Director → Script to Video
  useEffect(() => {
    if (pendingPrompts && pendingPrompts.kind === config.kind) {
      setText(pendingPrompts.text);
      setAutoSplit(false);
      setPendingPrompts(null);
      pushToast("Script scenes loaded. Press Queue, then Start.", "info");
    }
  }, [pendingPrompts, config.kind, setPendingPrompts, pushToast]);

  const activeTab = config.tabs.find((t) => t.id === tab) ?? config.tabs[0];
  const resolutionInfo = config.resolutions.find((r) => r.id === resolution) ?? config.resolutions[0];
  const allStyles = [...config.presetStyles, ...customStyles];
  const prompts = useMemo(() => splitPrompts(text, autoSplit), [text, autoSplit]);

  const targetSeconds =
    lengthMode === "per"
      ? 0
      : lengthMode === "custom"
        ? Math.max(1, customMinutes) * 60
        : Number(lengthMode);

  const clipsPerPrompt = isVideo && targetSeconds && prompts.length
    ? Math.max(1, Math.ceil(targetSeconds / (prompts.length * clipLength)))
    : 1;
  const totalJobs = prompts.length * (isVideo ? clipsPerPrompt : batchSize);
  const costPerJob = Math.round(config.baseCost * resolutionInfo.multiplier);
  const estimatedCredits = totalJobs * costPerJob;
  const finalSeconds = isVideo ? totalJobs * clipLength : 0;

  const counts = useMemo(() => {
    const c = { queued: 0, running: 0, done: 0, failed: 0, stopped: 0 };
    jobs.forEach((j) => c[j.status]++);
    return c;
  }, [jobs]);

  const visibleJobs = jobs.filter((j) => filter === "all" || j.status === filter);
  const doneJobs = jobs.filter((j) => j.status === "done" && !j.merged);
  const mergedJob = jobs.find((j) => j.merged);
  const doneSeconds = doneJobs.reduce((sum, j) => sum + j.seconds, 0);

  /* ----------------------------- build prompt ---------------------------- */

  const decorate = (prompt: string) => {
    const cast = characters
      .filter((c) => castIds.includes(c.id))
      .map((c) => `${c.name} (${c.role}: ${c.bio})`);
    const parts = [
      prefix.trim(),
      prompt,
      cast.length ? `Featuring ${cast.join("; ")}` : "",
      styles.length ? `Style: ${styles.join(", ")}` : "",
      suffix.trim(),
    ].filter(Boolean);
    return parts.join(". ").replace(/\.\./g, ".");
  };

  /* ------------------------------ queueing ------------------------------- */

  const enqueue = (autoStart = false) => {
    if (!prompts.length) {
      pushToast("Write at least one prompt (separate prompts with a blank line).", "error");
      return false;
    }
    if (activeTab.needsImage && refImages.length === 0) {
      pushToast(`${activeTab.label} needs a reference image — upload one first.`, "error");
      return false;
    }
    const offset = jobsRef.current.filter((j) => !j.merged).length;
    const created: Job[] = [];
    prompts.forEach((p, pi) => {
      const reps = isVideo ? clipsPerPrompt : batchSize;
      for (let k = 0; k < reps; k++) {
        const continuation = isVideo && reps > 1 ? ` — continue the same scene seamlessly, part ${k + 1} of ${reps}` : "";
        const variation = !isVideo && reps > 1 ? ` (variation ${k + 1})` : "";
        created.push({
          id: uid(),
          prompt: decorate(p) + continuation + variation,
          label: autoNumber
            ? `${String(offset + created.length + 1).padStart(3, "0")}${reps > 1 ? ` · S${pi + 1}.${k + 1}` : ""}`
            : reps > 1 ? `S${pi + 1}.${k + 1}` : "",
          progress: 0,
          status: "queued",
          cost: costPerJob,
          seconds: isVideo ? clipLength : 0,
          narrator: isVideo ? narrator : undefined,
          score: isVideo ? score : undefined,
          speed: isVideo ? 6 + Math.random() * 6 : 10 + Math.random() * 10,
        });
      }
    });
    if (isVideo && autoMerge && created.length > 1) {
      pendingMergeRef.current = created.map((j) => j.id);
    }
    commit([...jobsRef.current, ...created]);
    historyRef.current = [text, ...historyRef.current.filter((t) => t !== text)].slice(0, 5);
    try {
      localStorage.setItem(`${storeKey}.history`, JSON.stringify(historyRef.current));
    } catch {
      /* ignore */
    }
    pushToast(
      `${created.length} job${created.length > 1 ? "s" : ""} added to the queue${isVideo && finalSeconds ? ` · ${formatLength(finalSeconds)} total` : ""}.`,
      "info"
    );
    setText("");
    if (autoStart) start();
    return true;
  };

  const start = () => {
    if (!user) {
      openAuth();
      pushToast("Sign in to start generating.", "info");
      return;
    }
    if (!jobsRef.current.some((j) => j.status === "queued")) {
      if (prompts.length) {
        enqueue(false);
      } else {
        pushToast("Your queue is empty. Add prompts first.", "error");
        return;
      }
    }
    setRunning(true);
  };

  const stop = () => {
    setRunning(false);
    commit(
      jobsRef.current.map((j) => (j.status === "running" ? { ...j, status: "queued", progress: 0 } : j))
    );
    pushToast("Queue paused. Running jobs were returned to the queue — no credits used.", "info");
  };

  // queue engine
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      const list = jobsRef.current.map((j) => ({ ...j }));
      const finished: Job[] = [];

      list.forEach((j) => {
        if (j.status !== "running") return;
        j.progress = Math.min(100, j.progress + j.speed * (0.6 + Math.random() * 0.8));
        if (j.progress >= 100) {
          if (Math.random() < 0.04) {
            j.status = "failed";
            j.error = "Render timed out — free retry, no credits used";
            j.progress = 0;
          } else {
            j.status = "done";
            j.progress = 100;
            const index = Math.floor(Math.random() * 100);
            if (isVideo) {
              j.thumb = VIDEO_POSTERS[index % VIDEO_POSTERS.length];
              j.src = VIDEO_SOURCES[index % VIDEO_SOURCES.length];
            } else {
              j.thumb = refImages[0] && tab !== "t2i" && Math.random() < 0.25 ? refImages[0] : GENERATED_IMAGES[index % GENERATED_IMAGES.length].url;
            }
            finished.push(j);
          }
        }
      });

      let active = list.filter((j) => j.status === "running").length;
      let budget = remainingRef.current - finished.reduce((s, j) => s + j.cost, 0) - list.filter((j) => j.status === "running").reduce((s, j) => s + j.cost, 0);
      for (const j of list) {
        if (active >= maxConcurrent) break;
        if (j.status !== "queued") continue;
        if (budget < j.cost) {
          j.status = "failed";
          j.error = "Not enough credits — upgrade or wait for monthly refresh";
          continue;
        }
        j.status = "running";
        j.progress = 1;
        budget -= j.cost;
        active++;
      }

      commit(list);

      finished.forEach((j) => {
        addGeneration({
          kind: config.kind,
          title: j.prompt.slice(0, 64),
          prompt: j.prompt,
          thumb: j.thumb,
          meta: `${model} · ${ratio.split(" ")[0]} · ${resolutionInfo.label}${isVideo ? ` · ${j.seconds}s` : ""}${isVideo && j.narrator && j.narrator !== "None" ? ` · Voice: ${j.narrator}` : ""}`,
          credits: j.cost,
          seconds: j.seconds,
        });
      });

      if (!list.some((j) => j.status === "queued" || j.status === "running")) {
        setRunning(false);
        const done = list.filter((j) => j.status === "done").length;
        pushToast(`Queue finished · ${done} completed. Files saved to ${folder}`);
        // auto-merge long video parts
        const ids = pendingMergeRef.current;
        if (ids) {
          pendingMergeRef.current = null;
          const parts = list.filter((j) => ids.includes(j.id) && j.status === "done");
          if (parts.length > 1) mergeJobs(parts, list);
        }
      }
    }, 320);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, maxConcurrent]);

  /* ------------------------------ actions -------------------------------- */

  const mergeJobs = (parts: Job[], base = jobsRef.current) => {
    const seconds = parts.reduce((s, j) => s + j.seconds, 0);
    const merged: Job = {
      id: uid(),
      prompt: `Final cut · ${parts.length} clips merged: ${parts[0].prompt.slice(0, 80)}…`,
      label: "MERGED",
      progress: 100,
      status: "done",
      cost: 0,
      seconds,
      thumb: parts[0].thumb,
      src: parts[0].src,
      narrator: parts[0].narrator,
      score: parts[0].score,
      merged: true,
      speed: 0,
    };
    commit([merged, ...base]);
    addGeneration({
      kind: "video",
      title: `Final cut · ${formatLength(seconds)} · ${parts.length} clips`,
      prompt: parts.map((p) => p.prompt).join("\n\n"),
      thumb: parts[0].thumb,
      meta: `Merged · ${formatLength(seconds)} · ${resolutionInfo.label}${parts[0].score && parts[0].score !== "None" ? ` · Score: ${parts[0].score}` : ""}${parts[0].narrator && parts[0].narrator !== "None" ? ` · Voice: ${parts[0].narrator}` : ""}`,
      credits: 0,
      seconds,
    });
    pushToast(`Merged ${parts.length} clips into a ${formatLength(seconds)} video (free).`);
  };

  const selectedJobs = jobs.filter((j) => selected.includes(j.id));

  const deleteSelected = () => {
    if (!selected.length) return pushToast("Select rows first.", "error");
    commit(jobsRef.current.filter((j) => !selected.includes(j.id) || j.status === "running"));
    setSelected([]);
    pushToast("Selected rows removed.", "info");
  };

  const regenSelected = () => {
    const targets = selectedJobs.filter((j) => j.status !== "running" && !j.merged);
    if (!targets.length) return pushToast("Select finished, failed or stopped rows to regenerate.", "error");
    commit(
      jobsRef.current.map((j) =>
        targets.some((t) => t.id === j.id) ? { ...j, status: "queued", progress: 0, error: undefined, thumb: undefined } : j
      )
    );
    setSelected([]);
    pushToast(`${targets.length} job(s) re-queued.`, "info");
    if (user) setRunning(true);
  };

  const rewriteSelected = () => {
    const target = selectedJobs.find((j) => !j.merged && j.status !== "running");
    if (!target) return pushToast("Select one row to rewrite its prompt.", "error");
    setRewriteJob(target);
  };

  const mergeSelected = () => {
    const parts = selectedJobs.filter((j) => j.status === "done" && !j.merged);
    if (parts.length < 2) return pushToast("Select at least 2 finished clips to merge.", "error");
    mergeJobs(parts);
    setSelected([]);
  };

  const importTxt = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || "");
      setText((prev) => (prev.trim() ? `${prev.trim()}\n\n${content}` : content));
      pushToast(`Imported ${file.name} (${content.length.toLocaleString()} characters).`);
    };
    reader.readAsText(file);
  };

  const addImages = (files: FileList) => {
    const limit = activeTab.needsImage ?? 1;
    Array.from(files)
      .slice(0, limit)
      .forEach((file) => {
        const reader = new FileReader();
        reader.onload = () =>
          setRefImages((prev) => [...prev, String(reader.result)].slice(-limit));
        reader.readAsDataURL(file);
      });
  };

  const pickFolder = async () => {
    const w = window as unknown as { showDirectoryPicker?: () => Promise<{ name: string }> };
    if (w.showDirectoryPicker) {
      try {
        const handle = await w.showDirectoryPicker();
        setFolder(`${config.defaultFolder.split("\\").slice(0, -1).join("\\")}\\${handle.name}`);
        pushToast(`Output folder set to “${handle.name}”.`);
      } catch {
        /* cancelled */
      }
    } else {
      pushToast("Type a folder path directly in the field.", "info");
    }
  };

  const toggleStyle = (s: string) =>
    setStyles((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const saveCustomStyle = () => {
    const v = customStyleDraft.trim();
    if (!v) return;
    addCustomStyle(v);
    setStyles((prev) => (prev.includes(v) ? prev : [...prev, v]));
    setCustomStyleDraft("");
    pushToast(`Style “${v}” saved — reuse it anytime.`);
  };

  const brief = () => {
    const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];
    const line = `A ${pick(BRIEF_SUBJECTS)} in ${pick(BRIEF_SETTINGS)}, ${pick(BRIEF_ACTIONS)}. ${pick(BRIEF_MOODS)} mood, ${pick(BRIEF_LIGHTS)}, palette of ${pick(BRIEF_PALETTES)}.`;
    setText((prev) => (prev.trim() ? `${prev.trim()}\n\n${line}` : line));
    pushToast("Creative brief generated — remix it as you like.");
  };

  const exportTxt = () => {
    const lines = [
      `${config.title} — FlowGen export`,
      `Folder: ${folder}`,
      "",
      "PROMPTS",
      ...prompts.map((pr, i) => `${i + 1}. ${pr}`),
      "",
      `QUEUE (${jobs.length})`,
      ...jobs.map((j) => `#${j.label || "—"} [${j.status}] ${j.prompt}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flowgen-${config.kind}-export.txt`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast("Queue exported as a .txt file.");
  };

  const restoreHistory = (t: string) => {
    setText(t);
    setShowHistory(false);
    pushToast("Previous prompts restored.", "info");
  };

  const saveToVault = () => {
    if (!text.trim()) return pushToast("Nothing to save — write prompts first.", "error");
    saveSnippet(text.trim(), vaultTag.trim() || activeTab.label, config.kind);
    setShowVault(false);
    setVaultTag("");
    pushToast("Saved to your Prompt Vault.");
  };

  /* ------------------------------- render -------------------------------- */

  const allVisibleSelected = visibleJobs.length > 0 && visibleJobs.every((j) => selected.includes(j.id));

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight sm:text-[26px]">{config.title}</h1>
          <p className="muted text-[11.5px]">{config.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Queue: {counts.queued + counts.running}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" /> Completed: {counts.done}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1.5 text-[11px] font-semibold text-violet-700 dark:text-violet-300">
            {remaining} credits left
          </span>
        </div>
      </div>

      {/* Tabs + toggles */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {config.tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setRefImages([]);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11.5px] font-semibold shadow-sm transition",
                tab === t.id
                  ? "bg-gradient-to-r from-[#22c55e] to-[#0f9d58] text-white shadow-[0_10px_20px_-12px_rgba(16,163,74,0.9)]"
                  : "border border-[var(--line)] bg-[var(--surface)] hover:border-emerald-300"
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span title="Long scripts are split into one scene per sentence">
            <Switch on={autoSplit} onChange={setAutoSplit} label="Auto-split" />
          </span>
          <span title="Number every job in the queue">
            <Switch on={autoNumber} onChange={setAutoNumber} label="Auto-number" />
          </span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[440px_1fr]">
        {/* ------------------------- Left: composer ------------------------- */}
        <div className="card flex flex-col gap-3 p-3.5 sm:p-4">
          <p className="muted -mb-1 text-[10.5px]">{activeTab.hint}</p>

          {/* folder */}
          <div className="flex items-stretch overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-soft)]">
            <FolderOpen className="ml-3 h-4 w-4 shrink-0 self-center text-amber-500" />
            <input
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="min-w-0 flex-1 bg-transparent px-2.5 py-2.5 text-[11.5px] outline-none"
              aria-label="Output folder"
            />
            <button onClick={pickFolder} className="border-l border-[var(--line)] px-3 text-amber-500 hover:bg-[var(--track)]" aria-label="Choose folder">
              <FolderOpen className="h-4 w-4" />
            </button>
          </div>

          {/* model / ratio */}
          <div className="grid grid-cols-2 gap-2">
            <select className="field cursor-pointer !py-2.5 !text-[11.5px]" value={model} onChange={(e) => setModel(e.target.value)} aria-label="Model">
              {config.models.map((m) => <option key={m}>{m}</option>)}
            </select>
            <select className="field cursor-pointer !py-2.5 !text-[11.5px]" value={ratio} onChange={(e) => setRatio(e.target.value)} aria-label="Aspect ratio">
              {config.ratios.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>

          {/* resolution */}
          <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-1.5">
            <span className="muted pl-1.5 text-[10.5px] font-medium">Resolution:</span>
            <div className="grid flex-1 grid-cols-3 gap-1">
              {config.resolutions.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setResolution(r.id)}
                  className={cn(
                    "rounded-lg px-1 py-1.5 text-center leading-tight transition",
                    resolution === r.id ? "bg-gradient-to-r from-[#22c55e] to-[#0f9d58] text-white shadow-sm" : "hover:bg-[var(--track)]"
                  )}
                >
                  <span className="block text-[11px] font-semibold">{r.label}</span>
                  <span className={cn("block text-[8.5px]", resolution === r.id ? "text-white/85" : "muted")}>{r.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* lock badge */}
          {user ? (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[10.5px] font-bold text-white">
              <Unlock className="h-3.5 w-3.5" /> UNLOCKED — {maxConcurrent} concurrent jobs
            </span>
          ) : (
            <button onClick={openAuth} className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-[#8b1414] px-3 py-1.5 text-[10.5px] font-bold text-white transition hover:bg-[#a51818]">
              <Lock className="h-3.5 w-3.5" /> LOCKED — Sign in to unlock
            </button>
          )}

          {/* reference images */}
          {activeTab.needsImage ? (
            <div>
              <p className="mb-1.5 text-[11px] font-semibold">
                Reference image{(activeTab.needsImage ?? 1) > 1 ? `s (up to ${activeTab.needsImage})` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {refImages.map((src, i) => (
                  <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-[var(--line)]">
                    <img src={src} alt={`Reference ${i + 1}`} className="h-full w-full object-cover" />
                    <button onClick={() => setRefImages((p) => p.filter((_, x) => x !== i))} className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white" aria-label="Remove image">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {refImages.length < (activeTab.needsImage ?? 1) && (
                  <button onClick={() => imageRef.current?.click()} className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[var(--line-strong)] bg-[var(--surface-soft)] text-[var(--muted)] hover:border-emerald-400">
                    <Upload className="h-4 w-4" />
                    <span className="text-[8.5px]">Upload</span>
                  </button>
                )}
              </div>
              <input ref={imageRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && addImages(e.target.files)} />
            </div>
          ) : null}

          {/* styles */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-[11px] font-semibold">Visual style <span className="muted font-normal">(pick any, or add your own)</span></p>
              {styles.length > 0 && (
                <button onClick={() => setStyles([])} className="muted text-[9.5px] hover:text-rose-500">Clear</button>
              )}
            </div>
            <div className="flex max-h-[96px] flex-wrap gap-1.5 overflow-y-auto pr-1">
              {allStyles.map((s) => {
                const custom = customStyles.includes(s);
                return (
                  <span key={s} className="group relative">
                    <button
                      onClick={() => toggleStyle(s)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[10px] font-semibold transition",
                        styles.includes(s)
                          ? "border-violet-400 bg-violet-500 text-white"
                          : "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)] hover:border-violet-300",
                        custom && "pr-5"
                      )}
                    >
                      {custom && "★ "}{s}
                    </button>
                    {custom && (
                      <button
                        onClick={() => {
                          removeCustomStyle(s);
                          setStyles((p) => p.filter((x) => x !== s));
                        }}
                        aria-label={`Delete style ${s}`}
                        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-current opacity-60 hover:opacity-100"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
            <div className="mt-2 flex gap-1.5">
              <input
                value={customStyleDraft}
                onChange={(e) => setCustomStyleDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveCustomStyle()}
                placeholder="Your own style… e.g. Ghibli, VHS 90s, Pixar, claymation"
                className="field !py-2 !text-[11px]"
                aria-label="Custom style"
              />
              <button onClick={saveCustomStyle} className="btn btn-soft !px-3 !py-2 text-[10.5px]">
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
          </div>

          {/* duration (video) / batch (image) */}
          {isVideo ? (
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="mb-1 text-[10.5px] font-semibold">Clip length</p>
                  <div className="grid grid-cols-3 gap-1 rounded-lg bg-[var(--surface)] p-1">
                    {CLIP_LENGTHS.map((c) => (
                      <button key={c} onClick={() => setClipLength(c)} className={cn("rounded-md py-1 text-[10.5px] font-semibold", clipLength === c ? "bg-violet-500 text-white" : "muted")}>
                        {c}s
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[10.5px] font-semibold">Total video length</p>
                  <select className="field cursor-pointer !py-[7px] !text-[10.5px]" value={lengthMode} onChange={(e) => setLengthMode(e.target.value)} aria-label="Total length">
                    {LENGTH_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              {lengthMode === "custom" && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.min(180, Math.max(1, Number(e.target.value) || 1)))}
                    className="field !w-24 !py-1.5 !text-[11px]"
                    aria-label="Custom minutes"
                  />
                  <span className="muted text-[10.5px]">minutes (up to 3 hours)</span>
                </div>
              )}
              {targetSeconds > 0 && (
                <label className="mt-2 flex items-center gap-2 text-[10.5px]">
                  <input type="checkbox" checked={autoMerge} onChange={(e) => setAutoMerge(e.target.checked)} className="accent-emerald-600" />
                  Auto-merge all clips into one final video when done
                </label>
              )}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <p className="mb-1 text-[10.5px] font-semibold">Narrator voiceover</p>
                  <select className="field cursor-pointer !py-[7px] !text-[10.5px]" value={narrator} onChange={(e) => setNarrator(e.target.value)} aria-label="Narrator voiceover">
                    <option>None</option>
                    {VOICES.map((v) => <option key={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div>
                  <p className="mb-1 text-[10.5px] font-semibold">Background score</p>
                  <select className="field cursor-pointer !py-[7px] !text-[10.5px]" value={score} onChange={(e) => setScore(e.target.value)} aria-label="Background score">
                    {["None", "Ambient synth", "Orchestral swell", "Lo-fi beats", "Minimal piano"].map((sc) => <option key={sc}>{sc}</option>)}
                  </select>
                </div>
              </div>
              <p className="muted mt-2 flex items-start gap-1.5 text-[9.5px] leading-relaxed">
                <InfinityIcon className="mt-0.5 h-3 w-3 shrink-0 text-violet-500" />
                Long videos are rendered as {clipLength}s clips that continue the same scene, then merged into one seamless video.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-2.5 py-2">
              <span className="text-[10.5px] font-semibold">Images per prompt</span>
              <div className="grid grid-cols-4 gap-1 rounded-lg bg-[var(--surface)] p-1">
                {[1, 2, 3, 4].map((n) => (
                  <button key={n} onClick={() => setBatchSize(n)} className={cn("rounded-md px-2.5 py-1 text-[10.5px] font-semibold", batchSize === n ? "bg-violet-500 text-white" : "muted")}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* prompts */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-medium">Enter Prompts <span className="muted">(separate with blank line · no limit)</span></p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setShowHistory(true)} className="chip !py-1.5 hover:border-violet-300">
                <History className="h-3 w-3" /> History
              </button>
              <button onClick={() => setShowVault(true)} className="chip !py-1.5 hover:border-violet-300">
                <Bookmark className="h-3 w-3" /> Vault{vault.length ? ` (${vault.length})` : ""}
              </button>
              <button onClick={brief} className="chip !py-1.5 border-violet-300 text-violet-600 hover:!bg-violet-500/10 dark:text-violet-300">
                <PenLine className="h-3 w-3" /> Brief me
              </button>
              <button onClick={() => fileRef.current?.click()} className="chip !py-1.5 hover:border-violet-300">
                <FileText className="h-3 w-3" /> Import TXT
              </button>
            </div>
            <input ref={fileRef} type="file" accept=".txt,.md,.srt,text/plain" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importTxt(f); e.target.value = ""; }} />
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                enqueue(false);
              }
            }}
            className="field min-h-[220px] resize-y !text-[12px] leading-relaxed"
            placeholder={config.placeholder}
            aria-label="Prompts"
          />
          <p className="muted -mt-1.5 text-right text-[8.5px]">Ctrl / ⌘ + Enter queues this box</p>

          {/* active modifiers */}
          {(prefix || suffix || castIds.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {prefix && <span className="chip !text-[9.5px]">Prefix: {prefix.slice(0, 24)}{prefix.length > 24 && "…"}</span>}
              {suffix && <span className="chip !text-[9.5px]">Suffix: {suffix.slice(0, 24)}{suffix.length > 24 && "…"}</span>}
              {characters.filter((c) => castIds.includes(c.id)).map((c) => (
                <span key={c.id} className="chip !text-[9.5px]"><UserRound className="h-2.5 w-2.5 text-blue-500" /> {c.name}</span>
              ))}
            </div>
          )}

          {/* summary */}
          <div className="rounded-xl border border-violet-200/50 bg-violet-50/60 px-3 py-2 text-[10.5px] dark:bg-violet-500/5">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <span><b>{prompts.length}</b> prompt{prompts.length === 1 ? "" : "s"} · {text.length.toLocaleString()} chars</span>
              <span><b>{totalJobs}</b> job{totalJobs === 1 ? "" : "s"}</span>
              {isVideo && <span>Final ≈ <b>{formatLength(finalSeconds)}</b></span>}
              <span className={cn(estimatedCredits > remaining && "font-bold text-rose-500")}>≈ {estimatedCredits} credits</span>
            </div>
          </div>

          {/* buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => enqueue(false)} className="btn btn-ghost flex-1 !py-2.5">
              <ListPlus className="h-4 w-4 text-violet-500" /> Queue
            </button>
            {running ? (
              <button onClick={stop} className="btn btn-red flex-1 !py-2.5">
                <Square className="h-4 w-4" /> Stop
              </button>
            ) : (
              <button onClick={start} className="btn btn-green flex-1 !py-2.5">
                <Play className="h-4 w-4 fill-white" /> Start
              </button>
            )}
            <button onClick={() => { setText(""); pushToast("Prompt box cleared.", "info"); }} className="btn btn-red !py-2.5">
              <Trash2 className="h-4 w-4" /> Clear
            </button>
            <button onClick={exportTxt} className="btn btn-ghost !py-2.5">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowPrefixes(true)} className="btn btn-soft flex-1 !py-2.5">
              <Wand2 className="h-4 w-4" /> Prefixes
            </button>
            <button onClick={() => setShowCast(true)} className="btn flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 !py-2.5 text-white">
              <UserRound className="h-4 w-4" /> Characters{castIds.length ? ` (${castIds.length})` : ""}
            </button>
          </div>
        </div>

        {/* ------------------------- Right: queue table ------------------------- */}
        <div className="card flex min-h-[560px] flex-col overflow-hidden">
          <div
            className={cn(
              "grid items-center gap-2 border-b border-[var(--line)] px-3 py-3 text-[10.5px] font-semibold text-[var(--muted)] sm:px-4",
              activeTab.needsImage ? "grid-cols-[30px_50px_64px_minmax(0,1fr)_92px_74px_58px]" : "grid-cols-[34px_58px_minmax(0,1fr)_110px_80px_64px]"
            )}
          >
            <input type="checkbox" checked={allVisibleSelected} onChange={(e) => setSelected(e.target.checked ? visibleJobs.map((j) => j.id) : [])} className="accent-emerald-600" aria-label="Select all" />
            <span>#</span>
            {activeTab.needsImage && <span>Image 1</span>}
            <span>Prompt</span>
            <span className="hidden sm:block">Progress</span>
            <span>Status</span>
            <span className="flex items-center justify-between">
              Preview
              <button onClick={() => setJobs([...jobsRef.current])} aria-label="Refresh" className="hover:text-violet-500"><RefreshCw className="h-3 w-3" /></button>
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {visibleJobs.length === 0 ? (
              <div className="flex h-full min-h-[380px] flex-col items-center justify-center px-6 text-center">
                <span className="animate-floaty mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-violet-100 text-violet-600 dark:from-emerald-500/10 dark:to-violet-500/10">
                  {isVideo ? <Film className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
                </span>
                <p className="text-[13px] font-semibold">{jobs.length ? "No jobs match this filter" : "Your queue is empty"}</p>
                <p className="muted mt-1 max-w-sm text-[10.5px] leading-relaxed">
                  Paste as many prompts as you like — or a whole script — then press <b>Queue</b> and <b>Start</b>. Every result appears here with progress and a preview.
                </p>
              </div>
            ) : (
              visibleJobs.map((job) => (
                <div
                  key={job.id}
                  className={cn(
                    "grid items-center gap-2 border-b border-[var(--line)] px-3 py-2 text-[11px] transition sm:px-4",
                    activeTab.needsImage ? "grid-cols-[30px_50px_64px_minmax(0,1fr)_92px_74px_58px]" : "grid-cols-[34px_58px_minmax(0,1fr)_110px_80px_64px]",
                    selected.includes(job.id) ? "bg-violet-500/5" : "hover:bg-[var(--surface-soft)]",
                    job.merged && "bg-emerald-500/5"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(job.id)}
                    onChange={(e) => setSelected((p) => (e.target.checked ? [...p, job.id] : p.filter((x) => x !== job.id)))}
                    className="accent-emerald-600"
                    aria-label="Select row"
                  />
                  <span className={cn("font-mono text-[9.5px]", job.merged ? "font-bold text-emerald-600" : "muted")}>{job.label || "—"}</span>
                  {activeTab.needsImage && (
                    <span>
                      {refImages[0] ? (
                        <img src={refImages[0]} alt="Reference image" className="h-9 w-14 rounded-md border border-[var(--line)] object-cover" />
                      ) : (
                        <span className="block h-9 w-14 rounded-md border border-dashed border-[var(--line-strong)] bg-[var(--surface-soft)]" />
                      )}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-[10.5px] leading-snug" title={job.prompt}>{job.prompt}</p>
                    {job.error && <p className="mt-0.5 text-[9px] text-rose-500">{job.error}</p>}
                    {job.merged && <p className="mt-0.5 text-[9px] font-semibold text-emerald-600">{formatLength(job.seconds)} final video</p>}
                  </div>
                  <div className="hidden items-center gap-1.5 sm:flex">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--track)]">
                      <div className={cn("h-full rounded-full transition-all duration-300", job.status === "failed" ? "bg-rose-400" : "bg-gradient-to-r from-[#22c55e] to-[#0f9d58]")} style={{ width: `${job.status === "failed" ? 100 : job.progress}%` }} />
                    </div>
                    <span className="muted w-7 text-right text-[9px]">{Math.round(job.progress)}%</span>
                  </div>
                  <StatusBadge status={job.status} />
                  <div>
                    {job.thumb && job.status === "done" ? (
                      <button onClick={() => setPreview(job)} className="group relative block h-9 w-14 overflow-hidden rounded-md border border-[var(--line)]" aria-label="Open preview">
                        <img src={job.thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
                        {isVideo && <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-80 group-hover:opacity-100"><Play className="h-3 w-3 fill-white text-white" /></span>}
                      </button>
                    ) : job.status === "failed" ? (
                      <button
                        onClick={() => {
                          commit(jobsRef.current.map((j) => (j.id === job.id ? { ...j, status: "queued", progress: 0, error: undefined } : j)));
                          if (user) setRunning(true);
                        }}
                        className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-violet-600 dark:text-violet-300"
                      >
                        <RotateCcw className="h-3 w-3" /> Retry
                      </button>
                    ) : (
                      <span className="block h-9 w-14 rounded-md bg-[var(--surface-soft)]" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {isVideo && doneJobs.length > 0 && (
            <div className="border-t border-[var(--line)] bg-[var(--surface-soft)] px-3 py-3 sm:px-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10.5px] font-semibold">
                  Final cut timeline · {formatLength(doneSeconds)}
                  {mergedJob && <span className="ml-1.5 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[8.5px] font-bold text-emerald-600">MERGED</span>}
                </p>
                <span className="muted text-[9px]">{doneJobs.length} clips in sequence · click a frame to preview</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {mergedJob && (
                  <button onClick={() => setPreview(mergedJob)} className="relative h-12 w-24 shrink-0 overflow-hidden rounded-md ring-2 ring-emerald-500" aria-label="Preview merged video">
                    {mergedJob.thumb && <img src={mergedJob.thumb} alt="" className="h-full w-full object-cover" />}
                    <span className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 px-1 text-[7.5px] text-white">
                      <span>FILM</span>
                      <span>{formatLength(mergedJob.seconds)}</span>
                    </span>
                  </button>
                )}
                {doneJobs.map((j) => (
                  <button key={j.id} onClick={() => setPreview(j)} className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md border border-[var(--line)]" aria-label={`Preview ${j.label || "clip"}`}>
                    {j.thumb ? (
                      <img src={j.thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-[var(--surface)] text-[9px] text-[var(--muted)]">{j.label || "clip"}</span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 px-1 text-[7.5px] text-white">
                      <span>{j.label || "clip"}</span>
                      <span>{j.seconds}s</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* footer actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2.5 sm:px-4">
            <div className="flex items-center gap-2">
              <span className="muted text-[10px]">Filter:</span>
              <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="field !w-auto cursor-pointer !py-1.5 !text-[10.5px]" aria-label="Filter">
                <option value="all">All ({jobs.length})</option>
                <option value="queued">Queued ({counts.queued})</option>
                <option value="running">Running ({counts.running})</option>
                <option value="done">Done ({counts.done})</option>
                <option value="failed">Failed ({counts.failed})</option>
              </select>
              <span className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-[10px] font-semibold text-emerald-600">Sel: {selected.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={deleteSelected} className="btn btn-red !px-3 !py-1.5 text-[10.5px]"><Trash2 className="h-3 w-3" /> Delete</button>
              <button onClick={regenSelected} className="btn btn-green !px-3 !py-1.5 text-[10.5px]"><RefreshCw className="h-3 w-3" /> Regen</button>
              <button onClick={rewriteSelected} className="btn !px-3 !py-1.5 text-[10.5px] bg-gradient-to-r from-sky-400 to-indigo-500 text-white"><Pencil className="h-3 w-3" /> Rewrite</button>
              {isVideo && (
                <button onClick={mergeSelected} className="btn btn-green !px-3 !py-1.5 text-[10.5px]"><Link2 className="h-3 w-3" /> Merge</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------- Modals --------------------------- */}
      {showPrefixes && (
        <MiniModal title="Prompt prefixes & suffixes" onClose={() => setShowPrefixes(false)}>
          <p className="muted mb-3 text-[11px] leading-relaxed">
            Added to <b>every</b> prompt in the queue. Great for keeping one look across hundreds of scenes.
          </p>
          <label className="mb-1 block text-[11px] font-semibold">Prefix (before each prompt)</label>
          <textarea rows={3} value={prefix} onChange={(e) => setPrefix(e.target.value)} className="field resize-y !text-[11.5px]" placeholder="Cinematic 35mm film, consistent lighting, same protagonist…" />
          <label className="mb-1 mt-3 block text-[11px] font-semibold">Suffix (after each prompt)</label>
          <textarea rows={3} value={suffix} onChange={(e) => setSuffix(e.target.value)} className="field resize-y !text-[11.5px]" placeholder="no text, no watermark, ultra detailed…" />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Cinematic, 35mm film, shallow depth of field", "Consistent character, same outfit in every scene", "Bangladeshi village, golden hour, lush green", "No text, no watermark, ultra detailed"].map((p) => (
              <button key={p} onClick={() => setPrefix((x) => (x ? `${x}, ${p}` : p))} className="chip hover:border-violet-300">+ {p}</button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => { setPrefix(""); setSuffix(""); }} className="btn btn-soft">Reset</button>
            <button onClick={() => setShowPrefixes(false)} className="btn btn-primary flex-1">Save</button>
          </div>
        </MiniModal>
      )}

      {showCast && (
        <MiniModal title="Characters in this batch" onClose={() => setShowCast(false)}>
          <p className="muted mb-3 text-[11px]">Selected characters are described in every prompt, keeping faces and voices consistent across long videos.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {characters.map((c) => {
              const on = castIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => setCastIds((p) => (on ? p.filter((x) => x !== c.id) : [...p, c.id]))}
                  className={cn("flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition", on ? "border-amber-400 bg-amber-50 dark:bg-amber-400/10" : "border-[var(--line)] bg-[var(--surface-soft)]")}
                >
                  <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[12px] font-bold text-white", c.gradient)}>{c.name[0]}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11.5px] font-semibold">{c.name}</span>
                    <span className="muted block truncate text-[9.5px]">{c.role}</span>
                  </span>
                  {on && <CheckCircle2 className="h-4 w-4 text-amber-500" />}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => { setShowCast(false); setPage("character"); }} className="btn btn-soft"><Plus className="h-4 w-4" /> New character</button>
            <button onClick={() => setShowCast(false)} className="btn btn-primary flex-1">Done</button>
          </div>
        </MiniModal>
      )}

      {rewriteJob && (
        <RewriteModal
          job={rewriteJob}
          onClose={() => setRewriteJob(null)}
          onSave={(prompt) => {
            commit(jobsRef.current.map((j) => (j.id === rewriteJob.id ? { ...j, prompt, status: "queued", progress: 0, error: undefined, thumb: undefined } : j)));
            setRewriteJob(null);
            setSelected([]);
            pushToast("Prompt rewritten and re-queued.");
            if (user) setRunning(true);
          }}
        />
      )}

      {showVault && (
        <MiniModal title="Prompt Vault" onClose={() => setShowVault(false)}>
          <p className="muted mb-3 text-[11px]">Your saved prompts and snippets — insert them into any studio anytime.</p>
          <div className="mb-3 flex gap-2">
            <input
              value={vaultTag}
              onChange={(e) => setVaultTag(e.target.value)}
              placeholder="Tag, e.g. Dhaka ad, horror series…"
              className="field !py-2 !text-[11px]"
              aria-label="Vault tag"
            />
            <button onClick={saveToVault} className="btn btn-primary !py-2">
              <Bookmark className="h-3.5 w-3.5" /> Save box
            </button>
          </div>
          {vault.length ? (
            <div className="space-y-2">
              {vault.map((v) => (
                <div key={v.id} className="flex items-start gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-2.5">
                  <div className="min-w-0 flex-1">
                    <span className="chip !text-[8.5px]">{v.tag}</span>
                    <p className="mt-1 line-clamp-2 text-[10.5px] leading-relaxed">{v.text}</p>
                  </div>
                  <button
                    onClick={() => {
                      setText((t) => (t.trim() ? `${t.trim()}\n\n${v.text}` : v.text));
                      pushToast("Snippet inserted into the box.", "info");
                    }}
                    className="btn btn-soft !px-2.5 !py-1.5 text-[9.5px]"
                  >
                    Insert
                  </button>
                  <button onClick={() => removeSnippet(v.id)} aria-label="Delete snippet" className="muted p-1 hover:text-rose-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted rounded-xl border border-dashed border-[var(--line-strong)] p-4 text-center text-[10.5px]">
              The vault is empty. Write prompts and press “Save box”.
            </p>
          )}
        </MiniModal>
      )}

      {showHistory && (
        <MiniModal title="Recent prompts" onClose={() => setShowHistory(false)}>
          {historyRef.current.length ? (
            <div className="space-y-2">
              {historyRef.current.map((h, i) => (
                <button key={i} onClick={() => restoreHistory(h)} className="block w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-3 text-left transition hover:border-violet-300">
                  <p className="line-clamp-3 text-[10.5px] leading-relaxed">{h}</p>
                  <span className="mt-1 inline-block text-[9px] font-semibold text-violet-600 dark:text-violet-300">Restore →</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="muted rounded-xl border border-dashed border-[var(--line-strong)] p-4 text-center text-[10.5px]">
              Nothing yet — your last five queued prompts will appear here.
            </p>
          )}
        </MiniModal>
      )}

      {preview && (
        <MiniModal title={preview.merged ? "Final merged video" : `Preview · ${preview.label || "result"}`} onClose={() => setPreview(null)} wide>
          <div className="overflow-hidden rounded-2xl bg-black">
            {isVideo ? (
              <video src={preview.src} poster={preview.thumb} controls autoPlay playsInline className="aspect-video w-full" />
            ) : (
              <img src={preview.thumb} alt={preview.prompt} className="max-h-[60vh] w-full object-contain" />
            )}
          </div>
          <p className="muted mt-3 text-[11px] leading-relaxed">{preview.prompt}</p>
          {((preview.score && preview.score !== "None") || (isVideo && preview.narrator && preview.narrator !== "None")) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {preview.score && preview.score !== "None" && (
                <span className="chip">
                  <Volume2 className="h-3 w-3 text-violet-500" /> Score: {preview.score}
                </span>
              )}
              {isVideo && preview.narrator && preview.narrator !== "None" && (
                <button
                  onClick={() => {
                    if (!("speechSynthesis" in window)) return pushToast("Playback isn't supported in this browser.", "error");
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance(preview.prompt);
                    u.rate = 0.95;
                    window.speechSynthesis.speak(u);
                  }}
                  className="chip !border-violet-300 !text-violet-600 hover:!bg-violet-500/10 dark:!text-violet-300"
                >
                  <Volume2 className="h-3 w-3" /> Play voiceover · {preview.narrator}
                </button>
              )}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={isVideo ? preview.src : preview.thumb} target="_blank" rel="noreferrer" download className="btn btn-primary flex-1">
              <Download className="h-4 w-4" /> Download
            </a>
            <button onClick={() => setPreview(null)} className="btn btn-soft">Close</button>
          </div>
        </MiniModal>
      )}
    </div>
  );
}

function RewriteModal({ job, onClose, onSave }: { job: Job; onClose: () => void; onSave: (p: string) => void }) {
  const [value, setValue] = useState(job.prompt);
  const enhance = () =>
    setValue((v) => `${v.replace(/\.$/, "")}. Rich cinematic lighting, detailed textures, natural motion, emotionally expressive.`);
  return (
    <MiniModal title="Rewrite prompt" onClose={onClose}>
      <textarea rows={8} value={value} onChange={(e) => setValue(e.target.value)} className="field resize-y !text-[12px] leading-relaxed" />
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={enhance} className="btn btn-soft"><Sparkles className="h-4 w-4 text-violet-500" /> Enhance</button>
        <button onClick={() => onSave(value.trim() || job.prompt)} className="btn btn-primary flex-1"><RefreshCw className="h-4 w-4" /> Save & regenerate</button>
      </div>
    </MiniModal>
  );
}
