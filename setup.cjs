const fs = require("fs");
const path = require("path");

const root = process.cwd();
const pkgPath = path.join(root, "package.json");
if (!fs.existsSync(pkgPath)) {
  console.error("ОШИБКА: Запусти этот скрипт из корня Vite-проекта (там где лежит package.json).");
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const isESM = pkg && pkg.type === "module";

function pad2(n) { return String(n).padStart(2, "0"); }
function stamp() {
  const d = new Date();
  return (
    d.getFullYear() +
    pad2(d.getMonth() + 1) +
    pad2(d.getDate()) +
    "-" +
    pad2(d.getHours()) +
    pad2(d.getMinutes()) +
    pad2(d.getSeconds())
  );
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function backupIfExists(fileAbs) {
  if (!fs.existsSync(fileAbs)) return;
  const bak = fileAbs + ".bak-" + stamp();
  fs.copyFileSync(fileAbs, bak);
}

function writeFile(rel, content) {
  const abs = path.join(root, rel);
  ensureDir(path.dirname(abs));
  backupIfExists(abs);
  fs.writeFileSync(abs, content.replace(/\r?\n/g, "\n"), "utf8");
  console.log("✔ wrote", rel);
}

function writeConfigFiles() {
  // Tailwind v4: PostCSS plugin "@tailwindcss/postcss"
  // Docs recommend @import "tailwindcss"; in CSS entry.
  const postcssESM = `export default {\n  plugins: {\n    "@tailwindcss/postcss": {},\n  },\n};\n`;
  const postcssCJS = `module.exports = {\n  plugins: {\n    "@tailwindcss/postcss": {},\n  },\n};\n`;

  // Content globs — безопасно и для v4 (даже если авто-детект включен)
  const twESM =
`/** @type {import("tailwindcss").Config} */\nexport default {\n  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],\n  theme: { extend: {} },\n  plugins: [],\n};\n`;
  const twCJS =
`/** @type {import("tailwindcss").Config} */\nmodule.exports = {\n  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],\n  theme: { extend: {} },\n  plugins: [],\n};\n`;

  writeFile("postcss.config.js", isESM ? postcssESM : postcssCJS);
  writeFile("tailwind.config.js", isESM ? twESM : twCJS);
}

function writeCss() {
  const css =
`@import "tailwindcss";

/* QF tokens */
:root{
  color-scheme: dark;
  --qf-bg0:#050a11;
  --qf-bg1:#071623;

  --qf-panel: rgba(255,255,255,0.055);
  --qf-panel2: rgba(255,255,255,0.075);

  --qf-border: rgba(255,255,255,0.10);
  --qf-border2: rgba(255,255,255,0.14);

  --qf-text: rgba(255,255,255,0.86);
  --qf-muted: rgba(255,255,255,0.55);
}

*{ box-sizing:border-box; }
html,body,#root{ height:100%; }

body{
  margin:0;
  background:
    radial-gradient(1200px 700px at 70% 30%, rgba(80,140,170,0.25), transparent 55%),
    radial-gradient(900px 650px at 25% 80%, rgba(50,100,140,0.22), transparent 60%),
    linear-gradient(180deg, var(--qf-bg0), var(--qf-bg1));
  color:var(--qf-text);
  font-family: system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;
}

@layer components{
  .qf-frame{
    @apply border border-white/10 bg-white/[0.05] rounded-[30px] overflow-hidden;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.12),
      inset 0 -30px 70px rgba(0,0,0,0.24);
    backdrop-filter: blur(18px);
  }

  .qf-panel{
    @apply rounded-[24px] border border-white/10 bg-[color:var(--qf-panel)];
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.10),
      inset 0 -18px 40px rgba(0,0,0,0.20);
    backdrop-filter: blur(16px);
  }

  .qf-card{
    @apply rounded-[18px] border border-white/10 bg-[color:var(--qf-panel2)];
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
  }

  .qf-pill{
    @apply rounded-full border border-white/10 bg-white/[0.08] px-4 py-2;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
  }

  .qf-btn{
    @apply h-10 rounded-[18px] border border-white/10 px-5 text-sm font-semibold transition select-none;
  }
  .qf-btn-primary{ @apply bg-white/10 hover:bg-white/[0.14] text-white/[0.88]; }
  .qf-btn-soft{ @apply bg-white/[0.08] hover:bg-white/[0.12] text-white/[0.82]; }
  .qf-btn-ghost{ @apply bg-transparent hover:bg-white/[0.06] text-white/[0.65]; }

  .qf-input{
    @apply w-full rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white/[0.88] placeholder:text-white/[0.35] outline-none;
  }
  .qf-input:focus{ box-shadow: 0 0 0 2px rgba(255,255,255,0.10); }

  .qf-progress{
    @apply h-2 rounded-full bg-white/[0.10] overflow-hidden border border-white/10;
  }
  .qf-progress > div{
    @apply h-full rounded-full;
    background: rgba(255,255,255,0.35);
  }

  .qf-skel{
    @apply rounded-[14px] border border-white/10 bg-white/[0.06] relative overflow-hidden;
  }
  .qf-skel::after{
    content:"";
    position:absolute; inset:0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent);
    transform: translateX(-60%);
    animation: qfsh 1.2s infinite;
  }
  @keyframes qfsh { to { transform: translateX(60%); } }
}
`;
  writeFile("src/index.css", css);
}

function writeLib() {
  writeFile("src/lib/cn.ts",
`import clsx from "clsx";

export function cn(...args: Array<string | undefined | false | null>) {
  return clsx(args);
}
`);
  writeFile("src/lib/storage.ts",
`export function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export function lsGet<T>(key: string): T | null {
  return safeJsonParse<T>(localStorage.getItem(key));
}

export function lsSet<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
`);
}

function writeData() {
  writeFile("src/data/games.ts",
`export type Game = {
  id: string;
  title: string;
  studio: string;
  genre: string;
  tagline: string;
  playtimeMin: number;
  lastPlayedLabel: string;
  installed: boolean;
  sizeGb: number;
  installPath: string;
};

export const GAMES: Game[] = [
  {
    id: "detroit",
    title: "Detroit: Become Human",
    studio: "Quantic Dream",
    genre: "Story • Sci‑Fi",
    tagline: "Continue your story",
    playtimeMin: 2 * 60 + 13,
    lastPlayedLabel: "Today",
    installed: true,
    sizeGb: 56.4,
    installPath: "D:\\\\Games\\\\Detroit",
  },
  {
    id: "satisfactory",
    title: "Satisfactory",
    studio: "Coffee Stain Studios",
    genre: "Factory • Sandbox",
    tagline: "Build bigger",
    playtimeMin: 48,
    lastPlayedLabel: "Today",
    installed: true,
    sizeGb: 18.2,
    installPath: "D:\\\\SteamLibrary\\\\steamapps\\\\common\\\\Satisfactory",
  },
  {
    id: "hades2",
    title: "Hades II",
    studio: "Supergiant Games",
    genre: "Roguelike • Action",
    tagline: "A new underworld run",
    playtimeMin: 31,
    lastPlayedLabel: "Today",
    installed: true,
    sizeGb: 12.7,
    installPath: "E:\\\\Games\\\\Hades2",
  },
  {
    id: "cyberpunk",
    title: "Cyberpunk 2077",
    studio: "CD PROJEKT RED",
    genre: "RPG • Open World",
    tagline: "Night City awaits",
    playtimeMin: 95,
    lastPlayedLabel: "Today",
    installed: false,
    sizeGb: 69.9,
    installPath: "C:\\\\Program Files (x86)\\\\Epic Games\\\\Cyberpunk2077",
  },
];

export function findGame(id: string) {
  return GAMES.find(g => g.id === id) ?? GAMES[0];
}

export function formatPlaytime(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h <= 0) return \`\${m}m\`;
  return \`\${h}h \${m}m\`;
}
`);
}

function writeStore() {
  writeFile("src/app/store.tsx",
`import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
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

  installLocation: "D:\\\\Games\\\\QuestFlow Library",
  folders: [
    { id: "steam", path: "D:\\\\SteamLibrary", enabled: true },
    { id: "eg", path: "E:\\\\Games", enabled: true },
    { id: "epic", path: "C:\\\\Program Files (x86)\\\\Epic Games", enabled: true },
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
`);
}

function writeUIComponents() {
  writeFile("src/components/ui.tsx",
`import React from "react";
import { cn } from "../lib/cn";

export function Panel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("qf-panel", className)} {...props} />;
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("qf-card", className)} {...props} />;
}

export function Pill({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("qf-pill", className)} {...props} />;
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "soft" | "ghost" };

export function Button({ className, variant = "soft", ...props }: BtnProps) {
  const v =
    variant === "primary" ? "qf-btn qf-btn-primary" :
    variant === "ghost" ? "qf-btn qf-btn-ghost" :
    "qf-btn qf-btn-soft";
  return <button className={cn(v, className)} {...props} />;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="qf-input" {...props} />;
}

export function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="qf-progress">
      <div style={{ width: v + "%" }} />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("qf-skel", className)} />;
}
`);
}

function writeLayout() {
  writeFile("src/components/icons.tsx",
`import React from "react";

type Props = { className?: string };

export function IconHome({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}

export function IconStore({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16l-1.2 12.5A1.5 1.5 0 0 1 17.3 21H6.7a1.5 1.5 0 0 1-1.5-1.5L4 7Z" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M8 10V6a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}

export function IconDownloads({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 3v10" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M8 10l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M5 20h14" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}

export function IconBell({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M6 9a6 6 0 0 1 12 0v5l2 2H4l2-2V9Z" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}

export function IconSettings({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M19.4 15a8.9 8.9 0 0 0 .1-2l2-1.2-2-3.4-2.3.7a8.8 8.8 0 0 0-1.7-1L14.9 5h-3.8l-.6 2.1a8.8 8.8 0 0 0-1.7 1L6.5 7.4l-2 3.4 2 1.2a8.9 8.9 0 0 0 .1 2l-2 1.2 2 3.4 2.3-.7a8.8 8.8 0 0 0 1.7 1l.6 2.1h3.8l.6-2.1a8.8 8.8 0 0 0 1.7-1l2.3.7 2-3.4-2-1.2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}
`);

  writeFile("src/components/Layout.tsx",
`import React from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useApp, useIsAuthed, useIsReady } from "../app/store";
import { IconBell, IconDownloads, IconHome, IconSettings, IconStore } from "./icons";
import { cn } from "../lib/cn";

function RailItem({ to, icon, disabled }: { to: string; icon: React.ReactNode; disabled?: boolean }) {
  const base = "w-10 h-10 rounded-[14px] border border-white/10 bg-white/[0.05] flex items-center justify-center";
  if (disabled) return <div className={cn(base, "opacity-40")}>{icon}</div>;
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(base, isActive ? "bg-white/[0.10] border-white/[0.18]" : "hover:bg-white/[0.08]")
      }
    >
      {icon}
    </NavLink>
  );
}

export default function Layout() {
  const { state, actions } = useApp();
  const isAuthed = useIsAuthed();
  const isReady = useIsReady();
  const nav = useNavigate();
  const loc = useLocation();

  // Guard: если не авторизован или не прошёл onboarding — отправляем на /auth
  React.useEffect(() => {
    if (loc.pathname === "/auth") return;
    if (!isAuthed || !isReady) nav("/auth", { replace: true });
  }, [isAuthed, isReady, loc.pathname, nav]);

  const disabled = !isAuthed || !isReady;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="qf-frame w-[1180px] max-w-[96vw] h-[720px] max-h-[92vh] flex">
        {/* Rail */}
        <div className="w-[88px] p-4 flex flex-col items-center gap-3 border-r border-white/10">
          <div className="w-12 h-12 rounded-[16px] border border-white/10 bg-white/[0.06] flex items-center justify-center text-white/70 text-sm">
            U
          </div>
          <div className="mt-2 flex flex-col gap-3">
            <RailItem to="/home" disabled={disabled} icon={<IconHome className="w-5 h-5 text-white/70" />} />
            <RailItem to="/store" disabled={disabled} icon={<IconStore className="w-5 h-5 text-white/70" />} />
            <RailItem to="/downloads" disabled={disabled} icon={<IconDownloads className="w-5 h-5 text-white/70" />} />
            <RailItem to="/notifications" disabled={disabled} icon={<IconBell className="w-5 h-5 text-white/70" />} />
            <RailItem to="/settings" disabled={disabled} icon={<IconSettings className="w-5 h-5 text-white/70" />} />
          </div>

          <div className="mt-auto w-full flex flex-col items-center gap-2">
            <div className="text-[11px] text-white/40">{state.tier}</div>
            <button
              className={cn("qf-btn qf-btn-ghost w-full", !isAuthed && "opacity-40")}
              onClick={() => (isAuthed ? actions.signOut() : nav("/auth"))}
            >
              {isAuthed ? "Sign out" : "Sign in"}
            </button>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 p-5 flex flex-col gap-4">
          <TopBar />
          <div className="flex-1 overflow-auto pr-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

function TopBar() {
  const { state, actions } = useApp();
  const nav = useNavigate();

  return (
    <div className="flex items-center justify-center">
      <div className="w-[520px] max-w-[90%]">
        <div className="qf-pill flex items-center gap-2">
          <span className="text-white/45 text-sm">🔎</span>
          <input
            className="bg-transparent outline-none text-sm w-full text-white/80 placeholder:text-white/35"
            placeholder="Search games, collections…"
            value={state.search}
            onChange={(e) => actions.setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") nav("/search");
            }}
          />
        </div>
      </div>
    </div>
  );
}
`);
}

function writePages() {
  writeFile("src/pages/AuthOnboarding.tsx",
`import React from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Input, Panel, Pill, Progress } from "../components/ui";
import { useApp } from "../app/store";
import { cn } from "../lib/cn";

const EmailSchema = z.object({
  email: z.string().email("Email выглядит неверно"),
  password: z.string().min(6, "Пароль минимум 6 символов"),
});

type EmailForm = z.infer<typeof EmailSchema>;

export default function AuthOnboarding() {
  const { state, actions } = useApp();
  const nav = useNavigate();

  const [step, setStep] = React.useState<number>(state.onboardingDone ? 4 : 1);

  const form = useForm<EmailForm>({
    resolver: zodResolver(EmailSchema),
    defaultValues: { email: state.user?.email ?? "", password: "" },
    mode: "onChange",
  });

  const isAuthed = Boolean(state.user);

  function goNext() {
    if (!isAuthed) return;
    setStep(s => Math.min(4, s + 1));
  }
  function goBack() {
    setStep(s => Math.max(1, s - 1));
  }
  function finish() {
    actions.setOnboardingDone(true);
    nav("/home");
  }

  const steps = [
    { n: 1, label: "Create profile" },
    { n: 2, label: "Choose game folders" },
    { n: 3, label: "Import library" },
    { n: 4, label: "Finish" },
  ];

  const progress = ((step - 1) / 3) * 100;

  return (
    <div className="grid grid-cols-2 gap-5 h-full">
      {/* LEFT: Auth */}
      <Panel className="p-6">
        <div className="text-white/85 text-xl font-semibold">Welcome to QuestFlow</div>
        <div className="text-white/45 text-sm mt-1">Sign in, create profile, and set up your library.</div>

        <div className="mt-6">
          <div className="text-sm text-white/70 font-semibold">Sign in</div>
          <div className="text-xs text-white/40 mt-1">Choose a provider</div>

          <div className="mt-4 space-y-3">
            <ProviderButton label="Continue with Steam" hint="S" onClick={() => actions.signInProvider("steam")} />
            <ProviderButton label="Continue with Epic" hint="E" onClick={() => actions.signInProvider("epic")} />
            <ProviderButton label="Continue with Email" hint="@" onClick={() => { /* just focus form */ }} />
          </div>
        </div>

        <div className="mt-6">
          <div className="text-xs text-white/50">Email login</div>

          <form
            className="mt-3 space-y-3"
            onSubmit={form.handleSubmit((v) => {
              actions.signInEmail(v.email);
              form.reset({ email: v.email, password: "" });
            })}
          >
            <div>
              <Input placeholder="email@example.com" {...form.register("email")} />
              {form.formState.errors.email && (
                <div className="text-[11px] text-red-300/80 mt-1">{form.formState.errors.email.message}</div>
              )}
            </div>

            <div>
              <Input type="password" placeholder="••••••••" {...form.register("password")} />
              {form.formState.errors.password && (
                <div className="text-[11px] text-red-300/80 mt-1">{form.formState.errors.password.message}</div>
              )}
            </div>

            <Button variant="primary" type="submit" className="w-full">
              Sign in
            </Button>
          </form>

          {state.user && (
            <div className="mt-4 text-xs text-white/50">
              Signed in as <span className="text-white/80">{state.user.name}</span>{" "}
              <span className="text-white/35">({state.user.provider})</span>
            </div>
          )}
        </div>
      </Panel>

      {/* RIGHT: First run */}
      <Panel className="p-6 flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white/70 font-semibold">First run setup</div>
            <div className="text-xs text-white/40 mt-1">Complete steps to unlock the launcher.</div>
          </div>
          <Pill className="text-xs text-white/70">{state.tier}</Pill>
        </div>

        <div className="mt-4">
          <Progress value={progress} />
        </div>

        <div className="mt-4 space-y-3">
          {steps.map(s => {
            const done = s.n < step || (state.onboardingDone && s.n <= 4);
            const active = s.n === step;
            return (
              <div key={s.n} className={cn("flex items-center gap-3", active ? "text-white/85" : "text-white/55")}>
                <div className={cn("w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-xs",
                  done ? "bg-white/[0.10]" : "bg-white/[0.04]")}>
                  {done ? "✓" : s.n}
                </div>
                <div className="text-sm">{s.label}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 border-t border-white/10 pt-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-white/45">Install location</div>
            <button
              className="qf-btn qf-btn-ghost h-9 px-4"
              onClick={() => actions.setInstallLocation(state.installLocation.includes("QuestFlow") ? "D:\\\\Games" : "D:\\\\Games\\\\QuestFlow Library")}
            >
              Change…
            </button>
          </div>
          <Card className="p-4 text-sm text-white/70">{state.installLocation}</Card>

          <div className="text-xs text-white/45">Folders to scan</div>
          <div className="space-y-2">
            {state.folders.map(f => (
              <button
                key={f.id}
                className={cn("w-full text-left qf-pill flex items-center justify-between", f.enabled ? "opacity-100" : "opacity-50")}
                onClick={() => actions.toggleFolder(f.id)}
              >
                <div className="text-sm text-white/75">{f.path}</div>
                <div className={cn("w-5 h-5 rounded-[10px] border border-white/10 flex items-center justify-center text-xs",
                  f.enabled ? "bg-white/[0.10]" : "bg-white/[0.04]")}>
                  {f.enabled ? "✓" : ""}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-5">
          <Button variant="ghost" onClick={goBack} disabled={step === 1}>
            Back
          </Button>

          {step < 4 ? (
            <Button
              variant="primary"
              onClick={goNext}
              disabled={!isAuthed}
              title={!isAuthed ? "Сначала войди" : ""}
            >
              Continue
            </Button>
          ) : (
            <Button variant="primary" onClick={finish} disabled={!isAuthed}>
              Finish
            </Button>
          )}
        </div>
      </Panel>
    </div>
  );
}

function ProviderButton({ label, hint, onClick }: { label: string; hint: string; onClick: () => void }) {
  return (
    <button className="qf-pill w-full flex items-center gap-3 hover:bg-white/[0.10] transition" onClick={onClick} type="button">
      <div className="w-7 h-7 rounded-[12px] border border-white/10 bg-white/[0.06] flex items-center justify-center text-xs text-white/70">
        {hint}
      </div>
      <div className="text-sm text-white/80 font-semibold">{label}</div>
    </button>
  );
}
`);

  writeFile("src/pages/Home.tsx",
`import React from "react";
import { Link } from "react-router-dom";
import { Card, Button, Panel } from "../components/ui";
import { GAMES, formatPlaytime } from "../data/games";

export default function Home() {
  const featured = GAMES[0];
  const cont = GAMES.slice(1, 4);

  return (
    <div className="h-full flex flex-col gap-5">
      <div className="text-sm text-white/65 font-semibold">Home</div>

      <Panel className="p-6">
        <div className="text-xs text-white/45 font-semibold">Featured</div>

        <Card className="mt-3 p-6">
          <div className="text-3xl font-semibold text-white/85">{featured.title}</div>
          <div className="text-sm text-white/55 mt-1">
            {featured.tagline} • {formatPlaytime(featured.playtimeMin)} played
          </div>

          <div className="mt-5 flex gap-3">
            <Button variant="primary">Play</Button>
            <Link to={"/game/" + featured.id}>
              <Button variant="soft">View details</Button>
            </Link>
          </div>
        </Card>

        <div className="mt-6 text-xs text-white/45 font-semibold">Continue</div>
        <div className="mt-3 grid grid-cols-3 gap-4">
          {cont.map(g => (
            <Link key={g.id} to={"/game/" + g.id} className="block">
              <Card className="p-4 hover:bg-white/[0.10] transition">
                <div className="h-16 rounded-[14px] border border-white/10 bg-white/[0.06]" />
                <div className="mt-3 text-sm text-white/80 font-semibold">{g.title}</div>
                <div className="text-xs text-white/45">Last played • {g.lastPlayedLabel}</div>
              </Card>
            </Link>
          ))}
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="text-xs text-white/45 font-semibold">Trending</div>
        <div className="mt-3 grid grid-cols-4 gap-4">
          {GAMES.map(g => (
            <Card key={g.id} className="p-4">
              <div className="h-14 rounded-[14px] border border-white/10 bg-white/[0.06]" />
              <div className="mt-2 text-xs text-white/75 font-semibold truncate">{g.title}</div>
              <div className="text-[11px] text-white/45">{g.genre}</div>
            </Card>
          ))}
        </div>
      </Panel>
    </div>
  );
}
`);

  writeFile("src/pages/Game.tsx",
`import React from "react";
import { useParams } from "react-router-dom";
import { Button, Card, Panel, Pill } from "../components/ui";
import { findGame, formatPlaytime } from "../data/games";
import { cn } from "../lib/cn";

type Tab = "overview" | "performance" | "news" | "dlc";

export default function Game() {
  const { id } = useParams();
  const g = findGame(id || "");
  const [tab, setTab] = React.useState<Tab>("overview");

  return (
    <div className="h-full flex flex-col gap-5">
      <div className="text-sm text-white/65 font-semibold">Game Page</div>

      <Panel className="p-6">
        <div className="grid grid-cols-[320px_1fr] gap-5">
          <Card className="h-[190px] bg-white/[0.06]" />

          <div>
            <div className="text-2xl font-semibold text-white/85">{g.title}</div>
            <div className="text-xs text-white/45 mt-1">{g.studio} • {g.genre}</div>

            <div className="mt-4 flex gap-3">
              <Button variant="primary" disabled={!g.installed}>Play</Button>
              <Button variant="soft">Manage</Button>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              <Stat label="Playtime" value={formatPlaytime(g.playtimeMin)} />
              <Stat label="Last played" value={g.lastPlayedLabel} />
              <Stat label="Cloud saves" value="On" />
              <Stat label="Updates" value="Up to date" />
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <TabPill label="Overview" active={tab==="overview"} onClick={() => setTab("overview")} />
          <TabPill label="Performance" active={tab==="performance"} onClick={() => setTab("performance")} />
          <TabPill label="News" active={tab==="news"} onClick={() => setTab("news")} />
          <TabPill label="DLC" active={tab==="dlc"} onClick={() => setTab("dlc")} />
        </div>

        <div className="mt-4 grid grid-cols-[1fr_340px] gap-4">
          <Panel className="p-5">
            <div className="text-sm text-white/75 font-semibold">Performance (community data)</div>
            <div className="text-xs text-white/45 mt-1">Target preset: High • Resolution: 1440p</div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <StatBig label="Avg FPS" value="92" />
              <StatBig label="1% Low" value="63" />
              <StatBig label="Recommended" value="RTX 3060\nRyzen 5 5600" multiline />
            </div>

            <div className="mt-5 text-xs text-white/45 font-semibold">Graphics settings snapshot</div>
            <div className="mt-3 space-y-2">
              <Row label="Textures" value="High" />
              <Row label="Shadows" value="Medium" />
              <Row label="DLSS/FSR" value="Quality" />
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="text-sm text-white/75 font-semibold">Game info</div>
            <div className="mt-3 space-y-2 text-xs text-white/55">
              <Info k="Version" v="1.0.12" />
              <Info k="Size on disk" v={g.sizeGb.toFixed(1) + " GB"} />
              <Info k="Install location" v={g.installPath} mono />
              <Info k="Installed" v={g.installed ? "Yes" : "No"} />
            </div>
          </Panel>
        </div>
      </Panel>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3">
      <div className="text-[11px] text-white/45">{label}</div>
      <div className="text-sm text-white/80 font-semibold mt-1">{value}</div>
    </Card>
  );
}

function StatBig({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <Card className="p-4">
      <div className="text-[11px] text-white/45">{label}</div>
      <div className={cn("mt-2 text-3xl text-white/85 font-semibold", multiline && "text-sm leading-5 whitespace-pre-line")}>
        {value}
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between qf-pill">
      <div className="text-xs text-white/55">{label}</div>
      <div className="text-xs text-white/75 font-semibold">{value}</div>
    </div>
  );
}

function Info({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-white/45">{k}</div>
      <div className={cn("text-white/75 text-right", mono && "font-mono text-[11px] break-all")}>{v}</div>
    </div>
  );
}

function TabPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("qf-pill text-xs", active ? "bg-white/[0.12] text-white/85" : "text-white/55 hover:bg-white/[0.10]")}>
      {label}
    </button>
  );
}
`);

  writeFile("src/pages/Downloads.tsx",
`import React from "react";
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
                    {it.state === "done" ? "Completed" : it.state === "paused" ? "Paused" : \`\${it.speedMb.toFixed(1)} MB/s\`}
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
`);

  writeFile("src/pages/Search.tsx",
`import React from "react";
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
`);

  writeFile("src/pages/Notifications.tsx",
`import React from "react";
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
`);

  writeFile("src/pages/Settings.tsx",
`import React from "react";
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
`);

  writeFile("src/pages/States.tsx",
`import React from "react";
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
`);
}

function writeAppEntry() {
  writeFile("src/main.tsx",
`import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
`);

  writeFile("src/App.tsx",
`import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppProvider, useIsReady } from "./app/store";
import Layout from "./components/Layout";
import AuthOnboarding from "./pages/AuthOnboarding";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Downloads from "./pages/Downloads";
import Search from "./pages/Search";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import States from "./pages/States";

function Protected({ children }: { children: React.ReactNode }) {
  const ready = useIsReady();
  return ready ? <>{children}</> : <Navigate to="/auth" replace />;
}

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />

          <Route path="/auth" element={<AuthOnboarding />} />

          <Route path="/home" element={<Protected><Home /></Protected>} />
          <Route path="/store" element={<Protected><Home /></Protected>} />
          <Route path="/game/:id" element={<Protected><Game /></Protected>} />
          <Route path="/downloads" element={<Protected><Downloads /></Protected>} />
          <Route path="/search" element={<Protected><Search /></Protected>} />
          <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
          <Route path="/settings" element={<Protected><Settings /></Protected>} />
          <Route path="/states" element={<Protected><States /></Protected>} />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}
`);
}

function main() {
  console.log("== QuestFlow WEB demo setup ==");
  writeConfigFiles();
  writeCss();
  writeLib();
  writeData();
  writeStore();
  writeUIComponents();
  writeLayout();
  writePages();
  writeAppEntry();

  console.log("\nГотово.");
  console.log("Дальше:");
  console.log("  1) npm run dev");
  console.log("  2) открой http://localhost:5173/");
}

main();