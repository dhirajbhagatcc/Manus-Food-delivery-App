import { Job, JobStatus, Kit, Profile, Discovery } from "./types";

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "same-origin",
  });
  if (res.status === 401) {
    throw new ApiError("Unauthorized", 401);
  }
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      /* ignore */
    }
    throw new ApiError(msg, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const api = {
  // auth
  me: () => req<{ authed: boolean }>("/auth/me"),
  login: (password: string) =>
    req<{ ok: boolean }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
  logout: () => req<{ ok: boolean }>("/auth/logout", { method: "POST" }),

  // jobs
  listJobs: () => req<Job[]>("/jobs"),
  addJob: (payload: {
    url?: string;
    text?: string;
    manual?: Partial<Job>;
  }) => req<Job>("/jobs", { method: "POST", body: JSON.stringify(payload) }),
  updateJob: (id: number, patch: Partial<Job>) =>
    req<Job>(`/jobs/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  reorder: (items: { id: number; status: JobStatus; position: number }[]) =>
    req<Job[]>("/jobs/reorder", {
      method: "POST",
      body: JSON.stringify({ items }),
    }),
  deleteJob: (id: number) =>
    req<{ ok: boolean }>(`/jobs/${id}`, { method: "DELETE" }),

  // kits
  listKits: (jobId: number) => req<Kit[]>(`/jobs/${jobId}/kit`),
  generateKit: (jobId: number, type: string) =>
    req<Kit[]>(`/jobs/${jobId}/kit`, {
      method: "POST",
      body: JSON.stringify({ type }),
    }),

  // profile
  getProfile: () => req<Profile>("/profile"),
  saveProfile: (patch: Partial<Profile>) =>
    req<Profile>("/profile", { method: "PUT", body: JSON.stringify(patch) }),

  // discover
  listDiscoveries: (state = "new") =>
    req<Discovery[]>(`/discover?state=${state}`),
  runDiscovery: () => req<any>("/discover/run", { method: "POST" }),
  addDiscovery: (id: number) =>
    req<Job>(`/discover/${id}/add`, { method: "POST" }),
  dismissDiscovery: (id: number) =>
    req<{ ok: boolean }>(`/discover/${id}/dismiss`, { method: "POST" }),
};
