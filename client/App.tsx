import "./global.css";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter"; // Changed from react-router-dom

// --- PAGE IMPORTS ---
import Index from "./pages/Index";
import AuthPage from "./pages/Auth"; // Changed to match your file name
import UserDashboard from "./pages/Dashboard"; // Changed from 'Dashboard'
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Payment Return Handler Component
const PaymentReturn = () => {
  // This component just redirects to dashboard with query params
  // The backend already redirects to /dashboard?payment=...
  window.location.href = '/dashboard';
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      
      {/* ROUTING LOGIC */}
      <Switch>
        {/* 1. Landing Page */}
        <Route path="/" component={Index} />
        
        {/* 2. Authentication */}
        <Route path="/auth" component={AuthPage} />
        
        {/* 3. User Dashboard */}
        <Route path="/dashboard" component={UserDashboard} />
        
        {/* 4. Admin Dashboard */}
        <Route path="/dashboard-admin" component={AdminDashboard} />
        
        {/* 5. Payment Return Handler (redirects to dashboard) */}
        <Route path="/payment-return" component={PaymentReturn} />
        
        {/* 6. 404 Page (Catch-all) */}
        <Route component={NotFound} />
      </Switch>

    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
