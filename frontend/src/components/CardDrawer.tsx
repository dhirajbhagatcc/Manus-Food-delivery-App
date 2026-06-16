import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Job, JobStatus, COLUMNS } from "../types";
import { ScoreBadge, Spinner } from "./ui";
import KitPanel from "./KitPanel";

interface Props {
  job: Job;
  onClose: () => void;
  onUpdated: (job: Job) => void;
  onDeleted: (id: number) => void;
}

export default function CardDrawer({ job, onClose, onUpdated, onDeleted }: Props) {
  const [tab, setTab] = useState<"details" | "kit">("details");
  const [form, setForm] = useState(job);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setForm(job);
    setDirty(false);
  }, [job.id]);

  function set<K extends keyof Job>(key: K, value: Job[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      const updated = await api.updateJob(job.id, {
        title: form.title,
        company: form.company,
        location: form.location,
        salary: form.salary,
        status: form.status,
        description: form.description,
        notes: form.notes,
      });
      onUpdated(updated);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this job and its generated kit?")) return;
    await api.deleteJob(job.id);
    onDeleted(job.id);
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-slate-900/30" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
          <div className="min-w-0">
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full truncate rounded-md text-lg font-bold text-slate-800 outline-none hover:bg-slate-50 focus:bg-slate-50 focus:px-2"
            />
            <p className="mt-0.5 text-sm text-slate-500">
              {form.company || "Unknown company"}
              {form.location ? ` · ${form.location}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              <ScoreBadge label="Match" value={form.match_score} />
              <ScoreBadge label="AI-driven" value={form.ai_driven_score} />
              <ScoreBadge label="AI-resist" value={form.ai_resist_score} />
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 px-5">
          {(["details", "kit"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                tab === t
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "details" ? "Details" : "✨ Generate Kit"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 scroll-thin">
          {tab === "details" ? (
            <div className="space-y-4">
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value as JobStatus)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {COLUMNS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Company">
                  <Input value={form.company} onChange={(v) => set("company", v)} />
                </Field>
                <Field label="Location">
                  <Input
                    value={form.location || ""}
                    onChange={(v) => set("location", v)}
                  />
                </Field>
              </div>
              <Field label="Salary">
                <Input value={form.salary || ""} onChange={(v) => set("salary", v)} />
              </Field>
              {form.source_url && (
                <Field label="Source">
                  <a
                    href={form.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-sm text-indigo-600 hover:underline"
                  >
                    {form.source_url}
                  </a>
                </Field>
              )}
              <Field label="Description">
                <textarea
                  value={form.description || ""}
                  onChange={(e) => set("description", e.target.value)}
                  rows={6}
                  className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Notes">
                <textarea
                  value={form.notes || ""}
                  onChange={(e) => set("notes", e.target.value)}
                  rows={3}
                  placeholder="Recruiter name, referral, follow-up dates…"
                  className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </Field>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={remove}
                  className="rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </button>
                <button
                  onClick={save}
                  disabled={!dirty || saving}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving && <Spinner />} Save changes
                </button>
              </div>
            </div>
          ) : (
            <KitPanel job={job} />
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
    />
  );
}
