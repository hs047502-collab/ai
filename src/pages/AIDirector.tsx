import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Clapperboard,
  Copy,
  Download,
  Film,
  Loader2,
  Music,
  Play,
  SlidersHorizontal,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  Card,
  CardHeading,
  EmptyState,
  GhostButton,
  IconTile,
  PageHeader,
  StatusChip,
} from "../components/ui";
import { useApp } from "../store";
import { cn } from "../utils/cn";

const GENRES = ["Sci-fi", "Documentary", "Product film", "Fantasy", "Social ad", "Music video"];
const TONES = ["Cinematic", "Uplifting", "Mysterious", "Playful", "Editorial"];
const PACING = ["Slow & immersive", "Balanced", "Fast cuts"];

const IDEA_STARTERS = [
  "A lone astronaut discovers a hidden garden growing on the dark side of the moon",
  "A young chef opens a tiny midnight ramen shop that only appears in the rain",
  "Launch film for a pair of AI glasses that translate the world as you look at it",
  "A street dancer teaches a robot how to feel rhythm for the first time",
];

const SHOT_TEMPLATES = [
  {
    type: "Establishing",
    camera: "Wide · slow push-in",
    visual: "Set the world and scale",
    line: "Open on the environment before we meet our subject. Let the light tell the story.",
  },
  {
    type: "Character",
    camera: "Medium close-up · 50mm",
    visual: "Meet the protagonist",
    line: "Introduce the character in their element. Keep the background soft and alive.",
  },
  {
    type: "Detail",
    camera: "Macro · shallow focus",
    visual: "The story object",
    line: "Reveal the detail that changes everything. Hold it a beat longer than comfortable.",
  },
  {
    type: "Turning point",
    camera: "Handheld · tracking",
    visual: "Raise the stakes",
    line: "The moment of decision. Movement should feel urgent but controlled.",
  },
  {
    type: "Payoff",
    camera: "Wide · crane up",
    visual: "Emotional resolution",
    line: "Pull back and let the scale land. The music swells here.",
  },
  {
    type: "Outro",
    camera: "Static · centered",
    visual: "Brand / title frame",
    line: "Land the title on a clean, glowing frame with enough room for the logo.",
  },
];

interface Shot {
  number: number;
  title: string;
  type: string;
  camera: string;
  visual: string;
  line: string;
  duration: string;
}

export function AIDirector() {
  const { geminiKey, openGemini, pushToast, addGeneration, setPage } = useApp();
  const [premise, setPremise] = useState("");
  const [genre, setGenre] = useState(GENRES[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [pacing, setPacing] = useState(PACING[1]);
  const [music, setMusic] = useState("Ambient synth");
  const [status, setStatus] = useState<"idle" | "building" | "ready">("idle");
  const [shots, setShots] = useState<Shot[]>([]);
  const [progress, setProgress] = useState(0);
  const timers = useRef<{ tick?: number; done?: number }>({});

  useEffect(() => {
    const active = timers.current;
    return () => {
      window.clearInterval(active.tick);
      window.clearTimeout(active.done);
    };
  }, []);

  const build = () => {
    if (premise.trim().length < 12) {
      pushToast("Describe your idea in a little more detail (12+ characters).", "error");
      return;
    }
    setStatus("building");
    setProgress(8);
    setShots([]);
    let value = 8;
    timers.current.tick = window.setInterval(() => {
      value = Math.min(94, value + 6 + Math.random() * 9);
      setProgress(Math.round(value));
    }, 190);
    timers.current.done = window.setTimeout(() => {
      window.clearInterval(timers.current.tick);
      setProgress(100);
      const count = pacing === "Fast cuts" ? 6 : pacing === "Balanced" ? 5 : 4;
      const seconds = pacing === "Slow & immersive" ? 6 : pacing === "Balanced" ? 4 : 2;
      const built: Shot[] = SHOT_TEMPLATES.slice(0, count).map((template, index) => ({
        number: index + 1,
        title:
          [
            "Opening image",
            "Meet the protagonist",
            "The story object",
            "The turning point",
            "The payoff",
            "Closing frame",
          ][index] ?? template.type,
        type: template.type,
        camera: template.camera,
        visual: template.visual,
        line: `${template.line} (${tone.toLowerCase()} tone, ${music.toLowerCase()} score)`,
        duration: `${seconds}s`,
      }));
      setShots(built);
      setStatus("ready");
      addGeneration({
        kind: "storyboard",
        title: premise.trim().slice(0, 52),
        prompt: premise.trim(),
        meta: `${genre} · ${built.length} shots · ${tone}`,
      });
      pushToast("Storyboard built and saved to your studio.");
    }, 2100);
  };

  const totalDuration = shots.reduce((sum, shot) => sum + Number.parseInt(shot.duration), 0);

  return (
    <div className="fade-in">
      <PageHeader
        icon={Clapperboard}
        accent="cyan"
        title="AI Director"
        subtitle="Turn a one-line premise into a shot-by-shot storyboard"
        eyebrow="Plan"
        actions={
          <>
            <span className="chip !py-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-500" /> {shots.length || 0} shots
            </span>
            <GhostButton onClick={() => setPage("video")}>
              <VideoIcon /> Render a scene
            </GhostButton>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-4 sm:p-5">
          <CardHeading
            icon={Wand2}
            accent="cyan"
            title="What are we making?"
            right={
              <button
                onClick={geminiKey ? () => setPremise(IDEA_STARTERS[Math.floor(Math.random() * IDEA_STARTERS.length)]) : openGemini}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10px] font-semibold transition",
                  geminiKey
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                    : "border-violet-400/30 bg-violet-500/10 text-violet-600 dark:text-violet-300"
                )}
              >
                <Sparkles className="h-3 w-3" /> {geminiKey ? "Gemini assist" : "Connect Gemini"}
              </button>
            }
          />
          <textarea
            rows={5}
            value={premise}
            onChange={(e) => setPremise(e.target.value)}
            className="field mt-4 resize-none !pb-8 !text-[12.5px] leading-relaxed"
            placeholder="A young photographer discovers that every photo she takes predicts a moment one hour in the future…"
            aria-label="Film premise"
          />
          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={() => {
                setPremise(IDEA_STARTERS[Math.floor(Math.random() * IDEA_STARTERS.length)]);
                pushToast("Idea loaded — make it yours.", "info");
              }}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-600 dark:text-violet-300"
            >
              <Sparkles className="h-3 w-3" /> Inspire me
            </button>
            <span className="muted text-[9.5px]">{premise.length.toLocaleString()} chars · no limit</span>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-[11px] font-semibold">Genre</p>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map((item) => (
                <button
                  key={item}
                  onClick={() => setGenre(item)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[10px] font-semibold transition",
                    genre === item
                      ? "border-cyan-400 bg-cyan-500 text-white"
                      : "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)] hover:border-cyan-300"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-[11px] font-semibold">Reference starters</p>
            <div className="space-y-1.5">
              {IDEA_STARTERS.slice(0, 2).map((idea) => (
                <button
                  key={idea}
                  onClick={() => setPremise(idea)}
                  className="flex w-full items-start gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-2.5 text-left transition hover:border-cyan-300"
                >
                  <Clapperboard className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-500" />
                  <span className="text-[10px] leading-relaxed">{idea}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <CardHeading icon={SlidersHorizontal} accent="violet" title="Director settings" />
          <div className="mt-4 space-y-3.5">
            <div>
              <p className="mb-2 text-[11px] font-semibold">Tone</p>
              <div className="grid grid-cols-2 gap-1.5">
                {TONES.map((item) => (
                  <button
                    key={item}
                    onClick={() => setTone(item)}
                    className={cn(
                      "rounded-lg border px-2 py-1.5 text-[10px] font-semibold transition",
                      tone === item
                        ? "border-violet-400 bg-violet-500/10 text-violet-600 dark:text-violet-300"
                        : "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)]"
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="pacing" className="mb-1.5 block text-[11px] font-semibold">
                Pacing
              </label>
              <select
                id="pacing"
                className="field cursor-pointer"
                value={pacing}
                onChange={(e) => setPacing(e.target.value)}
              >
                {PACING.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="music" className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold">
                <Music className="h-3.5 w-3.5 text-violet-500" /> Music mood
              </label>
              <select
                id="music"
                className="field cursor-pointer"
                value={music}
                onChange={(e) => setMusic(e.target.value)}
              >
                {["Ambient synth", "Orchestral swell", "Lo-fi beats", "Minimal piano", "None"].map(
                  (item) => (
                    <option key={item}>{item}</option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-violet-300/30 bg-violet-50/70 px-3 py-2 dark:bg-violet-500/5">
            <IconTile icon={Film} accent="violet" size="sm" />
            <div>
              <p className="text-[10px] font-semibold">Estimated length</p>
              <p className="muted text-[9px]">
                {shots.length ? `${totalDuration}s · ${shots.length} shots` : "Built from your pacing"}
              </p>
            </div>
          </div>

          <button
            onClick={build}
            disabled={status === "building"}
            className="btn btn-primary mt-4 w-full !py-3.5"
          >
            {status === "building" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Directing · {progress}%
              </>
            ) : (
              <>
                <Clapperboard className="h-4 w-4" /> Build storyboard
              </>
            )}
          </button>
          <p className="muted mt-2 text-center text-[9px]">
            {status === "building" ? "Casting shots and writing beats…" : "One click · no credits used"}
          </p>
        </Card>
      </div>

      <Card className="mt-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <IconTile icon={Clapperboard} accent="cyan" size="sm" />
            <div>
              <h2 className="text-[15px] font-semibold">Storyboard</h2>
              <p className="muted text-[10px]">
                {shots.length ? `${premise.trim().slice(0, 70)}` : "Your shot list will appear here"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {status === "ready" && <StatusChip tone="green"><CheckCircle2 className="h-2.5 w-2.5" /> Saved</StatusChip>}
            <button
              onClick={() => pushToast("Storyboard export prepared — demo PDF ready.")}
              disabled={!shots.length}
              className="btn btn-ghost !py-2 text-[10px]"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button
              onClick={() => {
                setPage("video");
                pushToast("Opening Video Generation with your board in mind.", "info");
              }}
              disabled={!shots.length}
              className="btn btn-primary !py-2 text-[10px]"
            >
              <Play className="h-3.5 w-3.5" /> Render trailer
            </button>
          </div>
        </div>

        {status === "building" && !shots.length ? (
          <div className="mt-5 space-y-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-3.5"
              >
                <div className="h-9 w-9 rounded-xl bg-[var(--track)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 w-1/3 rounded-full bg-[var(--track)]" />
                  <div className="h-2 w-2/3 rounded-full bg-[var(--track)]/70" />
                </div>
                <div className="h-5 w-10 rounded-full bg-[var(--track)]" />
              </div>
            ))}
          </div>
        ) : shots.length ? (
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {shots.map((shot) => (
              <div
                key={shot.number}
                className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-3.5 transition hover:border-cyan-300"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 text-[12px] font-bold text-white shadow-sm">
                    {String(shot.number).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-[11.5px] font-semibold">{shot.title}</p>
                      <span className="shrink-0 rounded-full bg-[var(--surface)] px-2 py-0.5 text-[8.5px] font-bold text-cyan-600 dark:text-cyan-300">
                        {shot.duration}
                      </span>
                    </div>
                    <p className="muted mt-0.5 flex items-center gap-1 text-[9px]">
                      <Camera className="h-2.5 w-2.5" /> {shot.camera} · {shot.type}
                    </p>
                    <p className="mt-1.5 text-[10px] leading-relaxed">{shot.line}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="chip !text-[8.5px]">{shot.visual}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard
                            ?.writeText(`${shot.title} — ${shot.camera}. ${shot.line}`)
                            .then(() => pushToast("Shot copied to clipboard.", "info"))
                            .catch(() => pushToast("Couldn't access clipboard.", "error"));
                        }}
                        className="muted inline-flex items-center gap-1 text-[9px] font-semibold transition hover:text-cyan-600"
                      >
                        <Copy className="h-2.5 w-2.5" /> Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              icon={Clapperboard}
              title="No storyboard yet"
              description="Drop in a premise, choose a tone and let the AI Director block your first sequence. It takes about two seconds."
              action={
                <button
                  onClick={() => {
                    setPremise(IDEA_STARTERS[0]);
                    pushToast("Example premise loaded — press Build storyboard.", "info");
                  }}
                  className="btn btn-primary"
                >
                  <Wand2 className="h-4 w-4" /> Load an example idea
                </button>
              }
            />
          </div>
        )}

        {shots.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] pt-3">
            <span className="muted text-[10px]">
              {genre} · {tone} · {pacing} · {music}
            </span>
            <button
              onClick={() => setPage("library")}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-600 dark:text-cyan-300"
            >
              Open in library <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

function VideoIcon() {
  return <Film className="h-4 w-4" />;
}
