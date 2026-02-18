"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import type { Beneficiary } from "@/lib/supabaseClient";

type Location = "inside_giki" | "outside_giki";

type Props = {
  location: Location;
  existingCnics: Set<string>;
  onImportDone: (inserted: number, skipped: number) => void;
};

type Row = Record<string, unknown>;

function getStr(row: Row, key: string): string | null {
  const v = row[key];
  if (v == null || v === "") return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function getBool(row: Row, key: string): boolean | null {
  const v = row[key];
  if (v == null || v === "") return null;
  if (typeof v === "boolean") return v;
  const s = String(v).toLowerCase();
  if (s === "true" || s === "yes" || s === "1") return true;
  if (s === "false" || s === "no" || s === "0") return false;
  return null;
}

export default function ExcelImport({
  location,
  existingCnics,
  onImportDone,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const columnAliases: Record<string, string[]> = {
    cnic: ["cnic", "CNIC", "Cnic", "id"],
    name: ["name", "Name", "nama"],
    phone: ["phone", "Phone", "mobile", "contact"],
    designation: ["designation", "Designation", "role", "title"],
    zakaat_eligible: ["zakaat_eligible", "zakaat", "Zakaat", "zakat", "eligible"],
  };

  function findColumnKey(row: Row, aliases: string[]): string | null {
    for (const key of Object.keys(row)) {
      const k = String(key).trim().toLowerCase();
      for (const a of aliases) {
        if (a.toLowerCase() === k) return key;
      }
    }
    return null;
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage(null);
    setUploading(true);
    let inserted = 0;
    let skipped = 0;
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });
      const firstSheet = wb.SheetNames[0];
      const ws = wb.Sheets[firstSheet];
      const rows: Row[] = XLSX.utils.sheet_to_json(ws, { defval: null });
      if (rows.length === 0) {
        setMessage({ type: "info", text: "No rows in the sheet." });
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
      const first = rows[0] as Row;
      const cnicKey =
        findColumnKey(first, columnAliases.cnic) ?? "cnic";
      const nameKey =
        findColumnKey(first, columnAliases.name) ?? "name";
      const phoneKey =
        findColumnKey(first, columnAliases.phone) ?? "phone";
      const designationKey =
        findColumnKey(first, columnAliases.designation) ?? "designation";
      const zakaatKey =
        findColumnKey(first, columnAliases.zakaat_eligible) ?? "zakaat_eligible";

      const { supabase } = await import("@/lib/supabaseClient");
      const toInsert: Array<Omit<Beneficiary, "id" | "created_at">> = [];

      const seenInFile = new Set<string>();
      for (const row of rows) {
        const cnic = getStr(row, cnicKey);
        if (!cnic) continue;
        if (existingCnics.has(cnic) || seenInFile.has(cnic)) {
          skipped++;
          continue;
        }
        seenInFile.add(cnic);
        toInsert.push({
          name: getStr(row, nameKey) ?? null,
          cnic,
          phone: getStr(row, phoneKey) ?? null,
          designation: getStr(row, designationKey) ?? null,
          location,
          zakaat_eligible: getBool(row, zakaatKey) ?? null,
          status: "pending",
        });
      }

      if (toInsert.length > 0) {
        const { error } = await supabase
          .from("beneficiaries")
          .insert(toInsert);
        if (error) {
          setMessage({
            type: "error",
            text: `Insert failed: ${error.message}. Some rows may have been added.`,
          });
        } else {
          inserted = toInsert.length;
        }
      }

      if (!message) {
        setMessage({
          type: "success",
          text: `Imported ${inserted} new, skipped ${skipped} existing.`,
        });
        onImportDone(inserted, skipped);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to parse Excel.",
      });
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFile}
        className="hidden"
        aria-label="Upload Excel file to import beneficiaries"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-2 rounded border border-yellow-400 bg-slate-800 px-4 py-2 text-sm font-medium text-yellow-400 transition hover:bg-slate-700 disabled:opacity-50"
      >
        <Upload className="h-4 w-4" />
        {uploading ? "Importing…" : "Import Excel"}
      </button>
      {message && (
        <span
          className={`text-sm ${
            message.type === "success"
              ? "text-emerald-400"
              : message.type === "error"
                ? "text-red-400"
                : "text-slate-400"
          }`}
        >
          {message.text}
        </span>
      )}
    </div>
  );
}
