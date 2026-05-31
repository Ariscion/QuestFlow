import { useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";

import { auth, getUserDataFromDb } from "../lib/firebase";
import { useUserStore } from "../store/userStore";
import { useToastStore } from "../store/toastStore";

const authSchema = z.object({
  email: z.string().min(1, "auth.required").email("auth.invalid_email"),
  password: z.string().min(6, "auth.password_min")
});

type AuthFormData = z.infer<typeof authSchema>;

export default function AuthOnboarding() {
  const { isAuthed, setOnboardingDone, setGuestMode, isGuest } = useUserStore();
  const nav = useNavigate();
  const { addToast } = useToastStore();
  const { t } = useTranslation();
  
  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Авто-вход для Telegram пользователей
  useEffect(() => {
    const handleTgAuth = async () => {
      if (window.Telegram?.WebApp) {
        const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
        if (tgUser?.id && !isAuthed && !isGuest) {
          console.log("Telegram user detected, auto-logging in...");
          const { setUser, setCloudData } = useUserStore.getState();
          
          const uid = `tg_${tgUser.id}`;
          
          // Загружаем данные из БД для ТГ пользователя
          const cloudData = await getUserDataFromDb(uid);
          if (cloudData !== null) {
            setCloudData(cloudData);
          }
          
          setUser({
            uid: uid,
            name: tgUser.first_name + (tgUser.last_name ? ` ${tgUser.last_name}` : ''),
            provider: "Telegram",
            avatar: null
          });
        }
      }
    };
    
    void handleTgAuth();
  }, [isAuthed, isGuest]);

  useEffect(() => {
    if (isAuthed || isGuest) {
      setOnboardingDone(true);
      nav("/home", { replace: true });
    }
  }, [isAuthed, isGuest, nav, setOnboardingDone]);

  function handleGuestMode() {
    setGuestMode();
  }

  async function handleGoogleLogin() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEmailSubmit(data: AuthFormData) {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
        addToast({ title: t('auth.reg_success'), type: "success" });
      } else {
        await signInWithEmailAndPassword(auth, data.email.trim(), data.password);
      }
    } catch (error) {
      console.error("Auth Error:", error);
      const err = error as { code?: string; message?: string };
      const msg = err.code === "auth/email-already-in-use" ? t('auth.email_in_use') : 
                  err.code === "auth/invalid-credential" ? t('auth.invalid_credentials') : 
                  err.code === "auth/operation-not-allowed" ? t('auth.firebase_error') :
                  err.code === "auth/weak-password" ? t('auth.weak_password') : `Ошибка: ${err.code || err.message || t('auth.unknown_error')}`;
      addToast({ title: msg, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForgotPassword() {
    const currentEmail = watch("email");
    const isEmailValid = await trigger("email");
    
    if (!isEmailValid || !currentEmail?.trim()) {
      addToast({ title: t('auth.enter_valid_email'), type: "info" });
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, currentEmail.trim());
      addToast({ 
        title: t('auth.email_sent'), 
        message: t('auth.reset_email_sent'),
        type: "success",
        duration: 6000
      });
    } catch (error) {
      console.error(error);
      addToast({ title: t('auth.email_send_error'), type: "error" });
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-950 overflow-hidden selection:bg-blue-500/30">
      
      {/* ЛЕВАЯ ЧАСТЬ - ВИЗУАЛ & БРЕНДИНГ */}
      <div className="hidden md:flex flex-1 relative flex-col justify-between p-12 border-r border-slate-800/60 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-cyan-600/5 rounded-full blur-[160px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at center, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center border border-blue-500/30">
                <span className="text-2xl font-black text-white drop-shadow-md">Q</span>
            </div>
            <span className="text-3xl font-black tracking-tight text-white drop-shadow-lg">QuestFlow</span>
        </div>

        <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-1.5 text-xs font-bold text-slate-300 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                {t('auth.cloud_tracker')}
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight drop-shadow-xl">
                {t('auth.hero_title_1')} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{t('auth.hero_title_2')}</span>
            </h1>
            
            <p className="text-xl text-white/60 leading-relaxed font-medium">
                {t('auth.hero_desc')}
            </p>
            
            <div className="mt-14 flex items-center gap-6">
                <div className="flex -space-x-4">
                    <div className="w-12 h-12 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300">Steam</div>
                    <div className="w-12 h-12 rounded-full border-2 border-slate-950 bg-slate-900 flex items-center justify-center text-sm font-bold text-slate-300">Epic</div>
                    <div className="w-12 h-12 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300">GOG</div>
                </div>
                <div className="text-sm font-semibold text-white/50 leading-tight">
                    {t('auth.stores_support_1')} <br/><span className="text-white/80">{t('auth.stores_support_2')}</span>
                </div>
            </div>
        </div>
      </div>

      {/* ПРАВАЯ ЧАСТЬ - ФОРМА АВТОРИЗАЦИИ */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10 bg-slate-950">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-3 mb-10 mt-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <span className="text-xl font-black text-white">Q</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-white">QuestFlow</span>
        </div>

        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            <div className="text-center md:text-left mb-8">
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                    {isRegistering ? t('auth.create_account') : t('auth.welcome_back')}
                </h2>
                <p className="text-white/50 text-sm font-medium">
                    {isRegistering 
                        ? t('auth.create_profile_desc') 
                        : t('auth.login_desc')}
                </p>
            </div>

            {/* Google Button */}
            <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-12 relative group flex items-center justify-center gap-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-all duration-200 overflow-hidden shadow-sm"
            >
                <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
                    <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="font-semibold text-white/90 group-hover:text-white transition-colors relative z-10">
                    {isLoading ? t('auth.processing') : t('auth.continue_with_google')}
                </span>
            </button>

            <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-slate-850" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{t('auth.or_by_email')}</span>
                <div className="flex-1 h-px bg-slate-850" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleEmailSubmit)} className="flex flex-col gap-5">
                <div className="space-y-4">
                    <div className="relative group">
                        <input
                            type="email"
                            placeholder={t('auth.email_placeholder')}
                            className={`w-full pl-4 pr-4 py-3.5 bg-slate-900 border ${errors.email ? 'border-red-500/50 focus:border-red-500/50' : 'border-slate-800 focus:border-blue-500/50 hover:border-slate-750'} rounded-xl transition-all outline-none text-white text-sm placeholder:text-slate-500 focus:bg-slate-950 shadow-inner`}
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-400 font-medium">{t(errors.email.message || '')}</p>
                        )}
                    </div>
                    <div className="relative group">
                        <input
                            type="password"
                            placeholder={t('auth.password_placeholder')}
                            className={`w-full pl-4 pr-4 py-3.5 bg-slate-900 border ${errors.password ? 'border-red-500/50 focus:border-red-500/50' : 'border-slate-800 focus:border-blue-500/50 hover:border-slate-750'} rounded-xl transition-all outline-none text-white text-sm placeholder:text-slate-500 focus:bg-slate-950 shadow-inner`}
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-400 font-medium">{t(errors.password.message || '')}</p>
                        )}
                    </div>
                </div>

                {!isRegistering && (
                    <div className="flex justify-end mt-[-8px]">
                        <button 
                            type="button" 
                            onClick={handleForgotPassword}
                            className="text-xs font-semibold text-slate-500 hover:text-blue-400 transition-colors"
                        >
                            {t('auth.forgot_password')}
                        </button>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-12 mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base rounded-xl transition-all active:scale-[0.98] border border-blue-500/30 shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                >
                    {isLoading ? t('auth.processing') : isRegistering ? t('auth.register') : t('auth.login')}
                </button>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-white/50">
                {isRegistering ? t('auth.already_have_account') : t('auth.first_time')}
                <button 
                    type="button" 
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="font-bold text-white hover:text-blue-400 transition-colors underline decoration-white/30 underline-offset-4"
                >
                    {isRegistering ? t('auth.sign_in') : t('auth.create_account')}
                </button>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-850 text-center">
                <button
                    onClick={handleGuestMode}
                    disabled={isLoading}
                    className="group relative inline-flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-all"
                >
                    <span className="w-8 h-px bg-slate-800 group-hover:w-12 transition-all duration-300" />
                    {t('auth.offline_mode')}
                    <span className="w-8 h-px bg-slate-800 group-hover:w-12 transition-all duration-300" />
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}
