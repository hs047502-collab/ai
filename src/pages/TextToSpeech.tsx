import { useEffect, useRef, useState } from "react";
import {
  AudioLines,
  CheckCircle2,
  Download,
  Gauge,
  Loader2,
  Pause,
  Play,
  Plus,
  Sparkles,
  Square,
  Trash2,
  Volume2,
  Waves,
} from "lucide-react";
import {
  Card,
  CardHeading,
  EmptyState,
  GhostButton,
  IconTile,
  PageHeader,
} from "../components/ui";
import { useApp } from "../store";
import { cn } from "../utils/cn";

export const VOICES = [
  {
    id: "aria",
    name: "Aria",
    tone: "Warm · Narration",
    description: "Polished, friendly and ideal for explainers.",
    gradient: "from-rose-400 via-pink-500 to-fuchsia-500",
  },
  {
    id: "kai",
    name: "Kai",
    tone: "Deep · Cinematic",
    description: "A grounded baritone for trailers and docs.",
    gradient: "from-indigo-500 via-blue-600 to-violet-600",
  },
  {
    id: "nova",
    name: "Nova",
    tone: "Bright · Social",
    description: "Energetic delivery for shorts and ads.",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
  },
  {
    id: "zara",
    name: "Zara",
    tone: "Calm · Audiobook",
    description: "Slow, soothing and deeply listenable.",
    gradient: "from-amber-400 via-orange-500 to-rose-500",
  },
];

const WAVEFORM = Array.from({ length: 56 }, (_, index) => {
  const value = Math.abs(Math.sin(index * 0.62) * Math.cos(index * 0.21));
  return Math.round(18 + value * 80);
});

export function TextToSpeech() {
  const { addGeneration, pushToast, generations, setPage, removeGeneration } = useApp();
  const [text, setText] = useState(
    "Welcome to Hriday AI Studio — where your ideas become motion, images and voice. Create, edit and innovate, all in one place."
  );
  const [voice, setVoice] = useState(VOICES[0]);
  const [rate, setRate] = useState(0.95);
  const [pitch, setPitch] = useState(1);
  const [status, setStatus] = useState<"idle" | "generating" | "ready">("idle");
  const [progress, setProgress] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [lastDuration, setLastDuration] = useState(9);
  const timers = useRef<{ tick?: number; done?: number }>({});
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    const active = timers.current;
    return () => {
      window.clearInterval(active.tick);
      window.clearTimeout(active.done);
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const speak = (content: string, label?: { rate: number; pitch: number }) => {
    if (!supported) {
      pushToast("Speech playback isn't supported in this browser.", "error");
      return;
    }
    window.speechSynthesis.cancel();
    // Long scripts are split into chunks so browsers never cut narration short.
    const chunks: string[] = [];
    content
      .split(/(?<=[.!?।\n])\s+/)
      .forEach((sentence) => {
        const last = chunks[chunks.length - 1];
        if (last && last.length + sentence.length < 220) chunks[chunks.length - 1] = `${last} ${sentence}`;
        else if (sentence.trim()) chunks.push(sentence.trim());
      });
    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.rate = label?.rate ?? rate;
      utterance.pitch = label?.pitch ?? pitch;
      if (index === 0)
        utterance.onstart = () => {
          setSpeaking(true);
          setPaused(false);
        };
      if (index === chunks.length - 1)
        utterance.onend = () => {
          setSpeaking(false);
          setPaused(false);
        };
      utterance.onerror = () => {
        setSpeaking(false);
        setPaused(false);
      };
      window.speechSynthesis.speak(utterance);
    });
  };

  const toggleNarration = () => {
    if (!supported) {
      pushToast("Speech playback isn't supported in this browser.", "error");
      return;
    }
    if (!speaking) {
      speak(text);
      return;
    }
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  };

  const generate = () => {
    if (text.trim().length < 4) {
      pushToast("Add some words for us to speak.", "error");
      return;
    }
    setStatus("generating");
    setProgress(4);
    let value = 4;
    timers.current.tick = window.setInterval(() => {
      value = Math.min(97, value + 8 + Math.random() * 10);
      setProgress(Math.round(value));
    }, 170);
    timers.current.done = window.setTimeout(() => {
      window.clearInterval(timers.current.tick);
      setProgress(100);
      const duration = Math.max(2, Math.round(text.split(/\s+/).length / (2.6 * rate)));
      setLastDuration(duration);
      const created = addGeneration({
        kind: "speech",
        title: `${voice.name} · ${text.trim().slice(0, 34)}${text.trim().length > 34 ? "…" : ""}`,
        prompt: text.trim(),
        meta: `${voice.tone} · ${duration}s`,
      });
      setStatus("ready");
      pushToast("Voiceover rendered and saved to your library.");
      window.setTimeout(() => speak(text), 250);
      return created;
    }, 2300);
  };

  const recent = generations.filter((g) => g.kind === "speech").slice(0, 4);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="fade-in">
      <PageHeader
        icon={AudioLines}
        accent="orange"
        title="Text to Speech"
        subtitle="Give your scripts a voice with studio-quality narration"
        eyebrow="Create"
        actions={
          <>
            <span className="chip !py-2">
              <Volume2 className="h-3.5 w-3.5 text-emerald-500" /> {supported ? "Browser voice studio ready" : "Playback unavailable"}
            </span>
            <GhostButton onClick={() => setPage("library")}>
              <Waves className="h-4 w-4" /> Audio library
            </GhostButton>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-4">
          <Card className="p-4 sm:p-5">
            <CardHeading
              icon={Waves}
              accent="orange"
              title="Your script"
              right={<span className="muted text-[10px]">{words} words · ~{Math.max(1, Math.round(words / 2.5))}s</span>}
            />
            <textarea
              rows={7}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="field mt-4 resize-none !pb-8 !text-[12.5px] leading-relaxed"
              placeholder="Type or paste the script you'd like narrated…"
              aria-label="Script for narration"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1.5">
                <button
                  onClick={() => speak("This is a preview of your selected studio voice.", { rate, pitch })}
                  className="chip transition hover:border-violet-300 hover:text-violet-600"
                >
                  <Play className="h-2.5 w-2.5" /> Preview voice
                </button>
                <button
                  onClick={() => {
                    if (supported) window.speechSynthesis.cancel();
                    setSpeaking(false);
                    setPaused(false);
                  }}
                  className="chip transition hover:border-rose-300 hover:text-rose-500"
                >
                  <Square className="h-2.5 w-2.5" /> Stop
                </button>
              </div>
              <span className="muted text-[9.5px]">{text.length.toLocaleString()} characters · no limit</span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="soft-panel p-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10.5px] font-semibold">
                    <Gauge className="h-3.5 w-3.5 text-orange-500" /> Speed
                  </span>
                  <span className="text-[10px] font-bold text-orange-500">{rate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={1.8}
                  step={0.05}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="mt-2 w-full accent-orange-500"
                  aria-label="Speech speed"
                />
              </div>
              <div className="soft-panel p-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10.5px] font-semibold">
                    <AudioLines className="h-3.5 w-3.5 text-violet-500" /> Pitch
                  </span>
                  <span className="text-[10px] font-bold text-violet-500">{pitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={1.8}
                  step={0.05}
                  value={pitch}
                  onChange={(e) => setPitch(Number(e.target.value))}
                  className="mt-2 w-full accent-violet-500"
                  aria-label="Speech pitch"
                />
              </div>
            </div>

            <button
              onClick={generate}
              disabled={status === "generating"}
              className="btn btn-primary mt-4 w-full !py-3.5 text-[12.5px]"
            >
              {status === "generating" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Rendering voice · {progress}%
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate voiceover
                </>
              )}
            </button>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold">Recent voiceovers</h2>
              <button
                onClick={() => setPage("library")}
                className="text-[10px] font-semibold text-violet-600 dark:text-violet-300"
              >
                View library
              </button>
            </div>
            {recent.length ? (
              <div className="mt-3 space-y-2">
                {recent.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-2.5"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-rose-500 text-white">
                      <AudioLines className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10.5px] font-semibold">{item.title}</p>
                      <p className="muted text-[9px]">{item.meta}</p>
                    </div>
                    <button
                      onClick={() => item.prompt && speak(item.prompt)}
                      className="rounded-lg bg-[var(--surface)] p-1.5 text-violet-500 shadow-sm"
                      aria-label="Play voiceover"
                    >
                      <Play className="h-3 w-3 fill-violet-500" />
                    </button>
                    <button
                      onClick={() => removeGeneration(item.id)}
                      aria-label="Delete voiceover"
                      className="muted rounded-lg p-1.5 transition hover:text-rose-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted mt-2 text-[10.5px]">
                Rendered voiceovers are saved automatically. None yet — try your first line above.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 sm:p-5">
            <CardHeading icon={Volume2} accent="green" title="Voice" />
            <div className="mt-3 grid gap-2">
              {VOICES.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border p-2.5 transition",
                    voice.id === item.id
                      ? "border-orange-300 bg-orange-50/70 dark:border-orange-400/30 dark:bg-orange-400/5"
                      : "border-[var(--line)] bg-[var(--surface-soft)] hover:border-[var(--line-strong)]"
                  )}
                >
                  <button
                    onClick={() => setVoice(item)}
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[12px] font-bold text-white shadow-sm",
                      item.gradient
                    )}
                    aria-label={`Select voice ${item.name}`}
                  >
                    {item.name.slice(0, 1)}
                  </button>
                  <button onClick={() => setVoice(item)} className="min-w-0 flex-1 text-left">
                    <p className="text-[11.5px] font-semibold">
                      {item.name}
                      {voice.id === item.id && (
                        <span className="ml-1.5 text-[8.5px] font-bold uppercase tracking-wide text-orange-500">
                          selected
                        </span>
                      )}
                    </p>
                    <p className="muted text-[9px]">{item.tone}</p>
                  </button>
                  <button
                    onClick={() => speak(`Hi, I'm ${item.name}. ${item.description}`, { rate, pitch })}
                    className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-1.5 text-violet-600 shadow-sm transition hover:bg-violet-50 dark:text-violet-300"
                    aria-label={`Preview ${item.name}`}
                  >
                    <Play className="h-3 w-3 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-[#1b1237] via-[#231546] to-[#120c26] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-300/70">
                    Preview studio
                  </p>
                  <p className="mt-0.5 text-[13px] font-semibold text-white">
                    {voice.name} · {voice.tone.split(" · ")[1]}
                  </p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <AudioLines className="h-4 w-4 text-violet-200" />
                </span>
              </div>

              <div className="mt-4 flex h-[68px] items-center gap-[2px]">
                {WAVEFORM.map((height, index) => (
                  <span
                    key={index}
                    className={cn(
                      "flex-1 rounded-full transition-all duration-300",
                      status === "generating"
                        ? "bg-violet-400/70"
                        : speaking
                          ? "bg-gradient-to-t from-violet-500 to-fuchsia-300"
                          : "bg-white/20"
                    )}
                    style={{
                      height: `${status === "generating" ? Math.max(8, (height * progress) / 100) : height * 0.72}%`,
                      animation: status === "generating" ? `pulse 1s ease-in-out ${index * 0.02}s infinite` : undefined,
                    }}
                  />
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleNarration}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-violet-700 shadow-lg transition hover:scale-105"
                    aria-label={speaking && !paused ? "Pause narration" : "Play narration"}
                  >
                    {status === "generating" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : speaking && !paused ? (
                      <Pause className="h-4 w-4 fill-violet-700" />
                    ) : (
                      <Play className="ml-0.5 h-4 w-4 fill-violet-700" />
                    )}
                  </button>
                  <div>
                    <p className="text-[10px] font-semibold text-white">
                      {status === "generating"
                        ? "Rendering…"
                        : status === "ready"
                          ? `${voice.name} narration`
                          : "Voice preview"}
                    </p>
                    <p className="text-[8.5px] text-violet-200/60">
                      {status === "ready" ? `Rendered · ${lastDuration}s` : `${rate.toFixed(2)}x · pitch ${pitch.toFixed(2)}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => pushToast("Voiceover saved to downloads — demo file prepared.")}
                  className="rounded-lg border border-white/15 bg-white/10 p-2 text-white/80 transition hover:bg-white/20"
                  aria-label="Download voiceover"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>

              {status === "generating" && (
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 px-3.5 py-3">
              {status === "ready" ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <p className="muted text-[9.5px] leading-relaxed">
                    Saved to your studio library. You can re-render anytime at no extra cost.
                  </p>
                </>
              ) : (
                <>
                  <IconTile icon={Sparkles} accent="violet" size="sm" />
                  <p className="muted text-[9.5px] leading-relaxed">
                    Pick a voice, tune the pace and generate studio narration in seconds.
                  </p>
                </>
              )}
            </div>
          </Card>

          {!recent.length && (
            <EmptyState
              icon={AudioLines}
              title="Your voice reel is empty"
              description="Generate your first voiceover and it will land here, ready to reuse in videos."
              action={
                <button onClick={() => setPage("video")} className="btn btn-soft">
                  <Plus className="h-4 w-4" /> Pair with a video
                </button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
