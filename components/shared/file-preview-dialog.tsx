"use client";

import * as React from "react";
import { AlertCircle, Download, ExternalLink, FileQuestion, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "svg"];

type PreviewKind = "pdf" | "image" | "unsupported";

function previewKindFor(fileName: string): PreviewKind {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  return "unsupported";
}

export interface FileUrlResult {
  url: string | null;
  error: string | null;
}

interface FilePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  /** Signed URLs are short-lived, so both are fetched fresh on open. */
  loadPreviewUrl: () => Promise<FileUrlResult>;
  loadDownloadUrl: () => Promise<FileUrlResult>;
}

/**
 * Preview-or-download for one file, offered as three options rather than a
 * single "View" link: an inline preview for the file types a browser can
 * render (PDF, images), open-in-a-new-tab (lets the browser's own viewer
 * handle anything else it can), and a forced download. Shared by Class
 * Notes and Assignments - both are "a teacher/student hands over a document,
 * the other side needs to look at it" the same way.
 */
export function FilePreviewDialog({
  open,
  onOpenChange,
  fileName,
  loadPreviewUrl,
  loadDownloadUrl,
}: FilePreviewDialogProps) {
  const kind = previewKindFor(fileName);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [previewError, setPreviewError] = React.useState<string | null>(null);
  // Separate from `previewError` - unsupported file types skip the preview
  // fetch entirely and always show the placeholder, so a download failure
  // needs its own spot to render or it's silently unreachable.
  const [downloadError, setDownloadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setPreviewUrl(null);
      setPreviewError(null);
      setDownloadError(null);
      return;
    }
    if (kind === "unsupported") return;

    setLoading(true);
    loadPreviewUrl().then(({ url, error: loadError }) => {
      setLoading(false);
      if (url) setPreviewUrl(url);
      else setPreviewError(loadError ?? "Could not load a preview.");
    });
    // `open` and `kind` fully determine whether a fetch should happen; the
    // loader functions are recreated per render but always resolve the same
    // file for a given dialog instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, kind]);

  async function handleDownload() {
    const { url, error: downloadFailure } = await loadDownloadUrl();
    if (url) window.location.href = url;
    else setDownloadError(downloadFailure ?? "Could not download this file.");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="truncate">{fileName}</DialogTitle>
        </DialogHeader>

        <div className="bg-muted/30 grid h-[65vh] place-items-center overflow-auto rounded-lg border">
          {kind === "unsupported" ? (
            <div className="flex flex-col items-center gap-2 px-6 text-center">
              <FileQuestion className="text-muted-foreground size-8" />
              <p className="text-sm font-medium">Preview isn&rsquo;t available for this file type.</p>
              <p className="text-muted-foreground text-xs">Download it to open it on your device.</p>
            </div>
          ) : loading ? (
            <Loader2 className="text-muted-foreground size-6 animate-spin" />
          ) : previewError ? (
            <p className="flex items-center gap-1.5 px-6 text-center text-sm font-medium text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {previewError}
            </p>
          ) : kind === "pdf" && previewUrl ? (
            <iframe src={previewUrl} title={fileName} className="size-full rounded-lg" />
          ) : kind === "image" && previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- signed URL from Supabase Storage, not a static asset
            <img src={previewUrl} alt={fileName} className="max-h-full max-w-full object-contain" />
          ) : null}
        </div>

        {downloadError && (
          <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {downloadError}
          </p>
        )}

        <DialogFooter>
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
            >
              <ExternalLink className="size-4" />
              Open in new tab
            </a>
          )}
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Download className="size-4" />
            Download
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
