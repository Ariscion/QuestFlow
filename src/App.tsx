import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppProvider, useIsReady } from "./app/store";
import Layout from "./components/Layout";
import AuthOnboarding from "./pages/AuthOnboarding";
import Downloads from "./pages/Downloads";
import Game from "./pages/Game";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import States from "./pages/States";
import Store from "./pages/Store";

type ProtectedProps = {
  children: ReactNode;
};

function Protected({ children }: ProtectedProps) {
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
            <Route path="/store" element={<Protected><Store /></Protected>} />
            <Route path="/library" element={<Protected><Library /></Protected>} />
            <Route path="/game/:id" element={<Protected><Game /></Protected>} />
            <Route path="/downloads" element={<Protected><Downloads /></Protected>} />
            <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
            <Route path="/settings" element={<Protected><Settings /></Protected>} />
            <Route path="/states" element={<Protected><States /></Protected>} />

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Routes>
      </AppProvider>
  );
}