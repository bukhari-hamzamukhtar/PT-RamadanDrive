"use client";

import { X } from "lucide-react";
import { useState } from "react";
import type { Beneficiary } from "@/lib/supabaseClient";

type Location = "inside_giki" | "outside_giki";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  location: Location;
  existingCnicError: string | null;
  onClearCnicError: () => void;
};

const emptyForm = {
  name: "",
  cnic: "",
  phone: "",
  designation: "",
  zakaat_eligible: "" as "" | "true" | "false",
};

export default function AddBeneficiaryModal({
  isOpen,
  onClose,
  onSuccess,
  location,
  existingCnicError,
  onClearCnicError,
}: Props) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "cnic") onClearCnicError();
    setSubmitError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const cnic = form.cnic.trim();
    if (!cnic) {
      setSubmitError("CNIC is required.");
      return;
    }
    setSubmitting(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const { error } = await supabase.from("beneficiaries").insert({
        name: form.name.trim() || null,
        cnic,
        phone: form.phone.trim() || null,
        designation: form.designation.trim() || null,
        location,
        zakaat_eligible:
          form.zakaat_eligible === ""
            ? null
            : form.zakaat_eligible === "true",
        status: "pending",
      });
      if (error) {
        if (error.code === "23505") {
          setSubmitError("Lala already exists in the database.");
        } else {
          setSubmitError(error.message || "Failed to add.");
        }
        setSubmitting(false);
        return;
      }
      setForm(emptyForm);
      onSuccess();
      onClose();
    } catch (err) {
      setSubmitError("Something went wrong.");
    }
    setSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border-2 border-yellow-400 bg-slate-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-yellow-400">Add Lala</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">CNIC *</label>
            <input
              name="cnic"
              value={form.cnic}
              onChange={handleChange}
              required
              className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-yellow-400 focus:outline-none"
              placeholder="e.g. 35202-1234567-1"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-yellow-400 focus:outline-none"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-yellow-400 focus:outline-none"
              placeholder="Phone number"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Designation
            </label>
            <input
              name="designation"
              value={form.designation}
              onChange={handleChange}
              className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-yellow-400 focus:outline-none"
              placeholder="Designation"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Zakaat eligible
            </label>
            <select
              name="zakaat_eligible"
              value={form.zakaat_eligible}
              onChange={handleChange}
              className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-yellow-400 focus:outline-none"
            >
              <option value="">—</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          {(existingCnicError || submitError) && (
            <p className="text-sm text-red-400">
              {existingCnicError || submitError}
            </p>
          )}
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
              {submitting ? "Adding…" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
