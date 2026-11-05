import { useState } from "react";
import {
  AudioLines,
  Check,
  Plus,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  Video,
  Wand2,
} from "lucide-react";
import {
  Card,
  CardHeading,
  IconTile,
  PageHeader,
  PrimaryButton,
  StatusChip,
} from "../components/ui";
import { useApp } from "../store";
import { cn } from "../utils/cn";

const VOICE_OPTIONS = ["Aria · Warm", "Kai · Cinematic", "Nova · Bright", "Zara · Calm"];
const GRADIENTS = [
  "from-indigo-500 via-violet-500 to-fuchsia-500",
  "from-rose-400 via-pink-500 to-orange-400",
  "from-emerald-400 via-teal-500 to-cyan-500",
  "from-amber-400 via-orange-500 to-red-500",
  "from-sky-400 via-blue-500 to-indigo-500",
  "from-violet-500 via-purple-500 to-pink-500",
];
const PERSONALITY = [
  "Confident",
  "Warm",
  "Playful",
  "Mysterious",
  "Energetic",
  "Calm",
  "Witty",
  "Inspirational",
];

export function CharacterStudio() {
  const { characters, addCharacter, removeCharacter, setPage, pushToast } = useApp();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [voice, setVoice] = useState(VOICE_OPTIONS[0]);
  const [gradient, setGradient] = useState(GRADIENTS[0]);
  const [traits, setTraits] = useState<string[]>(["Warm", "Confident"]);

  const toggleTrait = (trait: string) => {
    setTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait].slice(0, 4)
    );
  };

  const create = () => {
    if (name.trim().length < 2 || role.trim().length < 2) {
      pushToast("Give your character a name and a role first.", "error");
      return;
    }
    addCharacter({
      name: name.trim(),
      role: role.trim(),
      bio:
        bio.trim() ||
        `${name.trim()} is a ${role.trim().toLowerCase()} with a voice made for memorable stories.`,
      voice,
      gradient,
    });
    pushToast(`${name.trim()} joined your character cast.`);
    setName("");
    setRole("");
    setBio("");
  };

  return (
    <div className="fade-in">
      <PageHeader
        icon={UserRound}
        accent="blue"
        title="Character Studio"
        subtitle="Build consistent AI personalities for your videos and voiceovers"
        eyebrow="Create"
        actions={
          <>
            <span className="chip !py-2">
              <Users className="h-3.5 w-3.5 text-blue-500" /> {characters.length} in your cast
            </span>
            <button onClick={() => setPage("video")} className="btn btn-primary !py-2.5">
              <Video className="h-4 w-4" /> Use in a video
            </button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-4 sm:p-5">
          <CardHeading icon={Wand2} accent="blue" title="Create a character" />
          <p className="muted mt-1 text-[10.5px]">
            Your character keeps the same look and voice across every project.
          </p>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-3">
            <div
              className={cn(
                "relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xl font-bold text-white shadow-lg",
                gradient
              )}
            >
              {name.trim() ? name.trim().slice(0, 1).toUpperCase() : <UserRound className="h-6 w-6" />}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-white text-violet-600 dark:bg-[var(--surface-soft)]">
                <Sparkles className="h-3 w-3" />
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold">{name.trim() || "New character"}</p>
              <p className="muted mt-0.5 truncate text-[10px]">
                {role.trim() || "Give them a role"}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {traits.slice(0, 3).map((trait) => (
                  <span key={trait} className="rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[8px] font-semibold text-violet-600 dark:text-violet-300">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="char-name" className="mb-1.5 block text-[11px] font-semibold">
                Name
              </label>
              <input
                id="char-name"
                className="field"
                placeholder="Nova"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 30))}
              />
            </div>
            <div>
              <label htmlFor="char-role" className="mb-1.5 block text-[11px] font-semibold">
                Role
              </label>
              <input
                id="char-role"
                className="field"
                placeholder="Tech host"
                value={role}
                onChange={(e) => setRole(e.target.value.slice(0, 36))}
              />
            </div>
          </div>

          <div className="mt-3">
            <label htmlFor="char-bio" className="mb-1.5 block text-[11px] font-semibold">
              Personality & backstory
            </label>
            <textarea
              id="char-bio"
              rows={3}
              className="field resize-none !text-[11.5px] leading-relaxed"
              placeholder="A curious storyteller who turns complex ideas into friendly, vivid explanations…"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 240))}
            />
          </div>

          <div className="mt-3">
            <p className="mb-2 text-[11px] font-semibold">Personality tags (up to 4)</p>
            <div className="flex flex-wrap gap-1.5">
              {PERSONALITY.map((trait) => (
                <button
                  key={trait}
                  onClick={() => toggleTrait(trait)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[9.5px] font-semibold transition",
                    traits.includes(trait)
                      ? "border-violet-400 bg-violet-500 text-white"
                      : "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)] hover:border-violet-300"
                  )}
                >
                  {traits.includes(trait) && <Check className="mr-0.5 inline h-2.5 w-2.5" />}
                  {trait}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="char-voice" className="mb-1.5 block text-[11px] font-semibold">
                Voice
              </label>
              <select
                id="char-voice"
                className="field cursor-pointer"
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
              >
                {VOICE_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold">Avatar palette</p>
              <div className="flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-2 py-2">
                {GRADIENTS.map((item) => (
                  <button
                    key={item}
                    onClick={() => setGradient(item)}
                    aria-label="Select avatar colour"
                    className={cn(
                      "h-5 w-5 rounded-full bg-gradient-to-br transition",
                      item,
                      gradient === item
                        ? "ring-2 ring-violet-500 ring-offset-2 ring-offset-[var(--surface-soft)]"
                        : "opacity-75 hover:opacity-100"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <PrimaryButton onClick={create} className="mt-4 w-full !py-3">
            <Plus className="h-4 w-4" /> Add to cast
          </PrimaryButton>
        </Card>

        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-[14px] font-semibold">Your cast</h2>
            <span className="muted text-[10px]">
              {characters.length} character{characters.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {characters.map((character) => (
              <Card
                key={character.id}
                className="group flex flex-col overflow-hidden !rounded-2xl transition hover:-translate-y-0.5"
              >
                <div className={cn("relative h-20 bg-gradient-to-br", character.gradient)}>
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,.7) 1px, transparent 0)", backgroundSize: "14px 14px" }} />
                  <span
                    className={cn(
                      "absolute -bottom-6 left-4 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[var(--surface)] bg-gradient-to-br text-lg font-bold text-white shadow-md",
                      character.gradient
                    )}
                  >
                    {character.name.slice(0, 1).toUpperCase()}
                  </span>
                  <button
                    onClick={() => removeCharacter(character.id)}
                    aria-label={`Delete ${character.name}`}
                    className="absolute right-2.5 top-2.5 rounded-lg bg-black/25 p-1.5 text-white opacity-0 backdrop-blur transition hover:bg-rose-500 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  <StatusChip tone="green" className="absolute right-2.5 bottom-2 !bg-black/25 !text-white !border-white/20">
                    Active
                  </StatusChip>
                </div>
                <div className="flex flex-1 flex-col p-3.5 pt-8">
                  <h3 className="text-[13px] font-bold">{character.name}</h3>
                  <p className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-violet-500 dark:text-violet-300">
                    {character.role}
                  </p>
                  <p className="muted mt-2 line-clamp-3 flex-1 text-[10.5px] leading-relaxed">
                    {character.bio}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5">
                    <span className="chip !text-[9px]">
                      <AudioLines className="h-2.5 w-2.5 text-orange-500" /> {character.voice}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setPage("video");
                      pushToast(`${character.name} is ready for your next video.`, "info");
                    }}
                    className="btn btn-soft mt-3 w-full !py-2 text-[10.5px]"
                  >
                    <Video className="h-3.5 w-3.5 text-violet-500" /> Use in video
                  </button>
                </div>
              </Card>
            ))}

            <button
              onClick={() => {
                setName("Nova");
                setRole("AI presenter");
                setBio("Nova is a bright, curious AI presenter who makes product stories feel effortless and human.");
                setGradient(GRADIENTS[2]);
              }}
              className="flex min-h-[190px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-soft)] p-4 text-center transition hover:border-violet-300"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-sm">
                <Plus className="h-5 w-5" />
              </span>
              <p className="text-[11px] font-semibold">Quick-add a presenter</p>
              <p className="muted max-w-[150px] text-[9.5px] leading-relaxed">
                Drop a ready-made persona into the form and make it yours.
              </p>
            </button>
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-sky-200/40 bg-sky-50/70 p-3 dark:bg-sky-400/5">
            <IconTile icon={Sparkles} accent="blue" size="sm" />
            <p className="muted text-[9.5px] leading-relaxed">
              Tip: keep a character&apos;s description consistent — FlowGen reuses it to maintain the
              same look and voice across generations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
