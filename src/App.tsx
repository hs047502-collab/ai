import { useEffect, useState } from "react";
import { Menu, Moon, Sun, UserRound } from "lucide-react";
import { AppProvider, useApp, type PageKey } from "./store";
import { Sidebar } from "./components/Sidebar";
import { LogoMark } from "./components/Logo";
import { AuthModal, GeminiModal, ToastStack, TutorialModal } from "./components/Modals";
import { Dashboard } from "./pages/Dashboard";
import { VideoGeneration } from "./pages/VideoGeneration";
import { ImageGeneration } from "./pages/ImageGeneration";
import { Library } from "./pages/Library";
import { TextToSpeech } from "./pages/TextToSpeech";
import { CharacterStudio } from "./pages/Character";
import { DirectorHub } from "./pages/DirectorHub";
import { PremiumGate } from "./components/PremiumGate";
import { Announcements } from "./pages/Announcements";
import { Account } from "./pages/Account";
import { cn } from "./utils/cn";

function MobileHeader({ onMenu }: { onMenu: () => void }) {
  const { theme, toggleTheme, user, openAuth } = useApp();

  return (
    <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 shadow-sm lg:hidden">
      <button
        onClick={() => {
          if (user) openAuth();
        }}
        className="flex min-w-0 items-center gap-2 text-left"
        aria-label="Hriday AI Studio"
      >
        <LogoMark className="h-9 w-9 shrink-0" />
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-extrabold leading-tight">
            Hriday <span className="text-violet-600 dark:text-violet-400">AI Studio</span>
          </span>
          <span className="block text-[8.5px] font-medium tracking-wide text-violet-500 dark:text-violet-300">
            Create • Edit • Innovate
          </span>
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)]"
        >
          {theme === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={openAuth}
          aria-label="Account"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)]"
        >
          {user ? (
            <span className="text-[10px] font-bold text-violet-600 dark:text-violet-300">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
          ) : (
            <UserRound className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          onClick={onMenu}
          aria-label="Open navigation"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-sm"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function PageRouter({ page }: { page: PageKey }) {
  const { user } = useApp();
  if (!user && (page === "library" || page === "tts" || page === "character")) return <PremiumGate />;
  switch (page) {
    case "video":
      return <VideoGeneration />;
    case "image":
      return <ImageGeneration />;
    case "library":
      return <Library />;
    case "tts":
      return <TextToSpeech />;
    case "character":
      return <CharacterStudio />;
    case "director":
      return <DirectorHub />;
    case "announcements":
      return <Announcements />;
    case "account":
      return <Account />;
    case "dashboard":
    default:
      return <Dashboard />;
  }
}

function Shell() {
  const { page, tutorialOpen, authOpen, geminiOpen } = useApp();
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (!mobileNav) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNav]);

  useEffect(() => {
    setMobileNav(false);
  }, [page]);

  return (
    <>
      <div
        className="min-h-screen w-full bg-[var(--app-bg)] px-2.5 py-3 sm:px-4 sm:py-4"
        style={{
          backgroundImage:
            "radial-gradient(1100px 520px at 82% -8%, var(--app-bg-2), transparent 62%), radial-gradient(800px 420px at 5% 108%, var(--app-bg-2), transparent 65%)",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="mx-auto flex w-full max-w-[1600px] items-start gap-4">
          <Sidebar className="sticky top-4 hidden h-[calc(100vh-2rem)] lg:flex" />
          <main className={cn("min-w-0 flex-1 overflow-x-hidden", mobileNav && "max-h-screen")}>
            <MobileHeader onMenu={() => setMobileNav(true)} />
            <PageRouter page={page} />
          </main>
        </div>
      </div>

      {mobileNav && (
        <div
          className="fade-in fixed inset-0 z-[70] bg-[#100a26]/60 p-3 backdrop-blur-sm lg:hidden"
          onMouseDown={() => setMobileNav(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="h-full max-h-[calc(100vh-1.5rem)] w-[282px]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <Sidebar className="h-full w-full" onClose={() => setMobileNav(false)} />
          </div>
        </div>
      )}

      {(authOpen || geminiOpen || tutorialOpen) && (
        <>
          <AuthModal />
          <GeminiModal />
          <TutorialModal />
        </>
      )}
      <ToastStack />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
