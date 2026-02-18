"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Beneficiary } from "@/lib/supabaseClient";
import EditBeneficiaryModal from "./EditBeneficiaryModal";

type Location = "inside_giki" | "outside_giki";

type Props = {
  beneficiaries: Beneficiary[];
  onToggleStatus: (id: string, current: "pending" | "done") => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  location: Location;
};

export default function BeneficiaryTable({
  beneficiaries,
  onToggleStatus,
  onDelete,
  onRefresh,
  location,
}: Props) {
  const [editing, setEditing] = useState<Beneficiary | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleRowClick = (e: React.MouseEvent, b: Beneficiary) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    onToggleStatus(b.id, b.status);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this beneficiary?")) return;
    setDeletingId(id);
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      await supabase.from("beneficiaries").delete().eq("id", id);
      onRefresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="table-wrap">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-yellow-400/50">
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-yellow-400">
                Name
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-yellow-400">
                CNIC
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-yellow-400">
                Phone
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-yellow-400">
                Designation
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-yellow-400">
                Zakaat
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-yellow-400">
                Status
              </th>
              <th className="w-24 px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-yellow-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {beneficiaries.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-slate-500"
                >
                  No beneficiaries in this list.
                </td>
              </tr>
            ) : (
              beneficiaries.map((b) => (
                <tr
                  key={b.id}
                  onClick={(e) => handleRowClick(e, b)}
                  className={`cursor-pointer border-b border-slate-700/50 transition hover:opacity-90 ${
                    b.status === "done"
                      ? "bg-emerald-900/50"
                      : "bg-slate-800/50"
                  }`}
                >
                  <td className="px-3 py-2 text-slate-200">
                    {b.name ?? "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-sm text-slate-300">
                    {b.cnic}
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    {b.phone ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    {b.designation ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    {b.zakaat_eligible === true
                      ? "Yes"
                      : b.zakaat_eligible === false
                        ? "No"
                        : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        b.status === "done"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-600 text-slate-300"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing(b);
                        }}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-yellow-400"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(b.id);
                        }}
                        disabled={deletingId === b.id}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-red-400 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditBeneficiaryModal
          beneficiary={editing}
          onClose={() => setEditing(null)}
          onSuccess={() => {
            setEditing(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
