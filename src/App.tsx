import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./components/AuthPage";
import AdminDashboard from './pages/AdminDashboard';

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'admin' | 'user'>('user'); // Track view mode

  // Check for existing user session on app load
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      setIsAuthenticated(true);
      setUser(userData);
      // Set initial view mode based on user type
      setViewMode(userData?.type === 'admin' ? 'admin' : 'user');
    }
  }, []);

  const handleLogin = (userData?: any) => {
    setIsAuthenticated(true);
    if (userData) {
      setUser(userData);
      // Set initial view mode based on user type
      setViewMode(userData?.type === 'admin' ? 'admin' : 'user');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setViewMode('user');
    localStorage.removeItem('currentUser');
  };

  const handleViewModeChange = (mode: 'admin' | 'user') => {
    setViewMode(mode);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  viewMode === 'admin' ? (
                    <Navigate to="/admin" replace />
                  ) : (
                    <Index onLogout={handleLogout} onViewModeChange={handleViewModeChange} user={user} />
                  )
                ) : (
                  <AuthPage onLogin={handleLogin} />
                )
              } 
            />
            <Route
              path="/admin"
              element={
                isAuthenticated && user?.type === 'admin' ? (
                  <AdminDashboard onLogout={handleLogout} onViewModeChange={handleViewModeChange} />
                ) : isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
