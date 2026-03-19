import "./global.css";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";

// --- CORE PAGE IMPORTS ---
import Index from "./pages/Index";
import AuthPage from "./pages/Auth"; 
import UserDashboard from "./pages/Dashboard"; 
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

// --- NEW INFO & POLICY PAGES ---
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

// Payment Return Handler Component
const PaymentReturn = () => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirects to dashboard smoothly while preserving any query parameters
    // (e.g., /dashboard?payment=success)
    setLocation('/dashboard' + window.location.search);
  }, [setLocation]);

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
        
        {/* 5. Payment Return Handler */}
        <Route path="/payment-return" component={PaymentReturn} />

        {/* 6. Info & Policy Pages */}
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/refund" component={Refund} />
        <Route path="/contact" component={Contact} />
        
        {/* 7. 404 Page (Catch-all) */}
        <Route component={NotFound} />
      </Switch>

    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);