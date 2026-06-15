import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Job } from "../types";
import { ScoreBadge } from "./ui";

interface Props {
  job: Job;
  onOpen?: (id: number) => void;
  overlay?: boolean;
}

export default function JobCard({ job, onOpen, overlay }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `job-${job.id}`, disabled: overlay });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onOpen?.(job.id)}
      className={`group cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md active:cursor-grabbing ${
        overlay ? "rotate-2 shadow-lg ring-2 ring-indigo-200" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-slate-800">
          {job.title}
        </h3>
        {hasKitHint(job) && <span title="Has match data">✨</span>}
      </div>
      <p className="mt-0.5 text-xs text-slate-500">
        {job.company}
        {job.location ? ` · ${job.location}` : ""}
      </p>
      {job.salary && (
        <p className="mt-1 text-xs font-medium text-emerald-600">{job.salary}</p>
      )}
      {(job.match_score !== null ||
        job.ai_driven_score !== null ||
        job.ai_resist_score !== null) && (
        <div className="mt-2 flex flex-wrap gap-1">
          <ScoreBadge label="Match" value={job.match_score} />
          <ScoreBadge label="AI-driven" value={job.ai_driven_score} />
          <ScoreBadge label="AI-resist" value={job.ai_resist_score} />
        </div>
      )}
    </div>
  );
}

function hasKitHint(job: Job): boolean {
  return job.match_score !== null;
}
