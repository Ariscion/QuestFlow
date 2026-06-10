import { lazy, Suspense, useEffect, type CSSProperties, type ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate, Route, Routes } from "react-router-dom";

import { useAppStore } from "@/entities/game/model/appStore";
import Layout from "@/widgets/layout/ui/Layout";
import { Skeleton } from "@/shared/ui/Primitives";
import { Toaster } from "@/shared/ui/Toaster";
import ChangelogModal from "@/features/changelog/ui/ChangelogModal";
import RegionModal from "@/features/region/ui/RegionModal";
import LanguageModal from "@/features/language/ui/LanguageModal";
import { auth, getUserDataFromDb, saveUserDataToDb } from "@/shared/lib/firebase";
import HelpAndEthicsPage from "@/pages/help-ethics/ui/HelpAndEthicsPage";
import ErrorBoundary from "@/shared/ui/ErrorBoundary";
import Library from "@/pages/library/ui/Library";
import Store from "@/pages/store/ui/Store";
import { useUserStore, type UserProvider } from "@/entities/user/model/userStore";
import { useToastStore } from "@/shared/model/toastStore";
import { useWishlistCheck } from "@/entities/game/model/useWishlistCheck";

const AuthOnboarding = lazy(() => import("@/pages/auth/ui/AuthOnboarding"));
const Downloads = lazy(() => import("@/pages/downloads/ui/Downloads"));
const Game = lazy(() => import("@/pages/game/ui/Game"));
const Home = lazy(() => import("@/pages/home/ui/Home"));
const Notifications = lazy(() => import("@/pages/notifications/ui/Notifications"));
const Settings = lazy(() => import("@/pages/settings/ui/Settings"));

type ProtectedProps = {
  children: ReactNode;
};

function Protected({ children }: ProtectedProps) {
  const ready = useUserStore((s) => s.isReady);
  const isAuthed = useUserStore((s) => s.isAuthed);
  const isGuest = useUserStore((s) => s.isGuest);
  
  return (ready || isGuest) && (isAuthed || isGuest) ? <>{children}</> : <Navigate to="/auth" replace />;
}

function mapProvider(providerId?: string): UserProvider {
  if (providerId === "google.com") return "Google";
  if (providerId === "password") return "Email";
  return "Unknown";
}

function RouteFallback() {
  return (
    <div className="min-h-[100dvh] sm:min-h-screen flex items-center justify-center sm:p-6 bg-neutral-950 sm:bg-transparent">
      <div className="w-full h-[100dvh] sm:w-[1180px] sm:max-w-[96vw] sm:h-[720px] sm:max-h-[92vh] rounded-none sm:rounded-3xl border-0 sm:border border-neutral-800 bg-neutral-900/60 p-6">
        <div className="h-full flex flex-col gap-4">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { motionEnabled, setDeferredPrompt, setSearch } = useAppStore();
  const {
    reset,
    setCloudData,
    setUser,
    signOut,
  } = useUserStore();
  
  useWishlistCheck();

  useEffect(() => {
    if (!motionEnabled) {
      document.documentElement.classList.add("disable-motion");
    } else {
      document.documentElement.classList.remove("disable-motion");
    }
  }, [motionEnabled]);



  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as any);
    };

    // Если событие уже случилось до загрузки React
    // @ts-ignore
    if (window.deferredPWAInstallPrompt) {
      // @ts-ignore
      setDeferredPrompt(window.deferredPWAInstallPrompt);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [setDeferredPrompt]);

  // Flush pending cloud sync when user closes/refreshes the tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      const { user, library, wishlist, userXP, userLevel, xpToNextLevel } = useUserStore.getState();
      if (!user?.uid) return;
      void saveUserDataToDb(user.uid, { library, wishlist, userXP, userLevel, xpToNextLevel });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Fetch dynamic currency exchange rates on startup
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        if (!res.ok) throw new Error("Failed to fetch rates");
        const data = await res.json();
        if (data && data.rates) {
          const rates = data.rates;
          useUserStore.getState().setCurrencyRates(rates);
          
          const { currencyInfo, setCurrencyInfo } = useUserStore.getState();
          const currentCode = currencyInfo.code;
          const currentRate = rates[currentCode];
          if (currentRate && currentRate !== currencyInfo.rateToUSD) {
            setCurrencyInfo({
              ...currencyInfo,
              rateToUSD: currentRate
            });
            console.log(`Updated exchange rate for ${currentCode} to ${currentRate}`);
          }
        }
      } catch (err) {
        console.error("Error fetching currency rates:", err);
      }
    };
    void fetchRates();
  }, []);

  const appStyle = {} as CSSProperties;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const state = useUserStore.getState();
      if (!state.isReady && !state.isAuthed && !state.isGuest) {
        useUserStore.getState().setOnboardingDone(true);
        useToastStore.getState().addToast({
          title: "Проблема с соединением",
          message: "Firebase недоступен. Если вы из РФ, попробуйте VPN или войдите как гость.",
          type: "error",
          duration: 8000
        });
      }
    }, 6000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeoutId);
      if (firebaseUser) {
        const cloudData = await getUserDataFromDb(firebaseUser.uid);
        if (cloudData !== null) {
          setCloudData(cloudData);
        }

        setUser({
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL,
          provider: mapProvider(firebaseUser.providerData[0]?.providerId),
          uid: firebaseUser.uid,
        });
        useUserStore.getState().setOnboardingDone(true);

        return;
      }

      // If they are in guest mode or Telegram user, keep them active when not authed in Firebase
      const currentState = useUserStore.getState();
      if (currentState.user?.provider === "Telegram") {
        const uid = currentState.user.uid;
        const cloudData = await getUserDataFromDb(uid);
        if (cloudData !== null) {
          setCloudData(cloudData);
        }
        return;
      }
      if (currentState.isGuest) {
        return;
      }

      signOut();
      reset();
      setSearch("");
    });

    return () => unsubscribe();
  }, [setSearch, reset, setCloudData, setUser, signOut]);


  return (
    <>
      {!motionEnabled && (
        <style>{"* { animation: none !important; transition: none !important; scroll-behavior: auto !important; }"}</style>
      )}

      <div style={appStyle}>
        <Toaster />
        <LanguageModal />
        <ChangelogModal />
        <RegionModal />
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/home" replace />} />

                <Route path="/auth" element={<AuthOnboarding />} />

                <Route path="/home" element={<Protected><Home /></Protected>} />
                <Route path="/store" element={<Protected><Store /></Protected>} />
                <Route path="/library" element={<Protected><Library /></Protected>} />
                <Route path="/game/:id" element={<Protected><Game /></Protected>} />
                <Route path="/downloads" element={<Protected><Downloads /></Protected>} />
                <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
                <Route path="/help-ethics" element={<Protected><HelpAndEthicsPage /></Protected>} />
                <Route path="/settings" element={<Protected><Settings /></Protected>} />

                <Route path="*" element={<Navigate to="/home" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  );
}

export default function App() {
  return <AppContent />;
}