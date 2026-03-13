/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { lsGet, lsSet } from "../lib/storage";

export type Tier = "Free" | "Premium";
export type Provider = "email" | "steam" | "epic" | "Google";

export type User = {
  uid: string;
  name: string;
  provider: Provider;
  email?: string | null;
  avatar?: string | null;
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

  glassIntensity: number;
  motionEnabled: boolean;

  installLocation: string;
  folders: Folder[];

  search: string;
};

export type AppActions = {
  signInProvider: (provider: Provider) => void;
  signInEmail: (email: string) => void;
  signOut: () => void;
  setUser: (user?: User) => void;

  setTier: (tier: Tier) => void;
  setReady: (ready: boolean) => void;
  setOnboardingDone: (done: boolean) => void;
  setGlassIntensity: (val: number) => void;
  setMotionEnabled: (val: boolean) => void;

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

  glassIntensity: 20,
  motionEnabled: true,

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

function normalizeUser(user: unknown): User | null {
  if (!user || typeof user !== "object") {
    return null;
  }

  const candidate = user as Partial<User> & { id?: string };
  const nextUid = candidate.uid ?? candidate.id;

  if (!nextUid || typeof nextUid !== "string") {
    return null;
  }

  return {
    uid: nextUid,
    name: typeof candidate.name === "string" && candidate.name.trim() ? candidate.name : "User",
    provider: (candidate.provider as Provider | undefined) ?? "email",
    email: typeof candidate.email === "string" ? candidate.email : null,
    avatar: typeof candidate.avatar === "string" ? candidate.avatar : null,
  };
}

function normalizeState(state: AppState | null): AppState {
  if (!state) {
    return defaultState;
  }

  return {
    ...defaultState,
    ...state,
    user: normalizeUser(state.user),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const saved = typeof window !== "undefined" ? lsGet<AppState>(KEY) : null;
  const [state, setState] = useState<AppState>(() => normalizeState(saved));

  useEffect(() => {
    lsSet(KEY, state);
  }, [state]);

  const actions: AppActions = useMemo(() => ({
    signInProvider(provider) {
      setState(s => ({
        ...s,
        user: {
          uid: uid(),
          name: "User",
          provider,
          email: null,
          avatar: null,
        },
      }));
    },
    signInEmail(email) {
      setState(s => ({
        ...s,
        user: {
          uid: uid(),
          name: email.split("@")[0] || "User",
          provider: "email",
          email,
          avatar: null,
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
    setUser(user) {
      setState(s => ({
        ...s,
        user: user ?? null,
      }));
    },
    setTier(tier) {
      setState(s => ({ ...s, tier }));
    },
    setReady(ready) {
      setState(s => ({ ...s, onboardingDone: ready }));
    },
    setOnboardingDone(done) {
      setState(s => ({ ...s, onboardingDone: done }));
    },
    setGlassIntensity(val) {
      setState(s => ({ ...s, glassIntensity: val }));
    },
    setMotionEnabled(val) {
      setState(s => ({ ...s, motionEnabled: val }));
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
