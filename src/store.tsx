import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type PageKey =
  | "dashboard"
  | "video"
  | "image"
  | "library"
  | "tts"
  | "character"
  | "director"
  | "announcements"
  | "account";

export type GenerationKind = "video" | "image" | "speech" | "character" | "storyboard";

export interface User {
  name: string;
  email: string;
  joinedAt: string;
}

export interface Generation {
  id: string;
  kind: GenerationKind;
  title: string;
  prompt?: string;
  thumb?: string;
  meta?: string;
  createdAt: string;
  favorite?: boolean;
  credits?: number;
  seconds?: number;
}

export interface PendingPrompts {
  kind: "video" | "image";
  text: string;
}

export interface PromptSnippet {
  id: string;
  text: string;
  tag: string;
  kind: string;
  createdAt: string;
}

export type ToastTone = "success" | "info" | "error";

export interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  bio: string;
  voice: string;
  gradient: string;
}

interface AppStore {
  page: PageKey;
  setPage: (page: PageKey) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  user: User | null;
  signIn: (name: string, email: string) => void;
  signOut: () => void;
  geminiKey: string;
  saveGeminiKey: (key: string) => void;
  removeGeminiKey: () => void;
  generations: Generation[];
  addGeneration: (item: Omit<Generation, "id" | "createdAt">) => Generation;
  toggleFavorite: (id: string) => void;
  removeGeneration: (id: string) => void;
  clearStudio: () => void;
  characters: Character[];
  addCharacter: (character: Omit<Character, "id">) => void;
  removeCharacter: (id: string) => void;
  videoUsed: number;
  imageUsed: number;
  allowance: number;
  remainingVideo: number;
  remainingImages: number;
  chart: { label: string; count: number; isToday: boolean; date: string }[];
  maxConcurrent: number;
  pendingPrompts: PendingPrompts | null;
  setPendingPrompts: (value: PendingPrompts | null) => void;
  customStyles: string[];
  addCustomStyle: (style: string) => void;
  removeCustomStyle: (style: string) => void;
  vault: PromptSnippet[];
  saveSnippet: (text: string, tag: string, kind: string) => void;
  removeSnippet: (id: string) => void;
  authOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  geminiOpen: boolean;
  openGemini: () => void;
  closeGemini: () => void;
  tutorialOpen: boolean;
  openTutorial: () => void;
  closeTutorial: () => void;
  toasts: Toast[];
  pushToast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<AppStore | null>(null);

export const VIDEO_CREDIT_COST = 20;
export const IMAGE_CREDIT_COST = 20;
export const MONTHLY_ALLOWANCE = 1000;

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — keep running in memory */
  }
}

const SEED_CHARACTERS: Character[] = [
  {
    id: "seed-orpheus",
    name: "Orpheus",
    role: "Sci-fi narrator",
    bio: "A calm, deep-space storyteller with a warm baritone and a taste for cosmic mysteries.",
    voice: "Kai · Cinematic",
    gradient: "from-indigo-500 via-violet-500 to-fuchsia-500",
  },
  {
    id: "seed-mira",
    name: "Mira",
    role: "Product host",
    bio: "Bright, friendly and energetic. Perfect for product walkthroughs and explainer videos.",
    voice: "Aria · Warm",
    gradient: "from-rose-400 via-pink-500 to-orange-400",
  },
  {
    id: "seed-kite",
    name: "Kite",
    role: "Anime sidekick",
    bio: "Playful, curious and a little chaotic. Great for shorts, skits and character-driven clips.",
    voice: "Nova · Bright",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
  },
];

export const SEED_GALLERY = [
  {
    id: "gal-1",
    title: "Liquid Chrome Dreams",
    prompt: "A twisted liquid chrome loop floating over a deep blue gradient",
    thumb: "https://images.pexels.com/photos/9999717/pexels-photo-9999717.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=600&h=600",
    creator: "Steve A Johnson",
    category: "Images",
  },
  {
    id: "gal-2",
    title: "Neural Bloom",
    prompt: "Vibrant abstract AI brain, flowing organic forms, editorial lighting",
    thumb: "https://images.pexels.com/photos/18069860/pexels-photo-18069860.png?auto=compress&cs=tinysrgb&fit=crop&w=600&h=600",
    creator: "Google DeepMind",
    category: "Images",
  },
  {
    id: "gal-3",
    title: "Violet Machinery",
    prompt: "Purple 3D render, dynamic textures, studio lighting, high detail",
    thumb: "https://images.pexels.com/photos/18069211/pexels-photo-18069211.png?auto=compress&cs=tinysrgb&fit=crop&w=600&h=600",
    creator: "Google DeepMind",
    category: "Images",
  },
  {
    id: "gal-4",
    title: "Chromatic Current",
    prompt: "Fluid motion in vivid colours, macro photography, dreamy depth",
    thumb: "https://images.pexels.com/photos/18069855/pexels-photo-18069855.png?auto=compress&cs=tinysrgb&fit=crop&w=600&h=600",
    creator: "Google DeepMind",
    category: "Videos",
  },
  {
    id: "gal-5",
    title: "Tidal Light",
    prompt: "A wave of shining liquid, soft violet horizon, cinematic animation",
    thumb: "https://images.pexels.com/photos/9977648/pexels-photo-9977648.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=600&h=600",
    creator: "Steve A Johnson",
    category: "Videos",
  },
  {
    id: "gal-6",
    title: "Synthetic Garden",
    prompt: "Purple and green CGI landscape, artificial intelligence daydream",
    thumb: "https://images.pexels.com/photos/18069832/pexels-photo-18069832.png?auto=compress&cs=tinysrgb&fit=crop&w=600&h=600",
    creator: "Google DeepMind",
    category: "Images",
  },
  {
    id: "gal-7",
    title: "Orbital Study",
    prompt: "Three metallic spheres, warm bronze light, minimal composition",
    thumb: "https://images.pexels.com/photos/9815700/pexels-photo-9815700.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=600&h=600",
    creator: "Steve A Johnson",
    category: "Characters",
  },
  {
    id: "gal-8",
    title: "Type Alchemy",
    prompt: "Abstract purple letters forming a glowing 3D sculpture",
    thumb: "https://images.pexels.com/photos/18069238/pexels-photo-18069238.png?auto=compress&cs=tinysrgb&fit=crop&w=600&h=600",
    creator: "Google DeepMind",
    category: "Images",
  },
];

export const TUTORIAL_VIDEO =
  "https://videos.pexels.com/video-files/33352808/14201828_1920_1080_30fps.mp4";
export const TUTORIAL_POSTER =
  "https://images.pexels.com/videos/33352808/pexels-photo-33352808.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=720&w=1280";

export const GENERATED_IMAGES = SEED_GALLERY.filter((g) => g.category === "Images").map((g) => ({
  url: g.thumb,
  title: g.title,
}));

export const VIDEO_POSTERS = [
  "https://images.pexels.com/videos/33352808/pexels-photo-33352808.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=720&w=1280",
  "https://images.pexels.com/videos/29397255/abstract-animation-colorful-neon-gradient-background-29397255.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=720&w=1280",
  "https://images.pexels.com/videos/4986001/abstract-colours-experimental-macro-4986001.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=720&w=1280",
  "https://images.pexels.com/videos/15432103/abstract-acrylic-art-artist-15432103.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=720&w=1280",
];

export const VIDEO_SOURCES = [
  TUTORIAL_VIDEO,
  "https://videos.pexels.com/video-files/29397255/12662085_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/4986001/4986001-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/15432103/15432103-uhd_3840_2160_50fps.mp4",
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [page, setPageState] = useState<PageKey>("dashboard");
  const [theme, setTheme] = useState<"light" | "dark">(() => load("hriday.theme", "light"));
  const [user, setUser] = useState<User | null>(() => load("hriday.user", null));
  const [geminiKey, setGeminiKey] = useState<string>(() => load("hriday.gemini", ""));
  const [generations, setGenerations] = useState<Generation[]>(() => load("hriday.generations", []));
  const [characters, setCharacters] = useState<Character[]>(() =>
    load("hriday.characters", SEED_CHARACTERS)
  );

  const [pendingPrompts, setPendingPrompts] = useState<PendingPrompts | null>(null);
  const [customStyles, setCustomStyles] = useState<string[]>(() => load("hriday.styles", []));
  const [vault, setVault] = useState<PromptSnippet[]>(() => load("hriday.vault", []));
  const [authOpen, setAuthOpen] = useState(false);
  const [geminiOpen, setGeminiOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, number>>({});

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    save("hriday.theme", theme);
  }, [theme]);

  useEffect(() => save("hriday.user", user), [user]);
  useEffect(() => save("hriday.gemini", geminiKey), [geminiKey]);
  useEffect(() => save("hriday.generations", generations), [generations]);
  useEffect(() => save("hriday.characters", characters), [characters]);
  useEffect(() => save("hriday.styles", customStyles), [customStyles]);
  useEffect(() => save("hriday.vault", vault), [vault]);

  const addCustomStyle = useCallback((style: string) => {
    const clean = style.trim();
    if (!clean) return;
    setCustomStyles((prev) =>
      prev.some((s) => s.toLowerCase() === clean.toLowerCase()) ? prev : [...prev, clean]
    );
  }, []);
  const removeCustomStyle = useCallback((style: string) => {
    setCustomStyles((prev) => prev.filter((s) => s !== style));
  }, []);

  const saveSnippet = useCallback((text: string, tag: string, kind: string) => {
    setVault((prev) =>
      [{ id: uid(), text, tag: tag || "General", kind, createdAt: new Date().toISOString() }, ...prev].slice(0, 60)
    );
  }, []);

  const removeSnippet = useCallback((id: string) => {
    setVault((prev) => prev.filter((v) => v.id !== id));
  }, []);

  useEffect(() => {
    const active = timers.current;
    return () => {
      Object.values(active).forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const setPage = useCallback((next: PageKey) => {
    setPageState(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    window.clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const pushToast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = uid();
      setToasts((prev) => [...prev.slice(-2), { id, message, tone }]);
      timers.current[id] = window.setTimeout(() => dismissToast(id), 3600);
    },
    [dismissToast]
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const signIn = useCallback(
    (name: string, email: string) => {
      setUser({ name, email, joinedAt: new Date().toISOString() });
      setAuthOpen(false);
      pushToast(`Welcome to the studio, ${name.split(" ")[0]}!`);
    },
    [pushToast]
  );

  const signOut = useCallback(() => {
    setUser(null);
    pushToast("You have been signed out. See you soon!", "info");
  }, [pushToast]);

  const saveGeminiKey = useCallback(
    (key: string) => {
      setGeminiKey(key.trim());
      setGeminiOpen(false);
      pushToast("Gemini API key saved to this device.");
    },
    [pushToast]
  );

  const removeGeminiKey = useCallback(() => {
    setGeminiKey("");
    pushToast("Gemini API key disconnected.", "info");
  }, [pushToast]);

  const addGeneration = useCallback((item: Omit<Generation, "id" | "createdAt">) => {
    const generation: Generation = {
      ...item,
      id: uid(),
      createdAt: new Date().toISOString(),
    };
    setGenerations((prev) => [generation, ...prev]);
    return generation;
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setGenerations((prev) =>
      prev.map((g) => (g.id === id ? { ...g, favorite: !g.favorite } : g))
    );
  }, []);

  const removeGeneration = useCallback(
    (id: string) => {
      setGenerations((prev) => prev.filter((g) => g.id !== id));
      pushToast("Creation removed from your library.", "info");
    },
    [pushToast]
  );

  const clearStudio = useCallback(() => {
    setGenerations([]);
    setCharacters(SEED_CHARACTERS);
    pushToast("Studio data reset. Your account is safe.", "info");
  }, [pushToast]);

  const addCharacter = useCallback((character: Omit<Character, "id">) => {
    const next: Character = { ...character, id: uid() };
    setCharacters((prev) => [next, ...prev]);
    return next;
  }, []);

  const removeCharacter = useCallback(
    (id: string) => {
      setCharacters((prev) => prev.filter((c) => c.id !== id));
      pushToast("Character deleted.", "info");
    },
    [pushToast]
  );

  const openAuth = useCallback(() => setAuthOpen(true), []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);
  const openGemini = useCallback(() => setGeminiOpen(true), []);
  const closeGemini = useCallback(() => setGeminiOpen(false), []);
  const openTutorial = useCallback(() => setTutorialOpen(true), []);
  const closeTutorial = useCallback(() => setTutorialOpen(false), []);

  const videoUsed = useMemo(
    () =>
      generations
        .filter((g) => g.kind === "video")
        .reduce((sum, g) => sum + (g.credits ?? VIDEO_CREDIT_COST), 0),
    [generations]
  );
  const imageUsed = useMemo(
    () =>
      generations
        .filter((g) => g.kind === "image")
        .reduce((sum, g) => sum + (g.credits ?? IMAGE_CREDIT_COST), 0),
    [generations]
  );

  const chart = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      const count = generations.filter((g) => {
        const created = new Date(g.createdAt);
        return created >= date && created < next;
      }).length;
      return {
        label: formatter.format(date),
        date: date.toISOString(),
        count,
        isToday: index === 6,
      };
    });
    return days;
  }, [generations]);

  const value: AppStore = {
    page,
    setPage,
    theme,
    toggleTheme,
    user,
    signIn,
    signOut,
    geminiKey,
    saveGeminiKey,
    removeGeminiKey,
    generations,
    addGeneration,
    toggleFavorite,
    removeGeneration,
    clearStudio,
    characters,
    addCharacter,
    removeCharacter,
    videoUsed,
    imageUsed,
    allowance: MONTHLY_ALLOWANCE,
    remainingVideo: Math.max(0, MONTHLY_ALLOWANCE - videoUsed),
    remainingImages: Math.max(0, MONTHLY_ALLOWANCE - imageUsed),
    chart,
    maxConcurrent: user ? 2 : 1,
    pendingPrompts,
    setPendingPrompts,
    customStyles,
    addCustomStyle,
    removeCustomStyle,
    vault,
    saveSnippet,
    removeSnippet,
    authOpen,
    openAuth,
    closeAuth,
    geminiOpen,
    openGemini,
    closeGemini,
    tutorialOpen,
    openTutorial,
    closeTutorial,
    toasts,
    pushToast,
    dismissToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useApp() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
