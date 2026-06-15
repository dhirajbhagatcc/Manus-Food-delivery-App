import React, { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  closestCorners,
} from "@dnd-kit/core";
import { Job, JobStatus, COLUMNS } from "../types";
import { api } from "../api";
import Column from "./Column";
import JobCard from "./JobCard";
import { Spinner } from "./ui";

interface Props {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  loading: boolean;
  onOpen: (id: number) => void;
  onAdd: () => void;
}

export default function Board({ jobs, setJobs, loading, onOpen, onAdd }: Props) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const byColumn = useMemo(() => {
    const map: Record<JobStatus, Job[]> = {
      wishlist: [],
      applied: [],
      interviewing: [],
      offer: [],
      rejected: [],
    };
    for (const j of jobs) map[j.status]?.push(j);
    for (const k of Object.keys(map) as JobStatus[]) {
      map[k].sort((a, b) => a.position - b.position);
    }
    return map;
  }, [jobs]);

  const activeJob = jobs.find((j) => j.id === activeId) || null;

  function onDragStart(e: DragStartEvent) {
    setActiveId(parseId(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;

    const jobId = parseId(active.id);
    const moved = jobs.find((j) => j.id === jobId);
    if (!moved) return;

    // Resolve target column and insertion index.
    const overId = String(over.id);
    let targetStatus: JobStatus;
    let targetIndex: number;

    if (overId.startsWith("col-")) {
      targetStatus = overId.slice(4) as JobStatus;
      targetIndex = byColumn[targetStatus].length;
    } else {
      const overJob = jobs.find((j) => j.id === parseId(over.id));
      if (!overJob) return;
      targetStatus = overJob.status;
      targetIndex = byColumn[targetStatus].findIndex((j) => j.id === overJob.id);
    }

    const sameColumn = moved.status === targetStatus;
    if (sameColumn) {
      const col = byColumn[targetStatus].filter((j) => j.id !== jobId);
      col.splice(targetIndex, 0, { ...moved, status: targetStatus });
      persist(targetStatus, col);
    } else {
      const source = byColumn[moved.status].filter((j) => j.id !== jobId);
      const target = [...byColumn[targetStatus]];
      target.splice(targetIndex, 0, { ...moved, status: targetStatus });
      persist(moved.status, source);
      persist(targetStatus, target);
    }
  }

  // Optimistically renumber a column and save the order to the server.
  function persist(status: JobStatus, ordered: Job[]) {
    const items = ordered.map((j, i) => ({ id: j.id, status, position: i }));
    setJobs((prev) => {
      const others = prev.filter((j) => !items.some((it) => it.id === j.id));
      const updated = ordered.map((j, i) => ({ ...j, status, position: i }));
      return [...others, ...updated];
    });
    api.reorder(items).catch(() => {
      /* on failure, a manual refresh will resync */
    });
  }

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  const empty = jobs.length === 0;

  return (
    <>
      {empty && (
        <div className="mb-4 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-600">
            No jobs yet. Add one from a URL or paste a description, or check the{" "}
            <span className="font-medium">Discover</span> tab for daily matches.
          </p>
          <button
            onClick={onAdd}
            className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + Add your first job
          </button>
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 scroll-thin">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              column={col}
              jobs={byColumn[col.id]}
              onOpen={onOpen}
            />
          ))}
        </div>
        <DragOverlay>
          {activeJob ? <JobCard job={activeJob} overlay /> : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}

function parseId(id: string | number): number {
  return Number(String(id).replace("job-", ""));
}
