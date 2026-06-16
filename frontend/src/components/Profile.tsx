import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Profile as ProfileType } from "../types";
import { Spinner } from "./ui";

export default function Profile() {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getProfile().then(setProfile);
  }, []);

  function set<K extends keyof ProfileType>(key: K, value: ProfileType[K]) {
    setProfile((p) => (p ? { ...p, [key]: value } : p));
    setSaved(false);
  }

  async function save() {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await api.saveProfile({
        resume_text: profile.resume_text,
        full_name: profile.full_name,
        email: profile.email,
        min_salary_usd: Number(profile.min_salary_usd),
        levels: profile.levels,
        keywords: profile.keywords,
        locations: profile.locations,
      });
      setProfile(updated);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return (
      <div className="flex justify-center py-16 text-slate-400">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-lg font-bold text-slate-800">Profile &amp; Preferences</h1>
      <p className="mb-5 text-sm text-slate-500">
        Your resume powers the AI kits and the daily match scoring. Preferences
        steer what Discover surfaces.
      </p>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full name">
            <Input value={profile.full_name} onChange={(v) => set("full_name", v)} />
          </Field>
          <Field label="Email (for digest)">
            <Input value={profile.email} onChange={(v) => set("email", v)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Min salary (USD/yr)">
            <Input
              value={String(profile.min_salary_usd)}
              onChange={(v) => set("min_salary_usd", Number(v) || 0)}
            />
          </Field>
          <Field label="Levels (comma-separated)">
            <Input value={profile.levels} onChange={(v) => set("levels", v)} />
          </Field>
        </div>

        <Field label="Work mode / locations">
          <Input value={profile.locations} onChange={(v) => set("locations", v)} />
        </Field>

        <Field label="Keywords / interests (comma-separated)">
          <Input value={profile.keywords} onChange={(v) => set("keywords", v)} />
        </Field>

        <Field label="Resume / background">
          <textarea
            value={profile.resume_text}
            onChange={(e) => set("resume_text", e.target.value)}
            rows={16}
            placeholder="Paste your full resume here…"
            className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs leading-relaxed outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </Field>

        <div className="flex items-center justify-end gap-3">
          {saved && <span className="text-sm text-emerald-600">Saved ✓</span>}
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving && <Spinner />} Save profile
          </button>
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
