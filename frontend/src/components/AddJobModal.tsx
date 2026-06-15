import React, { useState } from "react";
import { api } from "../api";
import { Job } from "../types";
import { Spinner } from "./ui";

type Mode = "url" | "text" | "manual";

export default function AddJobModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: (job: Job) => void;
}) {
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [manual, setManual] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      let job: Job;
      if (mode === "url") {
        if (!url.trim()) throw new Error("Enter a job URL");
        job = await api.addJob({ url: url.trim() });
      } else if (mode === "text") {
        if (!text.trim()) throw new Error("Paste the job description");
        job = await api.addJob({ text: text.trim() });
      } else {
        if (!manual.title.trim()) throw new Error("Title is required");
        job = await api.addJob({ manual });
      }
      onAdded(job);
    } catch (err: any) {
      setError(err.message || "Failed to add job");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Add a job</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1 text-sm">
          {(["url", "text", "manual"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-md py-1.5 font-medium capitalize transition ${
                mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              {m === "url" ? "From URL" : m === "text" ? "Paste text" : "Manual"}
            </button>
          ))}
        </div>

        {mode === "url" && (
          <div>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://company.com/careers/role"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <p className="mt-2 text-xs text-slate-500">
              We'll fetch the page and let Claude extract the details. Some sites
              block scraping — if it fails, use “Paste text”.
            </p>
          </div>
        )}

        {mode === "text" && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Paste the full job description here…"
            className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        )}

        {mode === "manual" && (
          <div className="space-y-2">
            {[
              ["title", "Job title *"],
              ["company", "Company"],
              ["location", "Location"],
              ["salary", "Salary"],
            ].map(([key, label]) => (
              <input
                key={key}
                value={(manual as any)[key]}
                onChange={(e) =>
                  setManual({ ...manual, [key]: e.target.value })
                }
                placeholder={label}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            ))}
            <textarea
              value={manual.description}
              onChange={(e) =>
                setManual({ ...manual, description: e.target.value })
              }
              rows={4}
              placeholder="Description / notes"
              className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        )}

        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading && <Spinner />}
            {mode === "manual" ? "Add card" : "Extract & add"}
          </button>
        </div>
      </div>
    </div>
  );
}
