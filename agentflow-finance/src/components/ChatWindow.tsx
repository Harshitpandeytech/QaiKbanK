import { useState, useRef, useEffect } from "react";
import ducky from "@/assets/ducky.png";
import { ArrowUp, Paperclip } from "lucide-react";

interface Message {
  id: string;
  from: "user" | "ducky";
  text: string;
  agentName?: string;
  timestamp: Date;
}

/**
 * ChatWindow — Interactive chat interface for talking to Ducky.
 *
 * Props:
 * - onSend: callback when user sends a message
 * - messages: array of messages to display
 * - isLoading: whether an agent is currently processing
 * - onFileUpload: optional callback for salary slip upload
 */
export function ChatWindow({
  messages = [],
  isLoading = false,
  onSend,
  onFileUpload,
}: {
  messages?: Message[];
  isLoading?: boolean;
  onSend?: (message: string) => void;
  onFileUpload?: (file: File) => void;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !onSend) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="flex h-full flex-col rounded-3xl border border-border/70 bg-card/90 shadow-soft backdrop-blur">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full animate-pulse-ring" />
          <img src={ducky} alt="Ducky" className="relative h-10 w-10 rounded-full bg-accent/40 object-contain" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">Ducky</p>
          <p className="mt-1 text-xs text-muted-foreground">Your AI banker · online</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[10px] font-medium text-secondary-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Active
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <img src={ducky} alt="Ducky" className="mx-auto h-20 w-20 opacity-40" />
              <p className="mt-3 text-sm text-muted-foreground">
                Say hello to start your loan journey!
              </p>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} from={msg.from} text={msg.text} agentName={msg.agentName} />
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fade-up">
            <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-secondary px-3.5 py-2 text-sm">
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border/60 px-4 py-3">
        {onFileUpload && (
          <label className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <Paperclip className="h-4 w-4" />
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileUpload(file);
              }}
            />
          </label>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message Ducky…"
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background disabled:opacity-40 transition-opacity"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function ChatBubble({
  from,
  text,
  agentName,
}: {
  from: "user" | "ducky";
  text: string;
  agentName?: string;
}) {
  const isUser = from === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-up`}>
      <div className="flex flex-col gap-1">
        {!isUser && agentName && (
          <span className="ml-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {agentName}
          </span>
        )}
        <div
          className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-foreground text-background rounded-br-sm"
              : "bg-secondary text-foreground rounded-bl-sm"
          }`}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
