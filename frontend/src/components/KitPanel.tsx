import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Job, Kit, KitType, KIT_META } from "../types";
import { Spinner } from "./ui";

export default function KitPanel({ job }: { job: Job }) {
  const [kits, setKits] = useState<Record<string, Kit>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .listKits(job.id)
      .then((list) => {
        if (!alive) return;
        const map: Record<string, Kit> = {};
        list.forEach((k) => (map[k.type] = k));
        setKits(map);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [job.id]);

  async function generate(type: KitType | "all") {
    setGenerating(type);
    setError("");
    try {
      const results = await api.generateKit(job.id, type);
      setKits((prev) => {
        const next = { ...prev };
        results.forEach((k) => (next[k.type] = k));
        return next;
      });
    } catch (err: any) {
      setError(err.message || "Generation failed");
    } finally {
      setGenerating(null);
    }
  }

  function copy(type: string, content: string) {
    navigator.clipboard.writeText(content);
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  }

  function download(type: string, label: string, content: string) {
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${label.replace(/\s+/g, "_")}_${job.company || "job"}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10 text-slate-400">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          AI-generated using your resume &amp; this role.
        </p>
        <button
          onClick={() => generate("all")}
          disabled={generating !== null}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {generating === "all" && <Spinner />} Generate all
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      {KIT_META.map(({ type, label, icon }) => {
        const kit = kits[type];
        const busy = generating === type || generating === "all";
        return (
          <div
            key={type}
            className="rounded-xl border border-slate-200 bg-white"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
              <span className="text-sm font-semibold text-slate-700">
                {icon} {label}
              </span>
              <div className="flex items-center gap-1">
                {kit && (
                  <>
                    <button
                      onClick={() => copy(type, kit.content)}
                      className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
                    >
                      {copied === type ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={() => download(type, label, kit.content)}
                      className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
                    >
                      Download
                    </button>
                  </>
                )}
                <button
                  onClick={() => generate(type)}
                  disabled={busy}
                  className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-60"
                >
                  {busy && <Spinner />}
                  {kit ? "Regenerate" : "Generate"}
                </button>
              </div>
            </div>
            {kit && (
              <div className="kit-content max-h-72 overflow-y-auto px-4 py-3 scroll-thin">
                {kit.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
