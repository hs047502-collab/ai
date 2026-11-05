import { ArrowRight, Lock } from "lucide-react";
import { useApp } from "../store";

export function PremiumGate() {
  const { openAuth } = useApp();
  return (
    <div className="fade-in flex min-h-[78vh] items-center justify-center p-4">
      <div className="pop-in w-full max-w-md rounded-[26px] border border-[var(--line)] bg-[var(--surface)] p-7 text-center shadow-[var(--shadow)]">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-400/20 dark:to-orange-500/10">
          <Lock className="h-6 w-6 text-orange-500" />
        </span>
        <h2 className="mt-4 text-[19px] font-bold">Premium feature — sign in to unlock</h2>
        <p className="muted mt-2 text-[11.5px] leading-relaxed">
          Script to Prompts, Character, Text to Speech, Idea to Video and the FlowGen Library are available to
          activated members. Sign in or register to enjoy every feature.
        </p>
        <button onClick={openAuth} className="btn btn-red mt-5 w-full !py-3.5">
          <ArrowRight className="h-4 w-4" /> Register now
        </button>
        <p className="muted mt-3 text-[10px]">Contact your nearest reseller to extend your license.</p>
      </div>
    </div>
  );
}
