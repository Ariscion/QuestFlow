import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Input, Panel, Pill, Progress } from "../components/ui";
import { useApp } from "../app/store";
import { cn } from "../lib/cn";
import { loginWithGoogle } from "../lib/firebase";

const EmailSchema = z.object({
  email: z.string().email("Email выглядит неверно"),
  password: z.string().min(6, "Пароль минимум 6 символов"),
});

type EmailForm = z.infer<typeof EmailSchema>;

export default function AuthOnboarding() {
  const { state, actions } = useApp();
  const nav = useNavigate();

  const [step, setStep] = useState<number>(state.onboardingDone ? 4 : 1);

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

  async function handleGoogleLogin() {
    try {
      await loginWithGoogle();
      setStep(4);
    } catch (error) {
      console.error(error);
    }
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
            <ProviderButton label="Continue with Google" hint="G" onClick={handleGoogleLogin} />
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
              onClick={() => actions.setInstallLocation(state.installLocation.includes("QuestFlow") ? "D:\\Games" : "D:\\Games\\QuestFlow Library")}
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

type ProviderButtonProps = {
  label: string;
  hint: string;
  onClick: () => void;
};

function ProviderButton({ label, hint, onClick }: ProviderButtonProps) {
  return (
    <button className="qf-pill w-full flex items-center gap-3 hover:bg-white/[0.10] transition" onClick={onClick} type="button">
      <div className="w-7 h-7 rounded-[12px] border border-white/10 bg-white/[0.06] flex items-center justify-center text-xs text-white/70">
        {hint}
      </div>
      <div className="text-sm text-white/80 font-semibold">{label}</div>
    </button>
  );
}
