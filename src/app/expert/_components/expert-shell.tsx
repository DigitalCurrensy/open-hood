import type { ReactNode } from "react";
import { ExpertBoard } from "@/app/expert/_components/expert-board";

export function ExpertShell({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <ExpertBoard />
      {children}
    </div>
  );
}
