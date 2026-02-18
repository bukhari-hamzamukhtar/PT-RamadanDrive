"use client";

import { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string | number;
  icon: LucideIcon;
};

export default function StatsCard({ label, value, icon: Icon }: Props) {
  return (
    <div className="rounded-lg border border-yellow-400/50 bg-slate-800/80 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded bg-yellow-400/20 p-2">
          <Icon className="h-5 w-5 text-yellow-400" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="text-xl font-bold text-yellow-400">{value}</p>
        </div>
      </div>
    </div>
  );
}
