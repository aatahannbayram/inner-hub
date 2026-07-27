import { renderToString } from "react-dom/server";
import { Router as WouterRouter, Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/i18n";
import Home from "@/pages/Home";
import Invitation from "@/pages/Invitation";
import ArtifactsPage from "@/pages/Artifacts";
import ArtifactDetailPage from "@/pages/ArtifactDetail";
import NotFound from "@/pages/not-found";

function PublicRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/invitation" component={Invitation} />
      <Route path="/haberler" component={ArtifactsPage} />
      <Route path="/haberler/:slug" component={ArtifactDetailPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

/** SSR HTML for a public path (prerender). */
export function render(url = "/"): string {
  const queryClient = new QueryClient();
  return renderToString(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TooltipProvider>
          <WouterRouter ssrPath={url}>
            <PublicRoutes />
          </WouterRouter>
        </TooltipProvider>
      </I18nProvider>
    </QueryClientProvider>,
  );
}
