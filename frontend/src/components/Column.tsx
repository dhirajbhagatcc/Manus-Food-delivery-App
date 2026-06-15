import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Job, JobStatus } from "../types";
import JobCard from "./JobCard";

interface Props {
  column: { id: JobStatus; label: string; accent: string };
  jobs: Job[];
  onOpen: (id: number) => void;
}

export default function Column({ column, jobs, onOpen }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${column.id}` });

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className={`h-2.5 w-2.5 rounded-full ${column.accent}`} />
        <h2 className="text-sm font-semibold text-slate-700">{column.label}</h2>
        <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
          {jobs.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[120px] flex-1 flex-col gap-2 rounded-xl p-2 transition ${
          isOver ? "bg-indigo-50 ring-2 ring-indigo-200" : "bg-slate-100/70"
        }`}
      >
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onOpen={onOpen} />
        ))}
        {jobs.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-slate-400">
            Drop cards here
          </p>
        )}
      </div>
    </div>
  );
}
