import React from "react";
import { Link } from "react-router-dom";
import { Card, Panel, Pill } from "../components/ui";
import { useApp } from "../app/store";
import { GAMES } from "../data/games";

export default function Search() {
  const { state } = useApp();
  const q = state.search.trim().toLowerCase();
  const items = q ? GAMES.filter(g => g.title.toLowerCase().includes(q)) : GAMES;

  return (
    <div className="h-full flex flex-col gap-5">
      <div className="text-sm text-white/65 font-semibold">Search results</div>

      <Panel className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-xs text-white/45">Query</div>
          <Pill className="text-xs text-white/70">{q || "—"}</Pill>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          {items.map(g => (
            <Link key={g.id} to={"/game/" + g.id} className="block">
              <Card className="p-4 hover:bg-white/[0.10] transition">
                <div className="h-16 rounded-[14px] border border-white/10 bg-white/[0.06]" />
                <div className="mt-3 text-sm text-white/80 font-semibold">{g.title}</div>
                <div className="text-[11px] text-white/45">{g.genre}</div>
              </Card>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
