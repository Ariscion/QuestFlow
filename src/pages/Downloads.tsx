import React from "react";
import { Button, Card, Panel, Progress } from "../components/ui";
import { cn } from "../lib/cn";

type Dl = { id: string; title: string; sizeMb: number; speedMb: number; progress: number; state: "downloading" | "paused" | "done" };

const initial: Dl[] = [
  { id: "d1", title: "Detroit: Become Human", sizeMb: 56000, speedMb: 32.5, progress: 32, state: "downloading" },
  { id: "d2", title: "Satisfactory", sizeMb: 18200, speedMb: 18.1, progress: 64, state: "paused" },
  { id: "d3", title: "Hades II", sizeMb: 12700, speedMb: 0, progress: 100, state: "done" },
];

export default function Downloads() {
  const [items, setItems] = React.useState<Dl[]>(initial);

  React.useEffect(() => {
    const t = setInterval(() => {
      setItems(prev =>
        prev.map(it => {
          if (it.state !== "downloading") return it;
          const add = Math.max(0.2, it.speedMb / 50);
          const next = Math.min(100, it.progress + add);
          return { ...it, progress: next, state: next >= 100 ? "done" : "downloading" };
        })
      );
    }, 500);
    return () => clearInterval(t);
  }, []);

  function toggle(id: string) {
    setItems(prev => prev.map(it => {
      if (it.id !== id) return it;
      if (it.state === "done") return it;
      return { ...it, state: it.state === "paused" ? "downloading" : "paused" };
    }));
  }

  return (
    <div className="h-full flex flex-col gap-5">
      <div className="text-sm text-white/65 font-semibold">Downloads</div>

      <Panel className="p-6">
        <div className="space-y-4">
          {items.map(it => (
            <Card key={it.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-white/85 font-semibold">{it.title}</div>
                  <div className="text-[11px] text-white/45 mt-1">
                    {it.state === "done" ? "Completed" : it.state === "paused" ? "Paused" : `${it.speedMb.toFixed(1)} MB/s`}
                  </div>
                </div>

                <Button
                  variant={it.state === "paused" ? "primary" : "soft"}
                  onClick={() => toggle(it.id)}
                  disabled={it.state === "done"}
                >
                  {it.state === "paused" ? "Resume" : it.state === "downloading" ? "Pause" : "Done"}
                </Button>
              </div>

              <div className="mt-3">
                <Progress value={it.progress} />
                <div className="mt-2 flex justify-between text-[11px] text-white/45">
                  <span>{Math.round(it.progress)}%</span>
                  <span>{(it.sizeMb/1024).toFixed(1)} GB</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Panel>
    </div>
  );
}
