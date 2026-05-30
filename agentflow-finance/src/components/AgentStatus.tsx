import { Sparkles, ShieldCheck, Gauge, FileSignature, CheckCircle2 } from "lucide-react";

const stages = [
  { key: "SALES", label: "Sales Agent", icon: Sparkles },
  { key: "VERIFICATION", label: "Verification Agent", icon: ShieldCheck },
  { key: "UNDERWRITING", label: "Underwriting Agent", icon: Gauge },
  { key: "SANCTION", label: "Sanction Agent", icon: FileSignature },
  { key: "COMPLETED", label: "Loan Completed", icon: CheckCircle2 },
] as const;

/**
 * AgentStatus — Visual pipeline tracker showing conversation progress.
 *
 * Props:
 * - currentStage: the currently active workflow stage
 * - completedStages: array of stages that have been completed
 */
export function AgentStatus({
  currentStage = "GREETING",
  completedStages = [],
}: {
  currentStage?: string;
  completedStages?: string[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Agent Pipeline
      </p>
      <div className="mt-4 space-y-3">
        {stages.map((stage) => {
          const isCompleted = completedStages.includes(stage.key);
          const isActive = currentStage === stage.key;
          const isPending = !isCompleted && !isActive;

          return (
            <div
              key={stage.key}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 ${
                isActive
                  ? "bg-accent/20 border border-accent/40"
                  : isCompleted
                    ? "bg-secondary/50"
                    : "opacity-50"
              }`}
            >
              <div
                className={`grid h-8 w-8 place-items-center rounded-lg ${
                  isActive
                    ? "bg-accent text-foreground animate-pulse"
                    : isCompleted
                      ? "bg-green-100 text-green-700"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <stage.icon className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isPending ? "text-muted-foreground" : ""}`}>
                  {stage.label} Agent
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isActive ? "Processing…" : isCompleted ? "Complete" : "Pending"}
                </p>
              </div>
              {isActive && (
                <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
