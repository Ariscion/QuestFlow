import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { lsGet, lsSet } from "../lib/storage";

export type Tier = "Free" | "Premium";
export type Provider = "email" | "steam" | "epic";

export type User = {
  id: string;
  name: string;
  provider: Provider;
  email?: string;
};

export type Folder = {
  id: string;
  path: string;
  enabled: boolean;
};

export type AppState = {
  user: User | null;
  tier: Tier;
  onboardingDone: boolean;

  installLocation: string;
  folders: Folder[];

  search: string;
};

export type AppActions = {
  signInProvider: (provider: Provider) => void;
  signInEmail: (email: string) => void;
  signOut: () => void;

  setTier: (tier: Tier) => void;
  setOnboardingDone: (done: boolean) => void;

  setInstallLocation: (path: string) => void;
  toggleFolder: (id: string) => void;

  setSearch: (q: string) => void;
};

type Ctx = { state: AppState; actions: AppActions };

const KEY = "qf_demo_state_v1";

const defaultState: AppState = {
  user: null,
  tier: "Free",
  onboardingDone: false,

  installLocation: "D:\\Games\\QuestFlow Library",
  folders: [
    { id: "steam", path: "D:\\SteamLibrary", enabled: true },
    { id: "eg", path: "E:\\Games", enabled: true },
    { id: "epic", path: "C:\\Program Files (x86)\\Epic Games", enabled: true },
  ],

  search: "",
};

const AppContext = createContext<Ctx | null>(null);

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const saved = typeof window !== "undefined" ? lsGet<AppState>(KEY) : null;
  const [state, setState] = useState<AppState>(saved ?? defaultState);

  useEffect(() => {
    lsSet(KEY, state);
  }, [state]);

  const actions: AppActions = useMemo(() => ({
    signInProvider(provider) {
      setState(s => ({
        ...s,
        user: {
          id: uid(),
          name: "User",
          provider,
        },
      }));
    },
    signInEmail(email) {
      setState(s => ({
        ...s,
        user: {
          id: uid(),
          name: email.split("@")[0] || "User",
          provider: "email",
          email,
        },
      }));
    },
    signOut() {
      setState(s => ({
        ...s,
        user: null,
        onboardingDone: false,
      }));
    },
    setTier(tier) {
      setState(s => ({ ...s, tier }));
    },
    setOnboardingDone(done) {
      setState(s => ({ ...s, onboardingDone: done }));
    },
    setInstallLocation(path) {
      setState(s => ({ ...s, installLocation: path }));
    },
    toggleFolder(id) {
      setState(s => ({
        ...s,
        folders: s.folders.map(f => (f.id === id ? { ...f, enabled: !f.enabled } : f)),
      }));
    },
    setSearch(q) {
      setState(s => ({ ...s, search: q }));
    },
  }), []);

  return <AppContext.Provider value={{ state, actions }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export function useIsAuthed() {
  const { state } = useApp();
  return Boolean(state.user);
}

export function useIsReady() {
  const { state } = useApp();
  return Boolean(state.user) && state.onboardingDone;
}
