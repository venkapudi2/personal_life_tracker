import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Notes from "@/pages/Notes";
import Habits from "@/pages/Habits";
import Finances from "@/pages/Finances";
import Checklists from "@/pages/Checklists";
import Goals from "@/pages/Goals";
import Sidebar from "@/components/Sidebar";

function Router() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/notes" component={Notes} />
            <Route path="/habits" component={Habits} />
            <Route path="/finances" component={Finances} />
            <Route path="/checklists" component={Checklists} />
            <Route path="/goals" component={Goals} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
