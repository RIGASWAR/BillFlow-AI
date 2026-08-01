import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Inventory from "@/pages/Inventory";
import Sales from "@/pages/Sales";
import CustomerPortal from "@/pages/CustomerPortal";
import AdminLogin from "@/pages/AdminLogin";
import CustomerLogin from "@/pages/CustomerLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth pages */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/portal/login" element={<CustomerLogin />} />

            {/* Customer Portal (protected) */}
            <Route
              path="/portal"
              element={
                <ProtectedRoute requiredRole="customer" redirectTo="/portal/login">
                  <CustomerPortal />
                </ProtectedRoute>
              }
            />

            {/* Admin routes (protected) */}
            <Route
              path="/*"
              element={
                <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/sales" element={<Sales />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
