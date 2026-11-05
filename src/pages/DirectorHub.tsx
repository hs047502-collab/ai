import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Clapperboard,
  Copy,
  FileText,
  Film,
  Image as ImageIcon,
  KeyRound,
  Lightbulb,
  ScrollText,
  Sparkles,
  Wand2,
} from "lucide-react";
import { AIDirector } from "./AIDirector";
import { splitPrompts } from "../components/BatchStudio";
import { useApp } from "../store";
import { cn } from "../utils/cn";

const SHOTS = [
  "Wide establishing shot",
  "Medium shot",
  "Close-up",
  "Over-the-shoulder shot",
  "Slow dolly-in",
  "Low-angle hero shot",
  "Tracking shot",
  "Aerial drone shot",
];

const IDEA_GENRES = ["Drama", "Sci-fi", "Horror", "Comedy", "Documentary", "Music video", "Fantasy", "Romance"];
const IDEA_TONES = ["Cinematic", "Uplifting", "Mysterious", "Playful", "Dark"];

function IdeaToVideo({ onBack }: { onBack: () => void }) {
  const { setPendingPrompts, setPage, pushToast, customStyles } = useApp();
  const [idea, setIdea] = useState("");
  const [genre, setGenre] = useState("Drama");
  const [tone, setTone] = useState("Cinematic");
  const [style, setStyle] = useState("Cinematic");
  const [shotCount, setShotCount] = useState(5);

  const scenes = useMemo(() => {
    if (!idea.trim()) return [];
    const i = idea.trim().replace(/[.!?।]+$/, "");
    const base = [
      `Cinematic opening: ${i} — the world is calm, everything about to change.`,
      `Something stirs. A close shot finds the first clue, ${genre.toLowerCase()} tension building.`,
      `A moment of decision. The camera pushes in slowly as the story unfolds.`,
      `The stakes rise fast — motion and chaos, ${tone.toLowerCase()} energy at its peak.`,
      `The turning point: ${i} — but now everything is at risk.`,
      `Resolution and payoff, ending on a final title card glowing on a clean frame.`,
    ];
    return base.slice(0, shotCount).map((line) => `${line} ${style} style, consistent characters and lighting.`);
  }, [idea, genre, tone, style, shotCount]);

  const send = () => {
    if (!scenes.length) return pushToast("Describe your idea first.", "error");
    setPendingPrompts({ kind: "video", text: scenes.join("\n\n") });
    setPage("video");
  };

  return (
    <div className="fade-in">
      <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-[var(--line)] pb-3">
        <button onClick={onBack} className="btn btn-ghost !py-2 text-[11px]"><ArrowLeft className="h-3.5 w-3.5" /> AI Director</button>
        <h1 className="text-[17px] font-bold">Idea to Video</h1>
        <span className="chip">No Gemini needed — works offline</span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="card p-4 sm:p-5">
          <h2 className="mb-2 flex items-center gap-2 text-[14px] font-semibold"><Lightbulb className="h-4 w-4 text-amber-500" /> One-line idea</h2>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="field min-h-[140px] resize-y !text-[12.5px] leading-relaxed"
            placeholder="Example: A lighthouse keeper in coastal Bangladesh discovers his light is guiding something that is not a ship…"
            aria-label="Idea"
          />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-[11px] font-semibold">Genre</p>
              <div className="flex flex-wrap gap-1.5">
                {IDEA_GENRES.map((g) => (
                  <button key={g} onClick={() => setGenre(g)} className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold", genre === g ? "border-amber-400 bg-amber-500 text-white" : "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)]")}>{g}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold">Tone</p>
              <div className="flex flex-wrap gap-1.5">
                {IDEA_TONES.map((t) => (
                  <button key={t} onClick={() => setTone(t)} className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold", tone === t ? "border-cyan-400 bg-cyan-500 text-white" : "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)]")}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="idea-style" className="mb-1.5 block text-[11px] font-semibold">Style</label>
              <select id="idea-style" className="field cursor-pointer !py-2 !text-[11px]" value={style} onChange={(e) => setStyle(e.target.value)}>
                {["Cinematic", "Realistic", "Anime", "3D Pixar", "Ghibli", "Documentary", "Watercolor", "Claymation", ...customStyles].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold">Scenes</p>
              <div className="grid grid-cols-4 gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-1">
                {[3, 4, 5, 6].map((n) => (
                  <button key={n} onClick={() => setShotCount(n)} className={cn("rounded-lg py-1.5 text-[10.5px] font-semibold", shotCount === n ? "bg-[var(--surface)] text-amber-600 shadow-sm" : "muted")}>{n}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card flex flex-col p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-[14px] font-semibold"><Clapperboard className="h-4 w-4 text-amber-500" /> Scene breakdown</h2>
            <span className="chip">{scenes.length} scenes</span>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 400 }}>
            {scenes.length ? (
              scenes.map((sc, i) => (
                <div key={i} className="flex gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 text-[10px] font-bold text-white">{i + 1}</span>
                  <p className="text-[10.5px] leading-relaxed">{sc}</p>
                </div>
              ))
            ) : (
              <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center">
                <Wand2 className="mb-2 h-7 w-7 text-amber-400" />
                <p className="text-[12px] font-semibold">Your scene breakdown appears here</p>
                <p className="muted mt-1 max-w-xs text-[10.5px]">One idea in, a ready-to-render scene list out.</p>
              </div>
            )}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button onClick={send} className="btn btn-green !py-3"><Film className="h-4 w-4" /> Send to Video queue</button>
            <button
              onClick={() => { if (scenes.length) navigator.clipboard?.writeText(scenes.join("\n\n")).then(() => pushToast("Scene list copied.")); }}
              className="btn btn-soft !py-3"
            >
              <Copy className="h-4 w-4" /> Copy list
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScriptToVideo({ onBack }: { onBack: () => void }) {
  const { setPendingPrompts, setPage, pushToast, geminiKey, openGemini, customStyles } = useApp();
  const [script, setScript] = useState("");
  const [splitBy, setSplitBy] = useState<"sentence" | "paragraph">("sentence");
  const [style, setStyle] = useState("Cinematic");
  const [customStyle, setCustomStyle] = useState("");
  const [setting, setSetting] = useState("");
  const [shotVariety, setShotVariety] = useState(true);
  const [clip, setClip] = useState(8);

  const styleText = customStyle.trim() || style;

  const scenes = useMemo(() => {
    if (!script.trim()) return [];
    const parts =
      splitBy === "paragraph"
        ? script.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean)
        : splitPrompts(script.replace(/\n+/g, " "), true).flatMap((b) =>
            b.split(/(?<=[.!?।])\s+/).map((s) => s.trim()).filter(Boolean)
          );
    return parts.map((line, i) => {
      const shot = shotVariety ? SHOTS[i % SHOTS.length] : "Cinematic shot";
      return `${shot}: ${line}${setting.trim() ? ` Setting: ${setting.trim()}.` : ""} ${styleText} style, consistent characters and lighting.`;
    });
  }, [script, splitBy, shotVariety, setting, styleText]);

  const total = scenes.length * clip;
  const words = script.trim() ? script.trim().split(/\s+/).length : 0;

  const send = (kind: "video" | "image") => {
    if (!scenes.length) return pushToast("Paste a script first.", "error");
    setPendingPrompts({ kind, text: scenes.join("\n\n") });
    setPage(kind);
  };

  return (
    <div className="fade-in">
      <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-[var(--line)] pb-3">
        <button onClick={onBack} className="btn btn-ghost !py-2 text-[11px]">
          <ArrowLeft className="h-3.5 w-3.5" /> AI Director
        </button>
        <h1 className="text-[17px] font-bold">Script to Video</h1>
        <span className="chip">Unlimited script length</span>
      </div>

      {!geminiKey && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-300/40 bg-amber-50/80 p-3 dark:bg-amber-400/5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-400/15">
            <KeyRound className="h-4 w-4" />
          </span>
          <p className="flex-1 text-[11px] text-amber-800 dark:text-amber-200">
            Works offline with smart sentence splitting. Connect Gemini for even richer, AI-written scene prompts.
          </p>
          <button onClick={openGemini} className="btn btn-primary !py-2 text-[10.5px]">Connect Gemini</button>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="card p-4 sm:p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[14px] font-semibold"><ScrollText className="h-4 w-4 text-cyan-500" /> Your script</h2>
            <span className="muted text-[10px]">{words.toLocaleString()} words · {script.length.toLocaleString()} chars</span>
          </div>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="field min-h-[320px] resize-y !text-[12.5px] leading-relaxed"
            placeholder="Paste your full story, YouTube script, or narration here — any length. Bangla or English both work.&#10;&#10;Example: Long ago, in a quiet village beside the Padma river, lived a young boatman named Rahim. Every morning he rowed across the misty water…"
            aria-label="Script"
          />
          <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-[10.5px] font-semibold text-violet-600 dark:text-violet-300">
            <FileText className="h-3.5 w-3.5" /> Import .txt
            <input
              type="file"
              accept=".txt,.md,.srt"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = () => setScript(String(r.result || ""));
                r.readAsText(f);
              }}
            />
          </label>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-[11px] font-semibold">Split into scenes by</p>
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-1">
                {(["sentence", "paragraph"] as const).map((v) => (
                  <button key={v} onClick={() => setSplitBy(v)} className={cn("rounded-lg py-1.5 text-[10.5px] font-semibold capitalize", splitBy === v ? "bg-[var(--surface)] text-cyan-600 shadow-sm" : "muted")}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold">Clip length</p>
              <div className="grid grid-cols-3 gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-1">
                {[4, 6, 8].map((c) => (
                  <button key={c} onClick={() => setClip(c)} className={cn("rounded-lg py-1.5 text-[10.5px] font-semibold", clip === c ? "bg-[var(--surface)] text-cyan-600 shadow-sm" : "muted")}>{c}s</button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold">Style</p>
              <select className="field cursor-pointer !py-2 !text-[11px]" value={style} onChange={(e) => setStyle(e.target.value)}>
                {["Cinematic", "Realistic", "Anime", "3D Pixar", "Ghibli", "Cartoon", "Documentary", "Watercolor", ...customStyles].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold">Or type any style</p>
              <input className="field !py-2 !text-[11px]" placeholder="e.g. 1970s Bollywood film" value={customStyle} onChange={(e) => setCustomStyle(e.target.value)} />
            </div>
          </div>
          <input className="field mt-3 !py-2 !text-[11px]" placeholder="Shared setting (optional) — e.g. rural Bangladesh, monsoon season" value={setting} onChange={(e) => setSetting(e.target.value)} />
          <label className="mt-3 flex items-center gap-2 text-[11px]">
            <input type="checkbox" checked={shotVariety} onChange={(e) => setShotVariety(e.target.checked)} className="accent-cyan-600" />
            Vary camera shots automatically (wide, close-up, drone…)
          </label>
        </div>

        <div className="card flex flex-col p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-[14px] font-semibold"><Clapperboard className="h-4 w-4 text-cyan-500" /> Scene prompts</h2>
            <span className="chip">{scenes.length} scenes · ≈ {total >= 60 ? `${Math.floor(total / 60)}m ${total % 60}s` : `${total}s`}</span>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 460 }}>
            {scenes.length ? (
              scenes.map((s, i) => (
                <div key={i} className="flex gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-sky-600 text-[10px] font-bold text-white">{i + 1}</span>
                  <p className="text-[10.5px] leading-relaxed">{s}</p>
                </div>
              ))
            ) : (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
                <Wand2 className="mb-2 h-7 w-7 text-cyan-400" />
                <p className="text-[12px] font-semibold">Scenes appear as you type</p>
                <p className="muted mt-1 max-w-xs text-[10.5px]">Every sentence becomes a detailed, shot-aware video prompt.</p>
              </div>
            )}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <button onClick={() => send("video")} className="btn btn-green !py-3"><Film className="h-4 w-4" /> Send to Video</button>
            <button onClick={() => send("image")} className="btn btn-primary !py-3"><ImageIcon className="h-4 w-4" /> Send to Image</button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(scenes.join("\n\n")).then(() => pushToast("All scene prompts copied."));
              }}
              disabled={!scenes.length}
              className="btn btn-soft !py-3"
            >
              <Copy className="h-4 w-4" /> Copy all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DirectorHub() {
  const [view, setView] = useState<"home" | "storyboard" | "script" | "idea">("home");

  if (view === "script") return <ScriptToVideo onBack={() => setView("home")} />;
  if (view === "idea") return <IdeaToVideo onBack={() => setView("home")} />;
  if (view === "storyboard")
    return (
      <div>
        <button onClick={() => setView("home")} className="btn btn-ghost mb-3 !py-2 text-[11px]">
          <ArrowLeft className="h-3.5 w-3.5" /> AI Director
        </button>
        <AIDirector />
      </div>
    );

  const tools = [
    { id: "idea" as const, title: "Idea to Video", body: "One line of imagination becomes a full scene breakdown — works offline, no Gemini required.", icon: Lightbulb, grad: "from-amber-400 to-orange-600" },
    { id: "script" as const, title: "Script to Video", body: "Paste a script of any length — get one scene prompt per sentence, ready for the video queue.", icon: ScrollText, grad: "from-cyan-400 to-sky-600" },
    { id: "storyboard" as const, title: "Idea to Storyboard", body: "Turn a one-line idea into a shot list with camera moves, pacing and music mood.", icon: Clapperboard, grad: "from-violet-500 to-purple-700" },
  ];

  return (
    <div className="fade-in">
      <div className="mb-5 rounded-[26px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-500">Plan</p>
        <h1 className="text-2xl font-bold">AI Director</h1>
        <p className="muted mt-1 text-[12px]">Plan long-form videos before you render a single frame.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((t) => (
          <button key={t.id} onClick={() => setView(t.id)} className="card group p-5 text-left transition hover:-translate-y-1">
            <span className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow", t.grad)}>
              <t.icon className="h-6 w-6" />
            </span>
            <h2 className="text-[16px] font-bold">{t.title}</h2>
            <p className="muted mt-1.5 text-[11.5px] leading-relaxed">{t.body}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-violet-600 dark:text-violet-300">
              Open tool <Sparkles className="h-3 w-3" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
