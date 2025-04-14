import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import CustomerPortal from "@/pages/CustomerPortal";
import StaffPortal from "@/pages/StaffPortal";
import AdminPortal from "@/pages/AdminPortal";
import NotFound from "@/pages/not-found";
import LoginPage from "./pages/LoginPage";
import { PortalType } from "@/types";
import { useRestaurantSettings } from "@/hooks/useRestaurantData";

function App() {
  const [currentPortal, setCurrentPortal] = useState<PortalType>("customer");
  const [isAuthenticated, setIsAuthenticated] = useState<{
    staff: boolean;
    admin: boolean;
  }>({
    staff: false,
    admin: false
  });
  
  const { toast } = useToast();
  const { data: settings, isLoading } = useRestaurantSettings();
  const [location, setLocation] = useLocation();

  // Handle authentication
  const handleLogin = (portalType: "staff" | "admin", password: string) => {
    // Define passwords (in a real app, these would be stored securely)
    const staffPassword = "staff123";
    const adminPassword = "admin123";
    
    if (portalType === "staff" && password === staffPassword) {
      setIsAuthenticated(prev => ({ ...prev, staff: true }));
      setCurrentPortal("staff");
      toast({
        title: "Staff Login Successful",
        description: "Welcome to the Staff Portal",
      });
      return true;
    } else if (portalType === "admin" && password === adminPassword) {
      setIsAuthenticated(prev => ({ ...prev, admin: true }));
      setCurrentPortal("admin");
      toast({
        title: "Admin Login Successful",
        description: "Welcome to the Admin Portal",
      });
      return true;
    } else {
      toast({
        title: "Login Failed",
        description: "Incorrect password",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleLogout = (portalType: "staff" | "admin") => {
    setIsAuthenticated(prev => ({ 
      ...prev, 
      [portalType]: false 
    }));
    setCurrentPortal("customer");
    toast({
      title: "Logged Out",
      description: `You've been logged out from the ${portalType.charAt(0).toUpperCase() + portalType.slice(1)} Portal`,
    });
  };

  const handleSwitchPortal = (portal: PortalType) => {
    // If trying to access staff portal and not authenticated
    if (portal === "staff" && !isAuthenticated.staff) {
      setLocation("/login/staff");
      return;
    }
    
    // If trying to access admin portal and not authenticated
    if (portal === "admin" && !isAuthenticated.admin) {
      setLocation("/login/admin");
      return;
    }
    
    setCurrentPortal(portal);
    toast({
      title: `Switched to ${portal.charAt(0).toUpperCase() + portal.slice(1)} Portal`,
      duration: 1500,
    });
  };

  // Show loading while fetching initial restaurant settings
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-neutral-dark">Loading restaurant data...</p>
        </div>
      </div>
    );
  }

  // Handle routing
  if (location.startsWith('/login')) {
    const portalType = location.includes('staff') ? 'staff' : 'admin';
    return (
      <div className="min-h-screen flex flex-col bg-neutral-light">
        <Header 
          currentPortal="customer"
          onSwitchPortal={handleSwitchPortal} 
          restaurantName={settings?.name || "Restaurant"}
        />
        <main className="flex-grow container mx-auto px-4 py-6">
          <LoginPage 
            portalType={portalType as "staff" | "admin"} 
            onLogin={handleLogin}
          />
        </main>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-light">
      <Header 
        currentPortal={currentPortal} 
        onSwitchPortal={handleSwitchPortal} 
        restaurantName={settings?.name || "Restaurant"}
      />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {currentPortal === "customer" && <CustomerPortal />}
        {currentPortal === "staff" && isAuthenticated.staff && (
          <StaffPortal onLogout={() => handleLogout("staff")} />
        )}
        {currentPortal === "admin" && isAuthenticated.admin && (
          <AdminPortal onLogout={() => handleLogout("admin")} />
        )}
        {!location.startsWith('/login') && currentPortal === "staff" && !isAuthenticated.staff && (
          <div className="text-center py-8">
            <p>You need to be authenticated to access the Staff Portal.</p>
            <button 
              onClick={() => setLocation("/login/staff")}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
            >
              Login
            </button>
          </div>
        )}
        {!location.startsWith('/login') && currentPortal === "admin" && !isAuthenticated.admin && (
          <div className="text-center py-8">
            <p>You need to be authenticated to access the Admin Portal.</p>
            <button 
              onClick={() => setLocation("/login/admin")}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
            >
              Login
            </button>
          </div>
        )}
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;
