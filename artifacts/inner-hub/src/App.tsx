import { useState, useEffect, lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useParams } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Invitation from "@/pages/Invitation";
import Requests from "@/pages/Requests";
import PublicProfile from "@/pages/PublicProfile";
import ArtifactsPage from "@/pages/Artifacts";
import ArtifactDetailPage from "@/pages/ArtifactDetail";
import { PanelShell, type PanelUser } from "@/components/panel/PanelShell";
import { PanelPageSkeleton } from "@/components/panel/Skeletons";
import { apiUrl } from "@/lib/api";
import { PanelLogin } from "@/components/panel/PanelLogin";
import { Lockup } from "@/components/Lockup";
import { I18nProvider, useT } from "@/i18n";
import { useThemeRouteSync } from "@/hooks/useTheme";
import { useLocation } from "wouter";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

// Panel sayfaları auth arkasında (SEO'ya tabi değil) - code-split edilir.
// Home/Invitation/Requests eager kalır (prerender/SEO).
const Dashboard        = lazy(() => import("@/pages/panel/Dashboard"));
const Perks            = lazy(() => import("@/pages/panel/Perks"));
const Events            = lazy(() => import("@/pages/panel/Events"));
const CoursesPage       = lazy(() => import("@/pages/panel/Courses"));
const ChatPage          = lazy(() => import("@/pages/panel/Chat"));
const Members           = lazy(() => import("@/pages/panel/Members"));
const Membership        = lazy(() => import("@/pages/panel/Membership"));
const PaymentSuccess    = lazy(() => import("@/pages/panel/PaymentSuccess"));
const Signal            = lazy(() => import("@/pages/panel/Signal"));
const Match             = lazy(() => import("@/pages/panel/Match"));
const Capital           = lazy(() => import("@/pages/panel/Capital"));
const Vault             = lazy(() => import("@/pages/panel/Vault"));
const Pulse             = lazy(() => import("@/pages/panel/Pulse"));
const InnerId           = lazy(() => import("@/pages/panel/InnerId"));
const InnerApi          = lazy(() => import("@/pages/panel/InnerApi"));
const ProfilePage       = lazy(() => import("@/pages/panel/Profile"));
const Analytics         = lazy(() => import("@/pages/panel/Analytics"));
const ApplicationsPage  = lazy(() => import("@/pages/panel/Applications"));
const CoursesAdmin      = lazy(() => import("@/pages/panel/CoursesAdmin"));
const EventsAdmin       = lazy(() => import("@/pages/panel/EventsAdmin"));
const HaberlerAdmin     = lazy(() => import("@/pages/panel/HaberlerAdmin"));
const Stage             = lazy(() => import("@/pages/panel/Stage"));
const FAQ               = lazy(() => import("@/pages/panel/FAQ"));
const Settings          = lazy(() => import("@/pages/panel/Settings"));

const queryClient = new QueryClient();

function PlaceholderPage({ title }: { title: string }) {
  const t = useT();
  return (
    <div className="flex flex-col gap-3">
      <Lockup suffix="hub" className="text-[var(--ink)]" fontSize="1.15rem" />
      <h1
        className="font-serif font-display text-4xl text-[var(--ink)]"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
      >
        {title}
      </h1>
      <p className="text-sm text-[var(--ink-muted)] font-light">{t("common.comingSoon")}</p>
    </div>
  );
}

function PanelRoutes({ user, onLogout }: { user: PanelUser; onLogout: () => void }) {
  return (
    <PanelShell user={user} onLogout={onLogout}>
      <Suspense fallback={<PanelPageSkeleton />}>
        <Switch>
          <Route
            path="/panel"
            component={() => (
              <Dashboard userName={user.name.split(" ")[0]} profileCompletionPct={user.profileCompletionPct} />
            )}
          />
          <Route path="/panel/chat"         component={() => <ChatPage />} />
          <Route path="/panel/courses/admin" component={() => <CoursesAdmin />} />
          <Route path="/panel/courses"      component={() => <CoursesPage />} />
          <Route path="/panel/events/admin" component={() => <EventsAdmin />} />
          <Route path="/panel/events"       component={() => <Events />} />
          <Route path="/panel/stage"        component={() => <Stage />} />
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
          <Route path="/panel/haberler"     component={() => <HaberlerAdmin />} />
          <Route path="/panel/analytics"    component={() => <Analytics />} />
          <Route path="/panel/settings"     component={() => <Settings />} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
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

  useEffect(() => {
    const onUpdated = (ev: Event) => {
      const user = (ev as CustomEvent).detail;
      if (!user) return;
      setPanelUser((prev) =>
        prev
          ? {
              ...prev,
              name: user.name ?? prev.name,
              profileCompletionPct: user.profileCompletionPct ?? prev.profileCompletionPct ?? 0,
            }
          : prev,
      );
    };
    window.addEventListener("inner-profile-updated", onUpdated);
    return () => window.removeEventListener("inner-profile-updated", onUpdated);
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
function ThemeRouteGate({ children }: { children: React.ReactNode }) {
  const [loc] = useLocation();
  useThemeRouteSync(loc);
  return <>{children}</>;
}

function RedirectArtifactsIndex() {
  return <Redirect to="/haberler" />;
}

function RedirectArtifactsSlug() {
  const params = useParams<{ slug?: string }>();
  return <Redirect to={params.slug ? `/haberler/${params.slug}` : "/haberler"} />;
}

function Router() {
  return (
    <ThemeRouteGate>
      <Switch>
        <Route path="/"           component={Home} />
        <Route path="/invitation" component={Invitation} />
        <Route path="/haberler"  component={ArtifactsPage} />
        <Route path="/haberler/:slug" component={ArtifactDetailPage} />
        <Route path="/artifacts/:slug" component={RedirectArtifactsSlug} />
        <Route path="/artifacts" component={RedirectArtifactsIndex} />
        <Route path="/requests"   component={Requests} />
        <Route path="/u/:handle"  component={PublicProfile} />
        <Route path="/panel" component={PanelApp} />
        <Route path="/panel/*" component={PanelApp} />
        <Route component={NotFound} />
      </Switch>
    </ThemeRouteGate>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <GoogleAnalytics />
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
