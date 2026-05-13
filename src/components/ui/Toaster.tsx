import { useEffect, useState } from "react";
import { useToastStore, type Toast } from "../../store/toastStore";
import { useTranslation } from "react-i18next";

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLeaving(true);
            setTimeout(onClose, 300); // Wait for exit animation
        }, (toast.duration || 4000) - 300);
        return () => clearTimeout(timer);
    }, [toast.duration, onClose]);

    const baseClasses = "relative overflow-hidden w-80 rounded-2xl p-4 shadow-2xl transition-all duration-300 pointer-events-auto border";
    
    const typeClasses = {
        success: "bg-emerald-950 border-emerald-900",
        info: "bg-blue-950 border-blue-900",
        error: "bg-red-950 border-red-900 shadow-[0_0_20px_rgba(220,38,38,0.15)]",
        xp: "bg-zinc-900 border-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.15)]",
        levelup: "bg-zinc-900 border-fuchsia-600 shadow-[0_0_20px_rgba(217,70,239,0.15)]"
    };

    const icons = {
        success: "✅",
        info: "ℹ️",
        error: "❌",
        xp: "✨",
        levelup: "🎉"
    };

    return (
        <div className={`${baseClasses} ${typeClasses[toast.type]} ${isLeaving ? 'opacity-0 translate-x-8' : 'animate-in slide-in-from-right-8 fade-in'}`}>
            <div className="flex gap-3 items-start relative z-10">
                <div className="text-2xl drop-shadow-md">{icons[toast.type]}</div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white/95">{toast.title}</div>
                    {toast.message && (
                        <div className="text-xs text-white/70 mt-1 leading-relaxed">{toast.message}</div>
                    )}
                </div>
                <button 
                    onClick={() => {
                        setIsLeaving(true);
                        setTimeout(onClose, 300);
                    }}
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white/90 transition-colors"
                >
                    ✕
                </button>
            </div>
            
            {/* Glossy shine effect */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-2xl" />
        </div>
    );
}

function LevelUpOverlay() {
    const { levelUpData } = useToastStore();
    const { t } = useTranslation();
    
    if (!levelUpData) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/90 animate-in fade-in duration-500" />
            
            <div className="relative z-10 flex flex-col items-center animate-in zoom-in-50 fade-in duration-700 ease-out">
                <div className="absolute inset-0 bg-blue-500 blur-[100px] opacity-50 rounded-full animate-pulse" />
                
                <div className="text-blue-300 font-bold uppercase tracking-[0.5em] text-sm md:text-base mb-4 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                    {t('notifications.new_level')}
                </div>
                
                <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 rounded-full blur-xl opacity-70 animate-[spin_4s_linear_infinite]" />
                    <div className="w-40 h-40 md:w-56 md:h-56 relative rounded-full bg-slate-900 flex items-center justify-center border-[4px] border-slate-800 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
                        <span className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-500 drop-shadow-2xl">
                            {levelUpData.level}
                        </span>
                    </div>
                </div>
                
                <div className="mt-8 text-white/60 text-sm animate-pulse">
                    {t('notifications.level_up_desc')}
                </div>
            </div>
        </div>
    );
}

export function Toaster() {
    const { toasts, removeToast } = useToastStore();

    return (
        <>
            <LevelUpOverlay />
            <div className="fixed bottom-6 right-6 z-[90] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <ToastItem 
                        key={toast.id} 
                        toast={toast} 
                        onClose={() => removeToast(toast.id)} 
                    />
                ))}
            </div>
        </>
    );
}
