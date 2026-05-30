import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { applicationApi, documentApi } from "@/lib/api";
import {
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  FileSignature,
  Download,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — QaiKbank" },
      { name: "description", content: "View your loan application history and status." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSanction, setSelectedSanction] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch applications and uploads on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appRes, docRes] = await Promise.all([
          applicationApi.getApplications().catch(() => ({ success: false, data: [] })),
          documentApi.getDocuments().catch(() => ({ success: false, data: [] })),
        ]);

        if (appRes && appRes.success) {
          setApplications(appRes.data || []);
        }
        if (docRes && docRes.success) {
          setDocuments(docRes.data || []);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewSanction = async (appId: string) => {
    try {
      const res = await applicationApi.getSanctionDetails(appId);
      if (res && res.success) {
        setSelectedSanction(res);
        setDialogOpen(true);
      }
    } catch (error) {
      alert("Failed to load sanction letter details.");
    }
  };

  // Compute stats
  const totalCount = applications.length;
  const approvedCount = applications.filter((a) => a.status === "APPROVED").length;
  const rejectedCount = applications.filter((a) => a.status === "REJECTED").length;
  const pendingCount = applications.filter((a) => a.status === "PENDING").length;

  const stats = [
    { label: "Total Applications", value: String(totalCount), icon: FileText },
    { label: "Approved Loans", value: String(approvedCount), icon: CheckCircle2, color: "text-green-600" },
    { label: "Declined Applications", value: String(rejectedCount), icon: XCircle, color: "text-red-500" },
    { label: "Underwriting Pending", value: String(pendingCount), icon: Clock, color: "text-amber-500" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-6 flex-wrap pb-6 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Relationship Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Track your autonomous AI lending decisions and verification documents.
          </p>
        </div>
        <Button asChild className="rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-md">
          <Link to="/chat">
            Talk to Ducky <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {s.label}
              </p>
              <s.icon className={`h-5 w-5 ${s.color || "text-muted-foreground"}`} />
            </div>
            <p className="mt-4 text-4xl font-extrabold tracking-tight text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Loan Applications Table */}
      <div className="mt-12 bg-card/40 border border-border/80 rounded-3xl overflow-hidden shadow-soft p-6 backdrop-blur">
        <h2 className="text-lg font-bold text-foreground mb-4">Underwriting History</h2>
        
        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
            Syncing database records...
          </div>
        ) : applications.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No applications found. Talk with Ducky to create your first personal loan evaluation!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Reference / ID</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Tenure</th>
                  <th className="px-4 py-3">Approval Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-muted/10 transition-colors">
                    {/* ID / Reference */}
                    <td className="px-4 py-3.5 font-mono text-xs">
                      {app.sanctionReference ? (
                        <span className="font-bold text-foreground bg-secondary/80 py-0.5 px-2.5 rounded-full">
                          {app.sanctionReference}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">{app._id.substring(0, 8)}...</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5 font-bold text-foreground">
                      ₹{app.loanAmount.toLocaleString("en-IN")}
                    </td>

                    {/* Tenure */}
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {app.tenure} months
                    </td>

                    {/* Approval Date */}
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {app.approvalDate
                        ? new Date(app.approvalDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          app.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : app.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700 animate-pulse"
                        }`}
                      >
                        {app.status === "APPROVED" && "✓ "}
                        {app.status === "REJECTED" && "✗ "}
                        {app.status === "PENDING" && "● "}
                        {app.status}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="px-4 py-3.5 text-right">
                      {app.status === "APPROVED" && (
                        <Button
                          onClick={() => handleViewSanction(app._id)}
                          size="sm"
                          variant="ghost"
                          className="rounded-full text-xs font-semibold text-accent hover:text-accent-foreground flex items-center gap-1 ml-auto"
                        >
                          <FileSignature className="h-3.5 w-3.5" />
                          Sanction Letter
                        </Button>
                      )}
                      {app.status === "REJECTED" && (
                        <span className="text-xs text-muted-foreground/60 italic pr-2">Rejected</span>
                      )}
                      {app.status === "PENDING" && (
                        <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                          <Link to="/chat">Resume Chat</Link>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Uploaded Documents List */}
      <div className="mt-12 bg-card/40 border border-border/80 rounded-3xl overflow-hidden shadow-soft p-6 backdrop-blur">
        <h2 className="text-lg font-bold text-foreground mb-4">KYC & Income Proofs</h2>
        
        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
            Syncing document registry...
          </div>
        ) : documents.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No uploaded verification documents found.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="rounded-2xl border border-border/60 bg-secondary/10 p-5 space-y-3 shadow-soft hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between border-b border-border/30 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Salary payslip
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      doc.verificationStatus === "verified"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {doc.verificationStatus}
                  </span>
                </div>
                
                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Extracted Salary:</span>
                    <span className="font-bold text-foreground">
                      {doc.extractedData?.salary ? `₹${doc.extractedData.salary.toLocaleString("en-IN")}` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Document ID:</span>
                    <span className="font-mono text-muted-foreground/60">{doc._id.substring(0, 8)}...</span>
                  </div>
                </div>

                <Button asChild size="sm" variant="outline" className="w-full rounded-full text-xs mt-2">
                  <a href={doc.filePath} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-1 h-3.5 w-3.5" />
                    Download Original
                  </a>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic On-Screen Sanction Letter Modal Dialog */}
      {selectedSanction && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md rounded-3xl border border-border bg-card/95 backdrop-blur shadow-2xl p-6 overflow-hidden">
            <DialogHeader className="border-b border-border/60 pb-3 flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-1.5">
                  🏦 QaiKbanK Letter
                </DialogTitle>
                <DialogDescription className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">
                  Personal Loan Sanction Letter
                </DialogDescription>
              </div>
              <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-700">
                APPROVED
              </span>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              <div className="text-center space-y-1">
                <span className="font-mono font-bold bg-secondary py-0.5 px-3 rounded-full text-[10px]">
                  Ref: {selectedSanction.sanctionReference}
                </span>
                <p className="text-[9px] text-muted-foreground">
                  Date: {new Date(selectedSanction.approvalDate).toLocaleDateString("en-IN")}
                </p>
              </div>

              {/* Package Details */}
              <div className="rounded-2xl bg-secondary/40 p-4 space-y-2 border border-border/40">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer Name</span>
                  <span className="font-semibold">{selectedSanction.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved Amount</span>
                  <span className="font-extrabold text-green-600">₹{selectedSanction.approvedAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest Rate</span>
                  <span className="font-semibold">{selectedSanction.interestRate}% p.a.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loan Tenure</span>
                  <span className="font-semibold">{selectedSanction.tenure} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly EMI</span>
                  <span className="font-extrabold">₹{selectedSanction.emi.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-border/20">
                  <span className="text-muted-foreground">Total Repayment</span>
                  <span className="font-extrabold text-foreground">
                    ₹{(selectedSanction.emi * selectedSanction.tenure).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Explanations Section */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lending Insights</h4>
                <div className="space-y-1.5">
                  {selectedSanction.explanation?.positives?.slice(0, 3).map((pos: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-green-500 font-extrabold">✓</span>
                      <span className="text-muted-foreground font-medium">{pos}</span>
                    </div>
                  ))}
                  {selectedSanction.explanation?.riskFactors?.slice(0, 2).map((risk: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-extrabold">!</span>
                      <span className="text-muted-foreground/80 font-medium">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[9px] text-muted-foreground/60 leading-relaxed pt-2 border-t border-border/20 text-center">
                This document is electronically generated and requires no physical signature.
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
