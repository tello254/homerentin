import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Code-split pages: each loads on demand, so the initial bundle stays small
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthPage = lazy(() => import("./components/AuthPage"));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Shown while a lazily-loaded page chunk downloads
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-kisu-green" aria-label="Loading" />
  </div>
);

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
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
