import { useMemo, useState } from "react";
import {
  AudioLines,
  Download,
  Heart,
  Image as ImageIcon,
  Images,
  Play,
  Plus,
  Search,
  Sparkles,
  UserRound,
  Video,
  Wand2,
  X,
} from "lucide-react";
import { Card, EmptyState, PageHeader, StatusChip } from "../components/ui";
import { SEED_GALLERY, useApp, type GenerationKind } from "../store";
import { cn } from "../utils/cn";

type Category = "All" | "Images" | "Videos" | "Characters" | "Audio" | "Favourites";

const CATEGORIES: { key: Category; icon: typeof Images }[] = [
  { key: "All", icon: Sparkles },
  { key: "Images", icon: ImageIcon },
  { key: "Videos", icon: Video },
  { key: "Characters", icon: UserRound },
  { key: "Audio", icon: AudioLines },
  { key: "Favourites", icon: Heart },
];

interface LibraryItem {
  id: string;
  title: string;
  prompt: string;
  thumb?: string;
  creator: string;
  category: Exclude<Category, "All" | "Favourites">;
  kind: GenerationKind;
  isUser: boolean;
  favorite: boolean;
}

const KIND_CATEGORY: Record<GenerationKind, Exclude<Category, "All" | "Favourites">> = {
  video: "Videos",
  image: "Images",
  speech: "Audio",
  character: "Characters",
  storyboard: "Videos",
};

export function Library() {
  const { generations, toggleFavorite, setPage, pushToast } = useApp();
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"trending" | "newest">("trending");
  const [selected, setSelected] = useState<LibraryItem | null>(null);
  const [seedFavourites, setSeedFavourites] = useState<string[]>([]);

  const items: LibraryItem[] = useMemo(() => {
    const userItems: LibraryItem[] = generations
      .map((g) => ({
        id: g.id,
        title: g.title,
        prompt: g.prompt ?? g.title,
        thumb: g.thumb,
        creator: "You",
        category: KIND_CATEGORY[g.kind],
        kind: g.kind,
        isUser: true,
        favorite: Boolean(g.favorite),
      }));

    const seedItems: LibraryItem[] = SEED_GALLERY.map((g) => ({
      id: g.id,
      title: g.title,
      prompt: g.prompt,
      thumb: g.thumb,
      creator: g.creator,
      category: g.category as LibraryItem["category"],
      kind: g.category === "Videos" ? "video" : "image",
      isUser: false,
      favorite: seedFavourites.includes(g.id),
    }));

    let list = [...userItems, ...seedItems];
    if (category === "Favourites") list = list.filter((item) => item.favorite);
    else if (category !== "All") list = list.filter((item) => item.category === category);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.prompt.toLowerCase().includes(q) ||
          item.creator.toLowerCase().includes(q)
      );
    }
    if (sort === "newest") {
      list = [...list].sort((a, b) => Number(b.isUser) - Number(a.isUser));
    } else {
      list = [...list].sort((a, b) => Number(b.isUser) - Number(a.isUser));
    }
    return list;
  }, [category, generations, query, seedFavourites, sort]);

  const toggleItemFavourite = (item: LibraryItem) => {
    if (item.isUser) {
      toggleFavorite(item.id);
    } else {
      setSeedFavourites((prev) =>
        prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
      );
    }
    setSelected((prev) => (prev && prev.id === item.id ? { ...prev, favorite: !prev.favorite } : prev));
  };

  return (
    <div className="fade-in">
      <PageHeader
        icon={Images}
        accent="pink"
        title="FlowGen Library"
        subtitle="Discover community creations and everything you've made"
        eyebrow="Explore"
        actions={
          <>
            <div className="chip !py-2">
              <Sparkles className="h-3.5 w-3.5 text-violet-500" /> Curated gallery
            </div>
            <button onClick={() => setPage("image")} className="btn btn-primary !py-2.5">
              <Plus className="h-4 w-4" /> Create new
            </button>
          </>
        }
      />

      <Card className="mb-4 p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="field !py-2.5 !pl-10 !text-[11.5px]"
              placeholder="Search prompts, creators or styles…"
              aria-label="Search the library"
            />
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-1">
            {(["trending", "newest"] as const).map((value) => (
              <button
                key={value}
                onClick={() => setSort(value)}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-[10px] font-semibold capitalize transition",
                  sort === value
                    ? "bg-[var(--surface)] text-violet-600 shadow-sm dark:text-violet-300"
                    : "text-[var(--muted)]"
                )}
              >
                {value}
              </button>
            ))}
          </div>
          <span className="muted text-[10.5px] font-medium">
            {items.length} creation{items.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {CATEGORIES.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10.5px] font-semibold transition",
                category === key
                  ? "border-violet-400 bg-violet-500 text-white shadow-sm"
                  : "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)] hover:border-violet-300 hover:text-violet-600 dark:hover:text-violet-300"
              )}
            >
              <Icon className="h-3 w-3" />
              {key}
            </button>
          ))}
        </div>
      </Card>

      {items.length ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <button
              key={`${item.isUser ? "user" : "seed"}-${item.id}`}
              onClick={() => setSelected(item)}
              className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-left shadow-[var(--shadow)] transition duration-300 hover:-translate-y-1 hover:border-violet-300"
            >
              <div
                className={cn(
                  "relative aspect-[4/3] overflow-hidden bg-gradient-to-br",
                  item.category === "Videos"
                    ? "from-[#2a1672] via-violet-600 to-fuchsia-500"
                    : item.category === "Audio"
                      ? "from-orange-400 via-rose-500 to-fuchsia-500"
                      : item.category === "Characters"
                        ? "from-blue-500 via-indigo-500 to-violet-600"
                        : "from-violet-400 via-purple-500 to-indigo-600"
                )}
              >
                <Images className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-white/25" />
                {item.thumb ? (
                  <img
                    src={item.thumb}
                    alt={item.title}
                    loading="lazy"
                    className="relative h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className={`flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br ${
                      item.category === "Audio"
                        ? "from-orange-400 via-rose-500 to-fuchsia-500"
                        : item.category === "Characters"
                          ? "from-blue-500 via-indigo-500 to-violet-600"
                          : "from-violet-500 via-purple-600 to-indigo-700"
                    }`}
                  >
                    <AudioLines className="h-7 w-7 text-white/90" />
                    <p className="max-w-[80%] text-center text-[9px] font-medium leading-relaxed text-white/80">
                      {item.prompt.slice(0, 70)}
                    </p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-70" />
                <div className="absolute left-2.5 top-2.5 flex gap-1.5">
                  <span className="rounded-full border border-white/20 bg-black/35 px-2 py-0.5 text-[8.5px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur">
                    {item.category}
                  </span>
                  {item.isUser && (
                    <span className="rounded-full bg-violet-500 px-2 py-0.5 text-[8.5px] font-bold text-white">
                      Yours
                    </span>
                  )}
                </div>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleItemFavourite(item);
                  }}
                  aria-label={item.favorite ? "Remove from favourites" : "Add to favourites"}
                  className={cn(
                    "absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur transition",
                    item.favorite
                      ? "bg-rose-500 text-white"
                      : "bg-black/30 text-white/80 hover:bg-black/50"
                  )}
                >
                  <Heart className={cn("h-3.5 w-3.5", item.favorite && "fill-white")} />
                </button>
                <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[8.5px] font-medium text-white/85 backdrop-blur">
                  <UserRound className="h-2.5 w-2.5" /> {item.creator}
                </span>
                {item.kind === "video" && (
                  <span className="absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-violet-700 shadow">
                    <Play className="ml-0.5 h-3 w-3 fill-violet-700" />
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-[12px] font-semibold">{item.title}</p>
                <p className="muted mt-1 line-clamp-2 text-[10px] leading-relaxed">{item.prompt}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <Card className="p-5">
          <EmptyState
            icon={Images}
            title="Nothing here yet"
            description={
              query
                ? `No creations matched “${query}”. Try another keyword or category.`
                : "Your search turned up empty. Generate something new to fill this shelf."
            }
            action={
              <button onClick={() => setPage("image")} className="btn btn-primary">
                <Wand2 className="h-4 w-4" /> Generate an image
              </button>
            }
          />
        </Card>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[#100a26]/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
        >
          <div className="pop-in relative my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl">
            <div className="relative bg-[#0c0819]">
              {selected.thumb ? (
                <img
                  src={selected.thumb}
                  alt={selected.title}
                  className="max-h-[52vh] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center">
                  <Images className="h-10 w-10 text-violet-500" />
                </div>
              )}
              {selected.kind === "video" && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                    <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
                  </span>
                </span>
              )}
              <button
                onClick={() => setSelected(null)}
                aria-label="Close preview"
                className="absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold">{selected.title}</h2>
                  <p className="muted mt-0.5 text-[10.5px]">
                    by {selected.creator} · {selected.category}
                  </p>
                </div>
                <StatusChip tone={selected.isUser ? "violet" : "blue"}>
                  {selected.isUser ? "Your creation" : "Community"}
                </StatusChip>
              </div>
              <div className="soft-panel mt-3 p-3">
                <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-violet-500">
                  Prompt
                </p>
                <p className="text-[11px] leading-relaxed">{selected.prompt}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => toggleItemFavourite(selected)}
                  className={cn("btn flex-1", selected.favorite ? "btn-red" : "btn-soft")}
                >
                  <Heart className={cn("h-4 w-4", selected.favorite && "fill-white")} />
                  {selected.favorite ? "Favourited" : "Favourite"}
                </button>
                <button
                  onClick={() => {
                    const target = selected.kind === "video" ? "video" : "image";
                    setSelected(null);
                    setPage(target);
                    pushToast(`Prompt unlocked in ${target === "video" ? "Video" : "Image"} Generation.`, "info");
                  }}
                  className="btn btn-primary flex-1"
                >
                  <Wand2 className="h-4 w-4" /> Remix prompt
                </button>
                <button
                  onClick={() => pushToast("Download started — demo asset saved.")}
                  className="btn btn-ghost"
                  aria-label="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
