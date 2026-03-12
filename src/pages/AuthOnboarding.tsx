import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Panel } from "../components/ui";
import { useApp } from "../app/store";
import { loginWithGoogle } from "../lib/firebase";

export default function AuthOnboarding() {
  const { state, actions } = useApp();
  const nav = useNavigate();

  const isAuthed = Boolean(state.user);

  useEffect(() => {
    if (!isAuthed) return;
    actions.setReady(true);
    nav("/home");
  }, [isAuthed, actions, nav]);

  async function handleGoogleLogin() {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="h-full flex items-center justify-center px-4">
      <Panel className="w-full max-w-xl p-8 md:p-10 bg-gradient-to-br from-slate-900/70 via-blue-900/20 to-indigo-900/30 border-white/10 shadow-[0_20px_80px_rgba(2,6,23,0.7)]">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200 mb-5">
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
            Cloud Gaming Deals
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">
            Добро пожаловать в <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">QuestFlow</span>
          </h1>

          <p className="text-sm md:text-base text-white/65 leading-relaxed max-w-lg mx-auto mb-8">
            Авторизуйтесь, чтобы находить лучшие скидки, копить XP и собирать свою облачную библиотеку.
          </p>

          <Button
            variant="primary"
            onClick={handleGoogleLogin}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
          >
            Войти через Google
          </Button>
        </div>
      </Panel>
    </div>
  );
}

