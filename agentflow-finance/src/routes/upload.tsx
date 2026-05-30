import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Image } from "lucide-react";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Documents — QaiKbank" },
      { name: "description", content: "Upload your salary slip for loan verification." },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  // TODO: Wire up to uploadApi.uploadSalarySlip in Step 2

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Upload Salary Slip</h1>
        <p className="mt-2 text-muted-foreground">
          Upload your latest salary slip for loan eligibility verification. We accept PDF and image files.
        </p>
      </div>

      {/* Drop Zone */}
      <div className="mt-10 rounded-3xl border-2 border-dashed border-border bg-card/50 p-12 text-center transition-colors hover:border-accent/60 hover:bg-accent/5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
          <Upload className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="mt-4 text-sm font-medium">
          Drag & drop your salary slip here
        </p>
        <p className="mt-1 text-xs text-muted-foreground">or click to browse</p>

        <div className="mt-6 flex justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" /> PDF
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
            <Image className="h-3 w-3" /> JPEG / PNG
          </span>
        </div>

        <Button className="mt-6 rounded-full bg-foreground text-background hover:bg-foreground/90">
          Select File
        </Button>
      </div>

      {/* Upload Status Placeholder */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        No files uploaded yet. Upload a salary slip to proceed with your loan application.
      </div>
    </section>
  );
}
