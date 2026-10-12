import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function WalletQr({ value, label }: { value: string; label: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      margin: 1,
      width: 180,
      errorCorrectionLevel: "M",
      color: { dark: "#07111c", light: "#f4fbff" },
    })
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!src) {
    return <div className="size-[168px] border border-border bg-foreground/5" aria-hidden="true" />;
  }

  return (
    <img
      src={src}
      alt={`QR code for the ${label} wallet`}
      width={168}
      height={168}
      className="size-[168px] bg-white"
    />
  );
}
