"use client";

import { LogOut, Package, UserPlus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AddBeneficiaryModal from "@/components/AddBeneficiaryModal";
import BeneficiaryTable from "@/components/BeneficiaryTable";
import ExcelImport from "@/components/ExcelImport";
import GatekeeperModal from "@/components/GatekeeperModal";
import StatsCard from "@/components/StatsCard";
import type { Beneficiary } from "@/lib/supabaseClient";
import { supabase } from "@/lib/supabaseClient";

type Location = "inside_giki" | "outside_giki";
type FilterKind = "all" | "zakaat_only" | "pending_only" | "done_only";

function useBeneficiaries(location: Location) {
  const [list, setList] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(() => {
    setLoading(true);
    supabase
      .from("beneficiaries")
      .select("*")
      .eq("location", location)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          setList([]);
        } else {
          setList((data as Beneficiary[]) ?? []);
        }
        setLoading(false);
      });
  }, [location]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return { list, loading, refresh: fetchList };
}

function useAllCnics(refreshDeps: unknown[]) {
  const [cnics, setCnics] = useState<Set<string>>(new Set());
  const refresh = useCallback(() => {
    supabase
      .from("beneficiaries")
      .select("cnic")
      .then(({ data }) => {
        const set = new Set<string>();
        (data ?? []).forEach((r: { cnic: string }) => r.cnic && set.add(r.cnic));
        setCnics(set);
      });
  }, []);
  useEffect(() => {
    refresh();
  }, refreshDeps);
  return { cnics, refreshCnics: refresh };
}

function PortalContent() {
  const { lock } = useAuth();
  const [tab, setTab] = useState<Location>("inside_giki");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKind>("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [existingCnicError, setExistingCnicError] = useState<string | null>(null);

  const { list, loading, refresh } = useBeneficiaries(tab);
  const { cnics: allCnics, refreshCnics } = useAllCnics([tab, list.length]);

  const filtered = useMemo(() => {
    let out = list;
    const q = search.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (b) =>
          (b.name ?? "").toLowerCase().includes(q) ||
          (b.cnic ?? "").toLowerCase().includes(q)
      );
    }
    if (filter === "zakaat_only")
      out = out.filter((b) => b.zakaat_eligible === true);
    if (filter === "pending_only") out = out.filter((b) => b.status === "pending");
    if (filter === "done_only") out = out.filter((b) => b.status === "done");
    return out;
  }, [list, search, filter]);

  const stats = useMemo(() => {
    const total = list.length;
    const done = list.filter((b) => b.status === "done").length;
    const pending = total - done;
    const zakaat = list.filter((b) => b.zakaat_eligible === true).length;
    return { total, done, pending, zakaat };
  }, [list]);

  const existingCnics = allCnics;

  const handleToggleStatus = useCallback(
    async (id: string, current: "pending" | "done") => {
      const next = current === "pending" ? "done" : "pending";
      await supabase
        .from("beneficiaries")
        .update({ status: next })
        .eq("id", id);
      refresh();
    },
    [refresh]
  );

  const handleImportDone = useCallback(() => {
    refreshCnics();
    refresh();
  }, [refresh, refreshCnics]);

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="sticky top-0 z-30 border-b border-yellow-400/50 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <h1 className="text-xl font-bold tracking-tight text-yellow-400">
            Project Topi Ration Portal
          </h1>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                lock();
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 rounded border border-slate-600 px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              <LogOut className="h-4 w-4" />
              Lock
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-700 pb-4">
          <button
            type="button"
            onClick={() => setTab("inside_giki")}
            className={`rounded px-4 py-2 font-bold transition ${
              tab === "inside_giki"
                ? "bg-yellow-400 text-black"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Lalas Inside GIKI
          </button>
          <button
            type="button"
            onClick={() => setTab("outside_giki")}
            className={`rounded px-4 py-2 font-bold transition ${
              tab === "outside_giki"
                ? "bg-yellow-400 text-black"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Lalas Outside GIKI
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard label="Total" value={stats.total} icon={Package} />
          <StatsCard label="Pending" value={stats.pending} icon={Package} />
          <StatsCard label="Done" value={stats.done} icon={Package} />
          <StatsCard label="Zakaat eligible" value={stats.zakaat} icon={Package} />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or CNIC…"
            className="max-w-xs rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-yellow-400 focus:outline-none"
          />
          <select
            aria-label="Filter list"
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterKind)}
            className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-yellow-400 focus:outline-none"
          >
            <option value="all">Show All</option>
            <option value="zakaat_only">Zakaat Only</option>
            <option value="pending_only">Pending Only</option>
            <option value="done_only">Done Only</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setExistingCnicError(null);
              setAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded bg-yellow-400 px-4 py-2 font-bold text-black transition hover:bg-yellow-300"
          >
            <UserPlus className="h-4 w-4" />
            Add Lala
          </button>
          <ExcelImport
            location={tab}
            existingCnics={existingCnics}
            onImportDone={handleImportDone}
          />
        </div>

        {loading ? (
          <p className="py-8 text-center text-slate-500">Loading…</p>
        ) : (
          <BeneficiaryTable
            beneficiaries={filtered}
            onToggleStatus={handleToggleStatus}
            onDelete={() => refresh()}
            onRefresh={refresh}
            location={tab}
          />
        )}
      </main>

      <AddBeneficiaryModal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setExistingCnicError(null);
        }}
        onSuccess={() => {
          refreshCnics();
          refresh();
        }}
        location={tab}
        existingCnicError={existingCnicError}
        onClearCnicError={() => setExistingCnicError(null)}
      />
    </div>
  );
}

export default function Home() {
  const { isUnlocked } = useAuth();

  return (
    <>
      {!isUnlocked && (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4">
          <div className="max-w-md text-center">
            <h1 className="mb-2 text-2xl font-bold text-yellow-400">
              Project Topi Ration Portal
            </h1>
            <p className="text-slate-400">
              Manage ration distribution for Lalas. Enter the access code to
              continue.
            </p>
          </div>
          <GatekeeperModal />
        </div>
      )}
      {isUnlocked && <PortalContent />}
    </>
  );
}
