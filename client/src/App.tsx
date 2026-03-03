import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import FavoritesPage from "./pages/FavoritesPage";
import NotificationSettingsPage from "./pages/NotificationSettingsPage";
import DashboardPage from "./pages/DashboardPage";
import EventsPage from "./pages/EventsPage";
import TenantsPage from "./pages/TenantsPage";
import TicketsPage from "./pages/TicketsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import InfrastructurePage from "./pages/InfrastructurePage";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={DashboardPage} />
      <Route path={"/map"} component={MapPage} />
      <Route path={"/events"} component={EventsPage} />
      <Route path={"/tenants"} component={TenantsPage} />
      <Route path={"/tickets"} component={TicketsPage} />
      <Route path={"/analytics"} component={AnalyticsPage} />
      <Route path={"/infrastructure"} component={InfrastructurePage} />
      <Route path={"/favorites"} component={FavoritesPage} />
      <Route path={"/notification-settings"} component={NotificationSettingsPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
