import React from "react";
import { Card, Panel, Skeleton, Button } from "../components/ui";

export default function States() {
  return (
    <div className="h-full flex flex-col gap-5">
      <div className="text-sm text-white/65 font-semibold">Empty • Loading • Error</div>

      <Panel className="p-6 grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-white/80 font-semibold">Empty</div>
          <div className="text-xs text-white/45 mt-2">No items yet.</div>
          <div className="mt-4">
            <Button variant="soft">Add</Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-white/80 font-semibold">Loading</div>
          <div className="mt-3 space-y-2">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-white/80 font-semibold">Error</div>
          <div className="text-xs text-white/45 mt-2">Server unavailable.</div>
          <div className="mt-4 flex gap-2">
            <Button variant="primary">Retry</Button>
            <Button variant="ghost">Details</Button>
          </div>
        </Card>
      </Panel>
    </div>
  );
}
