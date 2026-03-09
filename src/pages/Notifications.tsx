import React from "react";
import { Button, Card, Panel, Pill } from "../components/ui";

type N = { id: string; title: string; body: string; time: string };

const items: N[] = [
  { id: "n1", title: "Update ready", body: "Endfield received a small hotfix.", time: "Today" },
  { id: "n2", title: "Download completed", body: "Hades II is ready to play.", time: "Today" },
  { id: "n3", title: "Promo", body: "Weekend deals in Store.", time: "Yesterday" },
];

export default function Notifications() {
  return (
    <div className="h-full flex flex-col gap-5">
      <div className="text-sm text-white/65 font-semibold">Notifications</div>

      <Panel className="p-6 grid grid-cols-[1fr_360px] gap-4">
        <div className="space-y-3">
          {items.map(n => (
            <Card key={n.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white/85 font-semibold">{n.title}</div>
                <div className="text-[11px] text-white/45">{n.time}</div>
              </div>
              <div className="text-xs text-white/55 mt-2">{n.body}</div>
              <div className="mt-3 flex gap-2">
                <Button variant="soft">Open</Button>
                <Button variant="ghost">Dismiss</Button>
              </div>
            </Card>
          ))}
        </div>

        <Panel className="p-5">
          <div className="text-sm text-white/75 font-semibold">Pinned</div>
          <div className="mt-3 space-y-3">
            <Card className="p-4">
              <div className="text-xs text-white/45">Status</div>
              <div className="text-sm text-white/80 font-semibold mt-1">All good</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-white/45">Next</div>
              <div className="text-sm text-white/70 mt-1">Add real auth (backend) & disk scanning (Tauri later)</div>
            </Card>
          </div>
        </Panel>
      </Panel>
    </div>
  );
}
