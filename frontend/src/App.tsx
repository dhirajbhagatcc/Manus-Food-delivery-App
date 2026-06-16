import React, { useEffect, useState, useCallback } from "react";
import { api, ApiError } from "./api";
import { Job } from "./types";
import Login from "./components/Login";
import Board from "./components/Board";
import Discover from "./components/Discover";
import Profile from "./components/Profile";
import AddJobModal from "./components/AddJobModal";
import CardDrawer from "./components/CardDrawer";
import { Spinner } from "./components/ui";

type Tab = "board" | "discover" | "profile";

export default function App() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("board");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [activeJobId, setActiveJobId] = useState<number | null>(null);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    api
      .me()
      .then((r) => setAuthed(r.authed))
      .catch(() => setAuthed(false));
  }, []);

  const loadJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      setJobs(await api.listJobs());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setAuthed(false);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  const refreshDiscoverCount = useCallback(async () => {
    try {
      const d = await api.listDiscoveries("new");
      setNewCount(d.length);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (authed) {
      loadJobs();
      refreshDiscoverCount();
    }
  }, [authed, loadJobs, refreshDiscoverCount]);

  async function logout() {
    await api.logout();
    setAuthed(false);
  }

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }
  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;

  const activeJob = jobs.find((j) => j.id === activeJobId) || null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <span className="text-xl">🎯</span> ApplyTrack
          </div>
          <nav className="ml-4 flex items-center gap-1">
            <TabButton active={tab === "board"} onClick={() => setTab("board")}>
              Board
            </TabButton>
            <TabButton
              active={tab === "discover"}
              onClick={() => {
                setTab("discover");
                refreshDiscoverCount();
              }}
            >
              Discover
              {newCount > 0 && (
                <span className="ml-1.5 rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {newCount}
                </span>
              )}
            </TabButton>
            <TabButton active={tab === "profile"} onClick={() => setTab("profile")}>
              Profile
            </TabButton>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setAddOpen(true)}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              + Add Job
            </button>
            <button
              onClick={logout}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {tab === "board" && (
          <Board
            jobs={jobs}
            setJobs={setJobs}
            loading={loadingJobs}
            onOpen={(id) => setActiveJobId(id)}
            onAdd={() => setAddOpen(true)}
          />
        )}
        {tab === "discover" && (
          <Discover
            onAdded={() => {
              loadJobs();
              refreshDiscoverCount();
            }}
            onCountChange={setNewCount}
          />
        )}
        {tab === "profile" && <Profile />}
      </main>

      {addOpen && (
        <AddJobModal
          onClose={() => setAddOpen(false)}
          onAdded={(job) => {
            setJobs((prev) => [...prev, job]);
            setAddOpen(false);
            setActiveJobId(job.id);
          }}
        />
      )}

      {activeJob && (
        <CardDrawer
          job={activeJob}
          onClose={() => setActiveJobId(null)}
          onUpdated={(updated) =>
            setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)))
          }
          onDeleted={(id) => {
            setJobs((prev) => prev.filter((j) => j.id !== id));
            setActiveJobId(null);
          }}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-slate-100 text-slate-900"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}
