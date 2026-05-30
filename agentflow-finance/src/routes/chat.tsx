import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { AgentStatus } from "@/components/AgentStatus";
import { LoanSummary } from "@/components/LoanSummary";
import { chatApi, uploadApi } from "@/lib/api";
import { RefreshCw, CheckCircle, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  from: "user" | "ducky";
  text: string;
  agentName?: string;
  timestamp: Date;
}

interface CollectedData {
  customerId?: string | null;
  customerName?: string | null;
  loanAmount?: number | null;
  loanPurpose?: string | null;
  tenure?: number | null;
  employmentType?: string | null;
  monthlyIncome?: number | null;
  existingLoans?: string[];
}

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat with Ducky — QaiKbank" },
      { name: "description", content: "Talk to Ducky, your AI banker. Apply for a personal loan through a simple conversation." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<string>("WELCOME");
  const [collectedData, setCollectedData] = useState<CollectedData>({});
  const [decisionDetails, setDecisionDetails] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize and load session from local storage or create new session
  useEffect(() => {
    const savedSessionId = localStorage.getItem("qaikbank_session_id");
    if (savedSessionId) {
      loadSession(savedSessionId);
    } else {
      // Start session with an initial message from Ducky
      startNewSession();
    }
  }, []);

  const startNewSession = () => {
    localStorage.removeItem("qaikbank_session_id");
    setSessionId(null);
    setCurrentStage("WELCOME");
    setCollectedData({});
    setDecisionDetails(null);
    setErrorMsg(null);
    setMessages([
      {
        id: "welcome-msg",
        from: "ducky",
        text: "Hi there! 🦆 I'm Ducky, your AI Relationship Manager at QaiKbanK. I'm here to help you get a Personal Loan in under 5 minutes. To get started, could you please share your Customer ID (e.g. C001, C002) or registered phone number?",
        agentName: "salesAgent",
        timestamp: new Date(),
      },
    ]);
  };

  const loadSession = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await chatApi.getSession(id);
      if (res && res.success) {
        setSessionId(res.sessionId);
        setCurrentStage(res.currentStage);
        setCollectedData(res.collectedData || {});
        setDecisionDetails(res.decisionDetails || null);
        
        // Map backend messages to UI messages
        const uiMsgs: Message[] = res.messages.map((m: any, idx: number) => ({
          id: `msg-${idx}-${m.timestamp}`,
          from: m.role === "user" ? "user" : "ducky",
          text: m.content,
          agentName: m.agentName || undefined,
          timestamp: new Date(m.timestamp),
        }));

        setMessages(uiMsgs);
        localStorage.setItem("qaikbank_session_id", res.sessionId);
      } else {
        startNewSession();
      }
    } catch (error) {
      console.error("Failed to load chat session:", error);
      startNewSession();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message to UI
    const userMsgId = `user-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      from: "user",
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await chatApi.sendMessage(text, sessionId || undefined);
      if (res && res.success) {
        setSessionId(res.sessionId);
        setCurrentStage(res.stage);
        setCollectedData(res.collectedData || {});
        setDecisionDetails(res.decisionDetails || null);
        localStorage.setItem("qaikbank_session_id", res.sessionId);

        // Add Ducky response to UI
        const duckyMsg: Message = {
          id: `ducky-${Date.now()}`,
          from: "ducky",
          text: res.reply,
          agentName: res.agentName,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, duckyMsg]);
      } else {
        throw new Error("Invalid server response");
      }
    } catch (error: any) {
      console.error("Send message error:", error);
      setErrorMsg(error.message || "Failed to connect to Ducky. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await uploadApi.uploadSalarySlip(file);
      
      // Post a message in the chat indicating the file was uploaded
      await handleSendMessage(`[File Uploaded] ${file.name}`);
    } catch (error: any) {
      console.error("File upload error:", error);
      setErrorMsg(error.message || "Failed to upload salary slip.");
      setIsLoading(false);
    }
  };

  // Map Mongoose DB stages to UI pipeline stages
  const mapStageToUi = (dbStage: string) => {
    const stagesList = [
      "WELCOME",
      "COLLECT_CUSTOMER_ID",
      "COLLECT_LOAN_AMOUNT",
      "COLLECT_LOAN_PURPOSE",
      "COLLECT_TENURE",
      "COLLECT_EMPLOYMENT",
    ];

    if (stagesList.includes(dbStage)) {
      return { currentStage: "SALES", completedStages: [] };
    }
    if (dbStage === "SALES_COMPLETED" || dbStage === "VERIFICATION") {
      return { currentStage: "VERIFICATION", completedStages: ["SALES"] };
    }
    if (["UNDERWRITING", "SALARY_UPLOAD_REQUIRED", "UNDERWRITING_REVIEW"].includes(dbStage)) {
      return { currentStage: "UNDERWRITING", completedStages: ["SALES", "VERIFICATION"] };
    }
    if (dbStage === "DECISION_COMPLETE") {
      return { currentStage: "COMPLETED", completedStages: ["SALES", "VERIFICATION", "UNDERWRITING"] };
    }
    if (dbStage === "LOAN_COMPLETED") {
      return { currentStage: "COMPLETED", completedStages: ["SALES", "VERIFICATION", "UNDERWRITING", "SANCTION", "COMPLETED"] };
    }
    return { currentStage: "SALES", completedStages: [] };
  };

  const uiStage = mapStageToUi(currentStage);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Chat with Ducky
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Apply for a personal loan through an interactive conversation.
          </p>
        </div>
        <Button
          onClick={startNewSession}
          variant="outline"
          className="w-full sm:w-auto rounded-full border-border/80 hover:bg-secondary flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset Chat
        </Button>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive flex items-center gap-2">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px] items-start">
        {/* Chat Window Container */}
        <div className="h-[650px] shadow-lg rounded-3xl overflow-hidden border border-border/50">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSend={handleSendMessage}
            onFileUpload={
              currentStage === "SALARY_UPLOAD_REQUIRED" ? handleFileUpload : undefined
            }
          />
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Agent Pipeline Tracker */}
          <AgentStatus
            currentStage={uiStage.currentStage}
            completedStages={uiStage.completedStages}
          />

          {/* Underwriting Decision Card & On-Screen Sanction Letter */}
          {decisionDetails && (
            <div className="space-y-6 animate-fade-up">
              {decisionDetails.decision === "APPROVED" && decisionDetails.sanctionPackage ? (
                <div className="rounded-3xl border border-border bg-card/80 backdrop-blur shadow-lg overflow-hidden p-6 space-y-6">
                  {/* Bank Header */}
                  <div className="flex items-center justify-between border-b border-border/60 pb-4">
                    <div>
                      <h2 className="text-lg font-extrabold tracking-tight text-foreground flex items-center gap-1.5">
                        <span className="text-accent">🏦</span> QaiKbanK
                      </h2>
                      <p className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Digital Retail Lending</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-700 animate-pulse">
                      APPROVED
                    </span>
                  </div>

                  {/* Letter Header */}
                  <div className="text-center space-y-1">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Personal Loan Sanction Letter</h3>
                    <p className="text-[11px] text-muted-foreground font-mono bg-secondary/50 py-0.5 px-2 rounded-full inline-block">
                      Ref: {decisionDetails.sanctionPackage.sanctionReference}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      Date: {new Date(decisionDetails.sanctionPackage.approvalDate).toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  {/* Customer Information */}
                  <div className="rounded-2xl bg-secondary/30 p-4 text-xs space-y-2.5 border border-border/40">
                    <div className="flex justify-between border-b border-border/20 pb-1.5">
                      <span className="text-muted-foreground">Customer Name</span>
                      <span className="font-semibold">{decisionDetails.sanctionPackage.customerName}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-1.5">
                      <span className="text-muted-foreground">Customer ID</span>
                      <span className="font-mono font-semibold">{collectedData.customerId}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-1.5">
                      <span className="text-muted-foreground">Sanctioned Amount</span>
                      <span className="font-extrabold text-green-600">₹{decisionDetails.sanctionPackage.loanAmount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-1.5">
                      <span className="text-muted-foreground">Interest Rate</span>
                      <span className="font-semibold">{decisionDetails.sanctionPackage.interestRate}% p.a.</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-1.5">
                      <span className="text-muted-foreground">Loan Tenure</span>
                      <span className="font-semibold">{decisionDetails.sanctionPackage.tenure} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly EMI</span>
                      <span className="font-extrabold text-foreground">₹{decisionDetails.sanctionPackage.emi.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Insights Section */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Approval Insights</h4>
                    <div className="space-y-2 text-xs">
                      {decisionDetails.sanctionPackage.explanation?.positives?.slice(0, 4).map((pos: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 animate-fade-up" style={{ animationDelay: `${idx * 100}ms` }}>
                          <span className="text-green-500 font-extrabold">✓</span>
                          <span className="text-muted-foreground font-medium">{pos}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary calculations */}
                  <div className="space-y-3 pt-2 border-t border-border/40">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Repayment Details</h4>
                    <div className="rounded-2xl border border-border/40 p-4 text-xs space-y-2.5 bg-secondary/10">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Repayment</span>
                        <span className="font-bold text-foreground">
                          ₹{(decisionDetails.sanctionPackage.emi * decisionDetails.sanctionPackage.tenure).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Credit Score Checked</span>
                        <span className="font-semibold text-foreground">{decisionDetails.creditScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pre-approved Offer Limit</span>
                        <span className="font-semibold text-foreground">₹{decisionDetails.preApprovedLimit?.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Standard terms & signature */}
                  <div className="text-[10px] text-muted-foreground/80 leading-relaxed pt-2 border-t border-border/40 space-y-2.5">
                    <p><strong>Terms & Conditions:</strong> Subject to final KYC verification and automated e-NACH mandate registration. All calculations represent reducing monthly balance structures.</p>
                    <div className="flex items-center justify-between pt-3">
                      <div>
                        <p className="font-semibold text-foreground font-serif text-[10px]">Ducky AI</p>
                        <p className="text-[8px] text-muted-foreground/60">Digital Lending Officer</p>
                      </div>
                      <div className="h-9 w-12 border border-dashed border-border/80 rounded grid place-items-center bg-muted text-[8px] font-bold text-muted-foreground/50 rotate-6 shadow-soft">
                        SEAL
                      </div>
                    </div>
                  </div>
                </div>
              ) : decisionDetails.decision === "REJECTED" ? (
                <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 space-y-4">
                  <div className="flex items-center gap-3 border-b border-destructive/10 pb-3">
                    <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                    <h3 className="text-sm font-bold text-destructive">Application Declined</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{decisionDetails.reason}</p>
                  <div className="rounded-2xl bg-destructive/10 p-4 text-xs space-y-2">
                    <div className="flex justify-between"><span className="text-muted-foreground">Credit Score:</span><span className="font-bold text-destructive">{decisionDetails.creditScore || "N/A"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Pre-approved Limit:</span><span className="font-semibold text-foreground">₹{decisionDetails.preApprovedLimit?.toLocaleString("en-IN") || "0"}</span></div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-amber-300/40 bg-amber-500/5 p-6 text-center space-y-3">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-sm font-bold animate-bounce">
                    📤
                  </div>
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-widest">Document Upload Required</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    To complete your underwriting review, please upload your monthly salary payslip (image or PDF) using the attach clip in the chat.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Real-time Collected Requirements Card */}
          <div className="rounded-3xl border border-border bg-card/60 backdrop-blur p-6 shadow-soft">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
              <CircleDot className="h-3 w-3 text-accent animate-pulse" />
              Loan Requirements
            </h3>
            
            <div className="space-y-4">
              {/* Customer ID / Name */}
              <div className="flex items-start justify-between border-b border-border/40 pb-3">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Customer</p>
                  <p className="mt-1 text-sm font-semibold">
                    {collectedData.customerName || collectedData.customerId || "Not identified"}
                  </p>
                </div>
                {collectedData.customerId ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                ) : (
                  <span className="text-[10px] text-muted-foreground/60 italic mt-1">Pending</span>
                )}
              </div>

              {/* Loan Amount */}
              <div className="flex items-start justify-between border-b border-border/40 pb-3">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Requested Loan</p>
                  <p className="mt-1 text-sm font-semibold">
                    {collectedData.loanAmount ? `₹${collectedData.loanAmount.toLocaleString("en-IN")}` : "Not requested yet"}
                  </p>
                </div>
                {collectedData.loanAmount ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                ) : (
                  <span className="text-[10px] text-muted-foreground/60 italic mt-1">Pending</span>
                )}
              </div>

              {/* Loan Purpose */}
              <div className="flex items-start justify-between border-b border-border/40 pb-3">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Loan Purpose</p>
                  <p className="mt-1 text-sm font-semibold">
                    {collectedData.loanPurpose || "Not shared yet"}
                  </p>
                </div>
                {collectedData.loanPurpose ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                ) : (
                  <span className="text-[10px] text-muted-foreground/60 italic mt-1">Pending</span>
                )}
              </div>

              {/* Tenure */}
              <div className="flex items-start justify-between border-b border-border/40 pb-3">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Tenure</p>
                  <p className="mt-1 text-sm font-semibold">
                    {collectedData.tenure ? `${collectedData.tenure} months` : "Not decided yet"}
                  </p>
                </div>
                {collectedData.tenure ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                ) : (
                  <span className="text-[10px] text-muted-foreground/60 italic mt-1">Pending</span>
                )}
              </div>

              {/* Employment Type */}
              <div className="flex items-start justify-between pb-1">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Employment</p>
                  <p className="mt-1 text-sm font-semibold">
                    {collectedData.employmentType || "Not shared yet"}
                  </p>
                </div>
                {collectedData.employmentType ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                ) : (
                  <span className="text-[10px] text-muted-foreground/60 italic mt-1">Pending</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
