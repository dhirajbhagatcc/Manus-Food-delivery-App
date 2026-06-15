import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Discovery } from "../types";
import { ScoreBadge, Spinner } from "./ui";

export default function Discover({
  onAdded,
  onCountChange,
}: {
  onAdded: () => void;
  onCountChange: (n: number) => void;
}) {
  const [items, setItems] = useState<Discovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    setLoading(true);
    try {
      const list = await api.listDiscoveries("new");
      setItems(list);
      onCountChange(list.length);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function refresh() {
    setRunning(true);
    setError("");
    setStatus("Searching job boards and scoring matches… this can take a minute.");
    try {
      const result = await api.runDiscovery();
      setStatus(
        `Fetched ${result.fetched} listings · kept ${result.kept} new matches${
          result.emailed ? " · digest emailed" : ""
        }.`
      );
      await load();
    } catch (err: any) {
      setError(err.message || "Sourcing failed");
      setStatus("");
    } finally {
      setRunning(false);
    }
  }

  async function add(id: number) {
    setBusyId(id);
    try {
      await api.addDiscovery(id);
      setItems((prev) => prev.filter((d) => d.id !== id));
      onCountChange(items.length - 1);
      onAdded();
    } finally {
      setBusyId(null);
    }
  }

  async function dismiss(id: number) {
    setBusyId(id);
    try {
      await api.dismissDiscovery(id);
      setItems((prev) => prev.filter((d) => d.id !== id));
      onCountChange(items.length - 1);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Discover</h1>
          <p className="text-sm text-slate-500">
            Daily remote matches scored against your profile. Runs automatically
            each morning — or refresh now.
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={running}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {running && <Spinner />} Refresh jobs now
        </button>
      </div>

      {status && (
        <p className="mb-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
          {status}
        </p>
      )}
      {error && (
        <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-slate-400">
          <Spinner className="h-6 w-6" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No new matches right now. Hit <b>Refresh jobs now</b> to source fresh
          remote roles.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((d) => (
            <div
              key={d.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-slate-800 hover:text-indigo-600 hover:underline"
                >
                  {d.title}
                </a>
                <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase text-slate-500">
                  {d.source}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {d.company}
                {d.location ? ` · ${d.location}` : ""}
              </p>
              {d.salary && (
                <p className="mt-1 text-xs font-medium text-emerald-600">
                  {d.salary}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-1">
                <ScoreBadge label="Match" value={d.match_score} />
                <ScoreBadge label="AI-driven" value={d.ai_driven_score} />
                <ScoreBadge label="AI-resist" value={d.ai_resist_score} />
              </div>
              {d.reason && (
                <p className="mt-2 text-xs italic text-slate-500">{d.reason}</p>
              )}
              <div className="mt-3 flex gap-2 pt-1">
                <button
                  onClick={() => add(d.id)}
                  disabled={busyId === d.id}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-indigo-600 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {busyId === d.id && <Spinner />} Add to Wishlist
                </button>
                <button
                  onClick={() => dismiss(d.id)}
                  disabled={busyId === d.id}
                  className="rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
