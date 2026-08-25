import type { ReactNode } from "react";
import { JobsBoard } from "@/app/jobs/_components/jobs-board";

export function JobsShell({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <JobsBoard />
      {children}
    </div>
  );
}
