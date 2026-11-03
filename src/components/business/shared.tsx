"use client";

import { useCallback, useEffect, useState } from "react";
import { subscribeToDataChange } from "@/lib/finance-store";
import { getOrders, getProducts, type Order, type Product } from "@/lib/business-store";
import { cn } from "@/lib/utils";

export function useBusinessData() {
  const [data, setData] = useState<{ orders: Order[]; products: Product[] } | null>(null);
  const refresh = useCallback(() => setData({ orders: getOrders(), products: getProducts() }), []);
  useEffect(() => {
    refresh();
    return subscribeToDataChange(refresh);
  }, [refresh]);
  return data;
}

const PILL: Record<string, string> = {
  Paid: "bg-white/10 text-foreground",
  Fulfilled: "bg-white/10 text-foreground",
  Active: "bg-emerald-500/20 text-emerald-300",
  Draft: "bg-sky-500/20 text-sky-300",
  Unfulfilled: "bg-yellow-400/90 text-black",
  "Payment pending": "bg-orange-400/90 text-black",
  Refunded: "bg-white/5 text-muted-foreground",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-xs font-medium whitespace-nowrap", PILL[status] ?? "bg-white/10")}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export function downloadFile(name: string, content: string, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

// Shrinks an uploaded photo to a small JPEG data URL so it fits in browser storage.
export function readImageAsDataURL(file: File, max = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export const timeLabel = (iso: string) => {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  const t = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  if (days === 0) return `Today at ${t}`;
  if (days === 1) return `Yesterday at ${t}`;
  if (days < 7) return `${d.toLocaleDateString("en-IN", { weekday: "long" })} at ${t}`;
  return `${d.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} at ${t}`;
};
