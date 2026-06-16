import React, { useState } from "react";
import { api } from "../api";
import { Spinner } from "./ui";

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.login(password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-100"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-2xl">
            🎯
          </div>
          <h1 className="text-xl font-bold text-slate-800">ApplyTrack</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your job pipeline &amp; daily remote matches
          </p>
        </div>
        <label className="mb-1 block text-sm font-medium text-slate-600">
          Password
        </label>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          placeholder="Enter your password"
        />
        {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading && <Spinner />} Sign in
        </button>
      </form>
    </div>
  );
}
