import { CheckCircle2, XCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoanSummaryProps {
  status: "approved" | "rejected" | "pending";
  loanAmount?: number;
  interestRate?: number;
  tenure?: number;
  emi?: number;
  reason?: string;
  sanctionPdfUrl?: string | null;
}

/**
 * LoanSummary — Displays final loan decision card.
 *
 * Green for approved, red for rejected, neutral for pending.
 * Shows loan details and download sanction letter button.
 */
export function LoanSummary({
  status,
  loanAmount,
  interestRate,
  tenure,
  emi,
  reason,
  sanctionPdfUrl,
}: LoanSummaryProps) {
  const isApproved = status === "approved";
  const isRejected = status === "rejected";

  return (
    <div
      className={`rounded-2xl border-2 p-6 ${
        isApproved
          ? "border-green-300 bg-green-50"
          : isRejected
            ? "border-red-300 bg-red-50"
            : "border-border bg-card"
      }`}
    >
      {/* Status Header */}
      <div className="flex items-center gap-3">
        {isApproved ? (
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        ) : isRejected ? (
          <XCircle className="h-8 w-8 text-red-600" />
        ) : null}
        <div>
          <h3 className="text-lg font-bold">
            {isApproved ? "Loan Approved!" : isRejected ? "Loan Declined" : "Decision Pending"}
          </h3>
          {reason && <p className="text-sm text-muted-foreground">{reason}</p>}
        </div>
      </div>

      {/* Loan Details */}
      {(isApproved || loanAmount) && (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {loanAmount && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Amount</p>
              <p className="mt-1 text-lg font-bold">₹{loanAmount?.toLocaleString("en-IN")}</p>
            </div>
          )}
          {interestRate && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Interest</p>
              <p className="mt-1 text-lg font-bold">{interestRate}%</p>
            </div>
          )}
          {tenure && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Tenure</p>
              <p className="mt-1 text-lg font-bold">{tenure} months</p>
            </div>
          )}
          {emi && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">EMI</p>
              <p className="mt-1 text-lg font-bold">₹{emi?.toLocaleString("en-IN")}</p>
            </div>
          )}
        </div>
      )}

      {/* Download Button */}
      {isApproved && sanctionPdfUrl && (
        <div className="mt-5">
          <Button asChild className="rounded-full bg-green-600 text-white hover:bg-green-700">
            <a href={sanctionPdfUrl} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Download Sanction Letter
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
