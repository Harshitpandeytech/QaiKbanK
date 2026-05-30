import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LoanSummary } from "@/components/LoanSummary";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/approval")({
  head: () => ({
    meta: [
      { title: "Loan Decision — QaiKbank" },
      { name: "description", content: "View your personal loan approval or rejection decision." },
    ],
  }),
  component: ApprovalPage,
});

function ApprovalPage() {
  // TODO: Fetch actual loan application decision in Step 2

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Loan Decision</h1>
        <p className="mt-2 text-muted-foreground">
          Your loan application has been reviewed by our AI underwriting team.
        </p>
      </div>

      {/* Placeholder Decision Card */}
      <div className="mt-10">
        <LoanSummary
          status="pending"
          reason="Your application is being processed. Decision will appear here shortly."
        />
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/chat">
            Back to Chat <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild className="rounded-full bg-foreground text-background hover:bg-foreground/90">
          <Link to="/dashboard">
            View Dashboard <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
