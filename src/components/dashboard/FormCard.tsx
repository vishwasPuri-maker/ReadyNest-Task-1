"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

type Form = {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  responseCount: number;
};

export default function FormCard({ form }: { form: Form }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/form/${form.id}`
      : "";

  function downloadQR() {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${form.title.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/forms/${form.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function togglePublish() {
    setUpdating(true);
    await fetch(`/api/forms/${form.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !form.published }),
    });
    router.refresh();
    setUpdating(false);
  }

  async function copyLink() {
    const url = `${window.location.origin}/form/${form.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-border">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug">{form.title}</h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-widest ${
              form.published
                ? "bg-accent text-accent-foreground"
                : "border border-border text-muted"
            }`}
          >
            {form.published ? "PUBLISHED" : "DRAFT"}
          </span>
        </div>
        {form.description && (
          <p className="mt-2 line-clamp-2 text-xs text-muted">
            {form.description}
          </p>
        )}
        <p className="mt-4 text-sm">
          <span className="text-2xl font-bold">{form.responseCount}</span>{" "}
          <span className="text-xs text-muted">responses</span>
        </p>

        {form.published ? (
          /* Published: view + share + unpublish */
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link
              href={`/form/${form.id}`}
              target="_blank"
              className="rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:border-foreground/40"
            >
              View
            </Link>
            <button
              type="button"
              onClick={copyLink}
              className="rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:border-foreground/40"
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={() => setShowQR(true)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:border-foreground/40"
            >
              QR
            </button>
            <button
              type="button"
              onClick={togglePublish}
              disabled={updating}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-foreground/40 hover:text-foreground disabled:opacity-60"
            >
              {updating ? "..." : "Unpublish"}
            </button>
          </div>
        ) : (
          /* Draft: publish it */
          <button
            type="button"
            onClick={togglePublish}
            disabled={updating}
            className="mt-4 w-full rounded-lg bg-accent py-2 text-xs font-semibold tracking-widest text-accent-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {updating ? "PUBLISHING..." : "PUBLISH"}
          </button>
        )}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Link
          href={`/forms/${form.id}/edit`}
          className="flex-1 rounded-lg border border-border py-2 text-center text-xs font-medium transition-colors hover:border-foreground/40"
        >
          Edit
        </Link>
        <Link
          href={`/forms/${form.id}/responses`}
          className="flex-1 rounded-lg border border-border py-2 text-center text-xs font-medium transition-colors hover:border-foreground/40"
        >
          Responses
        </Link>
        {confirm ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 rounded-lg bg-red-500/90 py-2 text-center text-xs font-medium text-foreground transition-colors hover:bg-red-500 disabled:opacity-60"
          >
            {deleting ? "..." : "Confirm"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            className="flex-1 rounded-lg border border-border py-2 text-center text-xs font-medium text-red-400 transition-colors hover:border-red-400/60"
          >
            Delete
          </button>
        )}
      </div>

      {/* QR code modal */}
      {showQR && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
          onClick={() => setShowQR(false)}
        >
          <div
            className="w-full max-w-xs animate-fade-up rounded-2xl border border-border bg-background p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold">{form.title}</h3>
            <p className="mt-1 text-xs text-muted">
              Scan to open and fill this form
            </p>

            {/* QR always on white so it scans in any theme */}
            <div
              ref={qrRef}
              className="mx-auto mt-5 w-fit rounded-xl bg-white p-4"
            >
              <QRCodeCanvas value={publicUrl} size={200} marginSize={1} />
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={downloadQR}
                className="w-full rounded-lg bg-accent py-2.5 text-xs font-semibold tracking-widest text-accent-foreground transition-transform hover:scale-[1.02]"
              >
                DOWNLOAD QR
              </button>
              <button
                type="button"
                onClick={() => setShowQR(false)}
                className="text-xs text-muted underline-offset-4 hover:text-foreground hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
