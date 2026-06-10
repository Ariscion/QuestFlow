import { create } from "zustand";

export type Tier = "Free" | "Premium";

export type Folder = {
  id: string;
  path: string;
  enabled: boolean;
};

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export type AppState = {
  tier: Tier;
  motionEnabled: boolean;
  installLocation: string;
  folders: Folder[];
  search: string;
  deferredPrompt: BeforeInstallPromptEvent | null;
};

export type AppActions = {
  setTier: (tier: Tier) => void;
  setMotionEnabled: (val: boolean) => void;
  setInstallLocation: (path: string) => void;
  toggleFolder: (id: string) => void;
  setSearch: (q: string) => void;
  setDeferredPrompt: (prompt: BeforeInstallPromptEvent | null) => void;
};

export const useAppStore = create<AppState & AppActions>((set) => ({
  tier: "Free",
  motionEnabled: true,
  installLocation: "D:\\Games\\VELO Library",
  folders: [
    { id: "steam", path: "D:\\SteamLibrary", enabled: true },
    { id: "eg", path: "E:\\Games", enabled: true },
    { id: "epic", path: "C:\\Program Files (x86)\\Epic Games", enabled: true },
  ],
  search: "",
  deferredPrompt: null,

  setTier: (tier) => set({ tier }),
  setMotionEnabled: (motionEnabled) => set({ motionEnabled }),
  setInstallLocation: (installLocation) => set({ installLocation }),
  toggleFolder: (id) => set((state) => ({
    folders: state.folders.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)),
  })),
  setSearch: (search) => set({ search }),
  setDeferredPrompt: (deferredPrompt) => set({ deferredPrompt }),
}));
