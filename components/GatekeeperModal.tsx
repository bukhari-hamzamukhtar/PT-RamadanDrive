"use client";

import { Lock, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function GatekeeperModal() {
  const { unlock } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (unlock(code)) {
      setCode("");
    } else {
      setError("Invalid code. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm rounded-lg border-2 border-yellow-400 bg-slate-900 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-center gap-2 text-yellow-400">
          <Lock className="h-8 w-8" />
          <span className="text-lg font-bold">Project Topi Ration Portal</span>
        </div>
        <p className="mb-4 text-center text-sm text-slate-400">
          Enter the access code to continue.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Access code"
            className="w-full rounded border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
            autoFocus
          />
          {error && (
            <p className="text-center text-sm text-red-400">{error}</p>
          )}
          <button
            type="submit"
            className="w-full rounded bg-yellow-400 px-4 py-2 font-bold text-black transition hover:bg-yellow-300"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
