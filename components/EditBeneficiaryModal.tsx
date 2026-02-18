"use client";

import { X } from "lucide-react";
import { useState } from "react";
import type { Beneficiary } from "@/lib/supabaseClient";

type Props = {
  beneficiary: Beneficiary;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditBeneficiaryModal({
  beneficiary,
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState(beneficiary.name ?? "");
  const [phone, setPhone] = useState(beneficiary.phone ?? "");
  const [designation, setDesignation] = useState(
    beneficiary.designation ?? ""
  );
  const [zakaat_eligible, setZakaatEligible] = useState<
    "" | "true" | "false"
  >(
    beneficiary.zakaat_eligible === true
      ? "true"
      : beneficiary.zakaat_eligible === false
        ? "false"
        : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const { error: err } = await supabase
        .from("beneficiaries")
        .update({
          name: name.trim() || null,
          phone: phone.trim() || null,
          designation: designation.trim() || null,
          zakaat_eligible:
            zakaat_eligible === ""
              ? null
              : zakaat_eligible === "true",
        })
        .eq("id", beneficiary.id);
      if (err) {
        setError(err.message || "Update failed.");
        setSubmitting(false);
        return;
      }
      onSuccess();
      onClose();
    } catch {
      setError("Something went wrong.");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border-2 border-yellow-400 bg-slate-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-yellow-400">Edit Lala</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 font-mono text-sm text-slate-500">
          CNIC: {beneficiary.cnic} (cannot be changed)
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-yellow-400 focus:outline-none"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-yellow-400 focus:outline-none"
              placeholder="Phone number"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Designation
            </label>
            <input
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-yellow-400 focus:outline-none"
              placeholder="Designation"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Zakaat eligible
            </label>
            <select
              value={zakaat_eligible}
              onChange={(e) =>
                setZakaatEligible(e.target.value as "" | "true" | "false")
              }
              className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-yellow-400 focus:outline-none"
            >
              <option value="">—</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded border border-slate-600 py-2 font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded bg-yellow-400 py-2 font-bold text-black transition hover:bg-yellow-300 disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
