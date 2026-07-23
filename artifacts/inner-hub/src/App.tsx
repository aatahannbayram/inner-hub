import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Invitation from "@/pages/Invitation";
import Requests from "@/pages/Requests";
import { PanelShell, type PanelUser } from "@/components/panel/PanelShell";
import { apiUrl } from "@/lib/api";
import { PanelLogin } from "@/components/panel/PanelLogin";
import Dashboard from "@/pages/panel/Dashboard";
import Perks from "@/pages/panel/Perks";
import Events from "@/pages/panel/Events";
import CoursesPage from "@/pages/panel/Courses";
import ChatPage from "@/pages/panel/Chat";
import Members from "@/pages/panel/Members";
import Membership from "@/pages/panel/Membership";
import PaymentSuccess from "@/pages/panel/PaymentSuccess";
import Signal from "@/pages/panel/Signal";
import Match from "@/pages/panel/Match";
import Capital from "@/pages/panel/Capital";
import Vault from "@/pages/panel/Vault";
import Pulse from "@/pages/panel/Pulse";
import InnerId from "@/pages/panel/InnerId";
import InnerApi from "@/pages/panel/InnerApi";
import ProfilePage from "@/pages/panel/Profile";
import Analytics from "@/pages/panel/Analytics";
import ApplicationsPage from "@/pages/panel/Applications";
import FAQ from "@/pages/panel/FAQ";
import Settings from "@/pages/panel/Settings";

const queryClient = new QueryClient();

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">
        inner·hub
      </p>
      <h1
        className="font-serif font-display text-4xl text-[var(--ink)]"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
      >
        {title}
        <span className="inline-block size-[0.35em] translate-y-[0.08em] ml-[0.05em] bg-[var(--inner-green)]" />
      </h1>
      <p className="text-sm text-[var(--ink)]/40 font-light">Bu sayfa yakında hazır olacak.</p>
    </div>
  );
}

function PanelRoutes({ user, onLogout }: { user: PanelUser; onLogout: () => void }) {
  return (
    <PanelShell user={user} onLogout={onLogout}>
      <Switch>
        <Route path="/panel" component={() => <Dashboard userName={user.name.split(" ")[0]} />} />
        <Route path="/panel/chat"         component={() => <ChatPage />} />
        <Route path="/panel/courses"      component={() => <CoursesPage />} />
        <Route path="/panel/events"       component={() => <Events />} />
        <Route path="/panel/members"      component={() => <Members />} />
        <Route path="/panel/perks"        component={() => <Perks />} />
        <Route path="/panel/signal"       component={() => <Signal />} />
        <Route path="/panel/match"        component={() => <Match />} />
        <Route path="/panel/capital"      component={() => <Capital />} />
        <Route path="/panel/vault"        component={() => <Vault />} />
        <Route path="/panel/pulse"        component={() => <Pulse />} />
        <Route path="/panel/id"           component={() => <InnerId />} />
        <Route path="/panel/api"          component={() => <InnerApi />} />
        <Route path="/panel/profile"      component={() => <ProfilePage />} />
        <Route path="/panel/faq"          component={() => <FAQ />} />
        <Route path="/panel/membership"   component={() => <Membership />} />
        <Route path="/panel/payment/success" component={() => <PaymentSuccess />} />
        <Route path="/panel/applications" component={() => <ApplicationsPage />} />
        <Route path="/panel/analytics"    component={() => <Analytics />} />
        <Route path="/panel/settings"     component={() => <Settings />} />
        <Route component={NotFound} />
      </Switch>
    </PanelShell>
  );
}

// ─── Auth guard ───────────────────────────────────────────────────────────────
function PanelApp() {
  const [panelUser, setPanelUser] = useState<PanelUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch(apiUrl("/api/auth/me"), { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setPanelUser({
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            profileCompletionPct: data.user.profileCompletionPct ?? 0,
            notificationCount: 0,
          });
        }
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, []);

  if (!checked) return null;

  const handleLogin = (u: { email: string; role: "member" | "admin"; name: string }) => {
    setPanelUser({
      name: u.name,
      email: u.email,
      role: u.role,
      profileCompletionPct: 0,
      notificationCount: 0,
    });
  };

  const handleLogout = () => {
    fetch(apiUrl("/api/auth/logout"), { method: "POST", credentials: "include" }).catch(() => {});
    setPanelUser(null);
  };

  if (!panelUser) {
    return <PanelLogin onLogin={handleLogin} />;
  }

  return <PanelRoutes user={panelUser} onLogout={handleLogout} />;
}

// ─── Router ───────────────────────────────────────────────────────────────────
function Router() {
  return (
    <Switch>
      <Route path="/"           component={Home} />
      <Route path="/invitation" component={Invitation} />
      <Route path="/requests"   component={Requests} />
      <Route path="/panel"    component={PanelApp} />
      <Route path="/panel/:rest+" component={PanelApp} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
