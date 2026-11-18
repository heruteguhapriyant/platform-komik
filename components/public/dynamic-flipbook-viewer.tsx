"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const FlipbookViewer = dynamic(
  () => import("@/components/public/flipbook-viewer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full min-h-[500px] flex flex-col items-center justify-center gap-3 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-400">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-medium">Memuat Flipbook Reader...</p>
      </div>
    ),
  }
);

export default FlipbookViewer;
