import React from "react";
import { Button, Card, Panel, Pill } from "../components/ui";
import { useApp } from "../app/store";

export default function Settings() {
  const { state, actions } = useApp();

  return (
    <div className="h-full flex flex-col gap-5">
      <div className="text-sm text-white/65 font-semibold">Settings</div>

      <Panel className="p-6 grid grid-cols-[260px_1fr] gap-4">
        <div className="space-y-2">
          <Card className="p-4">
            <div className="text-xs text-white/45">Account</div>
            <div className="text-sm text-white/80 font-semibold mt-1">{state.user?.name ?? "—"}</div>
            <div className="text-[11px] text-white/45 mt-1">{state.user?.provider ?? "—"}</div>
          </Card>

          <Card className="p-4">
            <div className="text-xs text-white/45">Tier</div>
            <div className="mt-3 flex gap-2">
              <Button variant={state.tier === "Free" ? "primary" : "soft"} onClick={() => actions.setTier("Free")}>Free</Button>
              <Button variant={state.tier === "Premium" ? "primary" : "soft"} onClick={() => actions.setTier("Premium")}>Premium</Button>
            </div>
          </Card>
        </div>

        <Panel className="p-6">
          <div className="text-sm text-white/75 font-semibold">Appearance</div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="text-xs text-white/45">Glass intensity</div>
              <div className="mt-3">
                <input type="range" min={0} max={100} defaultValue={55} className="w-full" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-xs text-white/45">Motion</div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-white/65">Enable subtle animations</span>
                <input type="checkbox" defaultChecked />
              </div>
            </Card>

            <Card className="p-4 col-span-2">
              <div className="text-xs text-white/45">Data</div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-xs text-white/65">Reset demo state (localStorage)</div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    localStorage.removeItem("qf_demo_state_v1");
                    window.location.href = "/auth";
                  }}
                >
                  Reset
                </Button>
              </div>
            </Card>
          </div>
        </Panel>
      </Panel>
    </div>
  );
}
