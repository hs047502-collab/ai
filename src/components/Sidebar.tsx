import {
  AudioLines,
  CircleUserRound,
  Clapperboard,
  Image as ImageIcon,
  Images,
  LayoutGrid,
  LogOut,
  Megaphone,
  UserRound,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { LogoLockup } from "./Logo";
import { useApp, type PageKey } from "../store";
import { cn } from "../utils/cn";

interface NavItem {
  key: PageKey;
  label: string;
  icon: LucideIcon;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid, color: "text-indigo-500" },
  { key: "video", label: "Video Generation", icon: Video, color: "text-red-500" },
  { key: "image", label: "Image Generation", icon: ImageIcon, color: "text-violet-600 dark:text-violet-400" },
  { key: "library", label: "FlowGen Library", icon: Images, color: "text-pink-500" },
  { key: "tts", label: "Text to Speech", icon: AudioLines, color: "text-orange-500" },
  { key: "character", label: "Character", icon: UserRound, color: "text-blue-500" },
  { key: "director", label: "AI Director", icon: Clapperboard, color: "text-cyan-500" },
  { key: "announcements", label: "Announcements", icon: Megaphone, color: "text-rose-500" },
  { key: "account", label: "My Account", icon: CircleUserRound, color: "text-sky-500" },
];

export function Sidebar({
  onClose,
  className,
}: {
  onClose?: () => void;
  className?: string;
}) {
  const { page, setPage, user, signOut, openAuth, pushToast } = useApp();

  const goTo = (key: PageKey) => {
    setPage(key);
    onClose?.();
  };

  return (
    <aside
      className={cn(
        "sidebar-surface flex w-[272px] shrink-0 flex-col overflow-hidden rounded-[26px] border border-[var(--line)] shadow-[var(--shadow)]",
        className
      )}
    >
      <div className="relative px-5 pb-3 pt-5">
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="absolute right-3 top-3 rounded-full bg-[var(--surface-soft)] p-1.5 text-[var(--muted)] transition hover:text-[var(--ink)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <LogoLockup />
      </div>

      <div className="mx-4 mb-1 h-px shrink-0 bg-[var(--line)]" />

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3.5">
        {NAV_ITEMS.map(({ key, label, icon: Icon, color }) => {
          const active = page === key;
          return (
            <button
              key={key}
              onClick={() => goTo(key)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-[9px] text-left text-[12.5px] font-semibold transition-all duration-200",
                active
                  ? "bg-gradient-to-r from-[#24c05e] to-[#0f9d58] text-white shadow-[0_10px_20px_-12px_rgba(16,163,74,0.9)]"
                  : "text-[var(--ink)] hover:bg-[var(--surface-soft)]"
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110",
                  active ? "text-white" : color
                )}
                strokeWidth={active ? 2.4 : 2}
              />
              <span className="truncate">{label}</span>
              {key === "announcements" && !active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-rose-500" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="shrink-0 px-3.5 pb-4">
        {user && (
          <div className="mb-2.5 flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-2.5 py-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 text-[11px] font-bold text-white">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold leading-tight">{user.name}</p>
              <p className="muted truncate text-[9.5px] leading-tight">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => {
            if (user) {
              signOut();
            } else {
              openAuth();
            }
            onClose?.();
          }}
          className="btn btn-red w-full !py-3 text-[13px]"
        >
          {user ? (
            <>
              <LogOut className="h-4 w-4" /> Sign out
            </>
          ) : (
            <>
              <span aria-hidden>→</span> Register / Login
            </>
          )}
        </button>
        <button
          onClick={() => {
            pushToast("Free plan includes 100 video + 1000 image credits each month.", "info");
          }}
          className="muted mt-2 w-full text-center text-[9.5px] font-medium transition hover:text-violet-500"
        >
          Free plan · upgrade anytime
        </button>
      </div>

      <div className="relative h-[108px] shrink-0 overflow-hidden">
        <svg
          viewBox="0 0 272 108"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="sidebar-wave-a" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="45%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="sidebar-wave-b" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="sidebar-wave-c" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path
            d="M0 62C38 28 74 18 108 36c32 17 48 46 86 44 32-2 54-24 78-36v64H0Z"
            fill="url(#sidebar-wave-a)"
            opacity="0.28"
          />
          <path
            d="M0 74c34-22 66-26 98-6 28 18 44 32 78 24 34-8 62-30 96-38v54H0Z"
            fill="#8b5cf6"
          />
          <path
            d="M0 92c40-18 74-16 112 0 40 17 80 12 116-6 16-8 30-14 44-17v39H0Z"
            fill="url(#sidebar-wave-c)"
            opacity="0.85"
          />
        </svg>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#3b148f]/55 to-transparent" />
        <p className="absolute bottom-3 left-0 right-0 text-center text-[10.5px] font-semibold tracking-wide text-white drop-shadow-[0_1px_3px_rgba(30,10,70,0.9)]">
          Version v6.0.1
        </p>
      </div>
    </aside>
  );
}
