import { lazy, Suspense, useEffect, type CSSProperties, type ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate, Route, Routes } from "react-router-dom";

import { useAppStore } from "./store/appStore";
import Layout from "./components/Layout";
import { Skeleton } from "./components/ui";
import { Toaster } from "./components/ui/Toaster";
import ChangelogModal from "./components/ChangelogModal";
import RegionModal from "./components/RegionModal";
import LanguageModal from "./components/LanguageModal";
import { auth, getUserDataFromDb, saveUserDataToDb } from "./lib/firebase";
import HelpAndEthicsPage from "./pages/HelpAndEthicsPage";
import ErrorBoundary from "./components/ErrorBoundary";
import Library from "./pages/Library";
import Store from "./pages/Store";
import { useUserStore, type UserProvider } from "./store/userStore";
import { useToastStore } from "./store/toastStore";
import { useWishlistCheck } from "./hooks/useWishlistCheck";

const AuthOnboarding = lazy(() => import("./pages/AuthOnboarding"));
const Downloads = lazy(() => import("./pages/Downloads"));
const Game = lazy(() => import("./pages/Game"));
const Home = lazy(() => import("./pages/Home"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Settings = lazy(() => import("./pages/Settings"));

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