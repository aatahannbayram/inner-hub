import { renderToString } from "react-dom/server";
import { Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";

export function render(): string {
  const queryClient = new QueryClient();
  return renderToString(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter ssrPath="/">
          <Home />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}
