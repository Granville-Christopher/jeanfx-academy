import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { submitDepositProof } from "@/lib/desk.functions";
import type { DeskPlan } from "@/lib/site-content";

export function DepositProofForm({ plan, reference }: { plan: DeskPlan; reference: string }) {
  const [fileName, setFileName] = useState("");
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [sentReference, setSentReference] = useState("");

  const sent = sentReference === reference && reference !== "";

  return (
    <form
      className="border border-border p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        if (!dataUrl) {
          setError("Choose the screenshot or PDF of the transfer.");
          return;
        }
        setPending(true);
        try {
          const result = await submitDepositProof({
            data: { planId: plan.id, reference, fileName, dataUrl },
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setSentReference(reference);
          setDataUrl("");
          setFileName("");
          toast.success("Proof received. The desk will confirm this payment.");
        } catch {
          setError("The proof could not be sent. Try again.");
        } finally {
          setPending(false);
        }
      }}
    >
      <p className="kicker">Deposit proof</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        After you send the transfer, upload a screenshot or PDF of it. The desk keeps the file with
        this payment reference.
      </p>
      <label className="mt-4 block">
        <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Transfer receipt
        </span>
        <input
          type="file"
          name="deposit-proof"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="mt-2 block w-full text-sm text-muted-foreground file:mr-3 file:border file:border-primary/40 file:bg-transparent file:px-3 file:py-2 file:text-xs file:uppercase file:tracking-[0.14em] file:text-primary"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setError("");
            setSentReference("");
            try {
              const next = await fileToProofDataUrl(file);
              setDataUrl(next);
              setFileName(file.name);
            } catch (uploadError) {
              setDataUrl("");
              setFileName("");
              setError(
                uploadError instanceof Error ? uploadError.message : "Could not read that file.",
              );
            }
          }}
        />
      </label>
      {fileName && dataUrl ? (
        <p className="mt-3 text-sm text-foreground">Ready to send: {fileName}</p>
      ) : null}
      {dataUrl.startsWith("data:image/") ? (
        <img src={dataUrl} alt="" className="mt-3 max-h-40 bg-white object-contain" />
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {sent ? (
        <p className="mt-3 text-sm text-primary" role="status">
          Proof received for {reference}. The desk can see it now.
        </p>
      ) : (
        <Button type="submit" className="mt-4 h-11 rounded-none" disabled={pending || !dataUrl}>
          {pending ? "Sending…" : "Send deposit proof"}
        </Button>
      )}
    </form>
  );
}

async function fileToProofDataUrl(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    if (file.size > 1_500_000) throw new Error("Use a PDF under 1.5 MB.");
    return readAsDataUrl(file);
  }
  if (!file.type.startsWith("image/")) throw new Error("Upload a PNG, JPG, or PDF.");
  if (file.size > 8_000_000) throw new Error("Use an image under 8 MB.");
  const bitmap = await createImageBitmap(file);
  const maxEdge = 1400;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not read that image.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  let url = canvas.toDataURL("image/jpeg", 0.8);
  if (url.length > 1_800_000) url = canvas.toDataURL("image/jpeg", 0.6);
  if (url.length > 2_200_000) throw new Error("That image is still too large.");
  return url;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read that file."));
    };
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}
