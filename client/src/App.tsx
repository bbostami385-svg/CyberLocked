import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import { Spinner } from "./components/ui/spinner";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Targets from "./pages/Targets";
import ScanDetails from "./pages/ScanDetails";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import TeamManagement from "./pages/TeamManagement";
import ScanForm from "./pages/ScanForm";
import VulnerabilityReport from "./pages/VulnerabilityReport";
import AdminPanel from "./pages/AdminPanel";

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path={"\\"} component={Home} />
        <Route path={"/login"} component={Login} />
        <Route path={"/register"} component={Register} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Authenticated routes with dashboard layout
  return (
    <DashboardLayout>
      <Switch>
        <Route path={"/dashboard"} component={Dashboard} />
        <Route path={"/targets"} component={Targets} />
        <Route path={"/scan/:id"} component={ScanDetails} />
        <Route path={"/scan-new"} component={ScanForm} />
        <Route path={"/report/:id"} component={VulnerabilityReport} />
        <Route path={"/reports"} component={Reports} />
        <Route path={"/notifications"} component={Notifications} />
        {user.role === "admin" && <Route path={"/team"} component={TeamManagement} />}
        {user.role === "admin" && <Route path={"/admin"} component={AdminPanel} />}
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
