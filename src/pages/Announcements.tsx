import { useState } from "react";
import {
  ArrowRight,
  Bell,
  CheckCheck,
  Megaphone,
  Rocket,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { Card, CardHeading, IconTile, PageHeader, StatusChip } from "../components/ui";
import { useApp } from "../store";
import { cn } from "../utils/cn";

type Filter = "All" | "Product" | "Community" | "Fixes";

interface Update {
  id: string;
  kind: Exclude<Filter, "All">;
  title: string;
  body: string;
  date: string;
  version?: string;
  read: boolean;
}

const UPDATES: Update[] = [
  {
    id: "a1",
    kind: "Product",
    title: "Hriday Studio v6.0.1 is live",
    body: "A fresh coat of paint for your creative home: a faster FlowGen Library, dark mode, smarter credit tracking and a brand-new character workflow. Everything you need to go from idea to final cut without leaving the studio.",
    date: "Feb 18, 2026",
    version: "v6.0.1",
    read: false,
  },
  {
    id: "a2",
    kind: "Product",
    title: "FlowGen video engine 2.0 — smoother motion",
    body: "Renders now hold character consistency across longer shots and motion feels noticeably more natural. 6-second clips are default for every free plan account.",
    date: "Feb 10, 2026",
    version: "v6.0.0",
    read: false,
  },
  {
    id: "a3",
    kind: "Product",
    title: "Character Studio is out of beta",
    body: "Save a persona, a voice and a backstory once — then reuse them across every video, poster and narration. Your cast now lives in the sidebar for instant access.",
    date: "Feb 2, 2026",
    version: "v5.9.2",
    read: false,
  },
  {
    id: "a4",
    kind: "Community",
    title: "Community spotlight: the Prompt Atlas",
    body: "Our community shared 400+ creative prompts this month. We curated the best of them into the Prompt Atlas inside FlowGen Library. Steal generously, remix wildly.",
    date: "Jan 27, 2026",
    read: true,
  },
  {
    id: "a5",
    kind: "Fixes",
    title: "Fixed: long voiceovers cutting off early",
    body: "Narration over 60 seconds now renders reliably in every browser. We also fixed an edge case where downloads could stall after a tab was backgrounded.",
    date: "Jan 21, 2026",
    version: "v5.9.1",
    read: true,
  },
  {
    id: "a6",
    kind: "Product",
    title: "New: 9:16 story renders and wider cover images",
    body: "Portrait output for Reels, Shorts and Stories is now available in both Image and Video Generation, complete with safe-area guides for on-platform text.",
    date: "Jan 14, 2026",
    version: "v5.9.0",
    read: true,
  },
];

const KIND_META = {
  Product: { accent: "violet", icon: Rocket, tone: "violet" as const },
  Community: { accent: "green", icon: Users, tone: "green" as const },
  Fixes: { accent: "orange", icon: Wrench, tone: "orange" as const },
};

export function Announcements() {
  const { pushToast, setPage, user } = useApp();
  const [filter, setFilter] = useState<Filter>("All");
  const [read, setRead] = useState<string[]>(UPDATES.filter((u) => u.read).map((u) => u.id));
  const [email, setEmail] = useState(user?.email ?? "");
  const [subscribed, setSubscribed] = useState(false);
  const [expanded, setExpanded] = useState<string | null>("a1");

  const visible = UPDATES.filter((update) => filter === "All" || update.kind === filter);
  const unread = UPDATES.filter((update) => !read.includes(update.id)).length;

  const openUpdate = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
    setRead((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const subscribe = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      pushToast("Enter a valid email to join the studio newsletter.", "error");
      return;
    }
    setSubscribed(true);
    pushToast("You're on the list — studio news, every other Friday.");
  };

  return (
    <div className="fade-in">
      <PageHeader
        icon={Megaphone}
        accent="red"
        title="Announcements"
        subtitle="Everything new, fixed and happening inside Hriday Studio"
        eyebrow="Studio news"
        actions={
          <>
            <span className="chip !py-2">
              <Bell className="h-3.5 w-3.5 text-rose-500" /> {unread} unread
            </span>
            <button
              onClick={() => {
                setRead(UPDATES.map((u) => u.id));
                pushToast("All announcements marked as read.", "info");
              }}
              className="btn btn-ghost !py-2.5"
            >
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <Card className="relative overflow-hidden border-0 !bg-gradient-to-br !from-[#241354] !via-[#3b1f82] !to-[#5b21b6] p-5 text-white sm:p-6">
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,.55) 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-fuchsia-400/30 blur-2xl" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] backdrop-blur">
                  Latest release
                </span>
                <StatusChip tone="green" className="!bg-emerald-400/20 !text-emerald-200 !border-emerald-300/30">
                  <Sparkles className="h-2.5 w-2.5" /> v6.0.1
                </StatusChip>
              </div>
              <h2 className="mt-3 max-w-md text-2xl font-extrabold leading-tight tracking-tight sm:text-[30px]">
                Your studio, <span className="text-violet-300">reimagined.</span>
              </h2>
              <p className="mt-2 max-w-lg text-[11.5px] leading-relaxed text-violet-100/85">
                Dark mode, a Gemini-powered assistant, a faster FlowGen Library and a cleaner
                dashboard. Built to keep you in the creative flow for longer.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setPage("dashboard");
                    pushToast("Touring the new dashboard ✨", "info");
                  }}
                  className="btn !bg-white !text-[#3b1f82] hover:!bg-violet-50 !py-2.5 text-[10.5px]"
                >
                  Tour the new dashboard <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setPage("library")}
                  className="btn border border-white/25 bg-white/10 !py-2.5 text-[10.5px] text-white backdrop-blur hover:bg-white/20"
                >
                  Explore FlowGen Library
                </button>
              </div>
            </div>
          </Card>

          <div className="flex flex-wrap gap-1.5">
            {(["All", "Product", "Community", "Fixes"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[10.5px] font-semibold transition",
                  filter === key
                    ? "border-violet-400 bg-violet-500 text-white shadow-sm"
                    : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-violet-300"
                )}
              >
                {key}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {visible.map((update) => {
              const meta = KIND_META[update.kind];
              const isUnread = !read.includes(update.id);
              const isOpen = expanded === update.id;
              return (
                <Card
                  key={update.id}
                  className={cn(
                    "overflow-hidden transition",
                    isUnread && "border-violet-200 dark:border-violet-500/25"
                  )}
                >
                  <button onClick={() => openUpdate(update.id)} className="flex w-full items-start gap-3 p-4 text-left sm:p-5">
                    <IconTile icon={meta.icon} accent={meta.accent} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusChip tone={meta.tone}>{update.kind}</StatusChip>
                        {update.version && (
                          <span className="muted text-[9.5px] font-medium">{update.version}</span>
                        )}
                        <span className="muted text-[9.5px]">· {update.date}</span>
                        {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
                      </div>
                      <h3 className="mt-1.5 text-[13px] font-semibold leading-snug sm:text-[14px]">
                        {update.title}
                      </h3>
                      <p
                        className={cn(
                          "muted mt-1 text-[10.5px] leading-relaxed",
                          !isOpen && "line-clamp-2"
                        )}
                      >
                        {update.body}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-violet-600 dark:text-violet-300">
                        {isOpen ? "Show less" : "Read update"} <ArrowRight className={cn("h-3 w-3 transition", isOpen && "rotate-90")} />
                      </span>
                    </div>
                  </button>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4 sm:p-5">
            <CardHeading icon={Bell} accent="red" title="Stay in the loop" />
            <p className="muted mt-2 text-[10.5px] leading-relaxed">
              Studio news, new models and prompt inspiration. Every other Friday — no noise.
            </p>
            {subscribed ? (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-300/40 bg-emerald-50/80 p-3 dark:bg-emerald-400/5">
                <CheckCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                <p className="text-[10.5px] font-medium text-emerald-700 dark:text-emerald-200">
                  Subscribed with {email}. Watch your inbox.
                </p>
              </div>
            ) : (
              <form onSubmit={subscribe} className="mt-3 space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@studio.com"
                  className="field !py-2.5 !text-[11.5px]"
                  aria-label="Newsletter email"
                />
                <button type="submit" className="btn btn-primary w-full !py-2.5 text-[11px]">
                  Subscribe to studio updates
                </button>
              </form>
            )}
            <p className="muted mt-2 text-center text-[9px]">
              By subscribing you agree to our friendly, spam-free newsletter.
            </p>
          </Card>

          <Card className="p-4 sm:p-5">
            <CardHeading icon={Rocket} accent="violet" title="What's next" />
            <div className="mt-3 space-y-2">
              {[
                { title: "Multi-shot video sequences", status: "In beta", tone: "violet" as const },
                { title: "Voice cloning from a sample", status: "Research", tone: "blue" as const },
                { title: "Team workspaces & shared assets", status: "Planned", tone: "orange" as const },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2.5"
                >
                  <p className="text-[10.5px] font-medium">{item.title}</p>
                  <StatusChip tone={item.tone}>{item.status}</StatusChip>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-violet-200/50 bg-violet-50/60 p-3 dark:bg-violet-500/5">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" />
              <p className="muted text-[9.5px] leading-relaxed">
                Want to shape v6.1? Reply to the newsletter with your most-wanted feature.
              </p>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-500">
              Release history
            </p>
            <div className="mt-2.5 space-y-2">
              {[
                ["v6.0.1", "Feb 2026", "Stability + dark mode"],
                ["v6.0.0", "Feb 2026", "FlowGen 2.0 engine"],
                ["v5.9.2", "Jan 2026", "Character Studio"],
                ["v5.9.0", "Jan 2026", "Portrait renders"],
              ].map(([version, date, note]) => (
                <div key={version} className="flex items-center gap-2.5 border-b border-[var(--line)] pb-1.5 last:border-0 last:pb-0">
                  <span className="rounded-md bg-[var(--surface-soft)] px-1.5 py-0.5 font-mono text-[9px] font-semibold text-violet-600 dark:text-violet-300">
                    {version}
                  </span>
                  <span className="text-[9.5px]">{note}</span>
                  <span className="muted ml-auto text-[8.5px]">{date}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
