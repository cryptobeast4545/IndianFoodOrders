import { useState } from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import CustomerPortal from "@/pages/CustomerPortal";
import StaffPortal from "@/pages/StaffPortal";
import AdminPortal from "@/pages/AdminPortal";
import NotFound from "@/pages/not-found";
import { PortalType } from "@/types";
import { useRestaurantSettings } from "@/hooks/useRestaurantData";

function App() {
  const [currentPortal, setCurrentPortal] = useState<PortalType>("customer");
  const { toast } = useToast();
  const { data: settings, isLoading } = useRestaurantSettings();

  const handleSwitchPortal = (portal: PortalType) => {
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

  return (
    <div className="min-h-screen flex flex-col bg-neutral-light">
      <Header 
        currentPortal={currentPortal} 
        onSwitchPortal={handleSwitchPortal} 
        restaurantName={settings?.name || "Restaurant"}
      />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {currentPortal === "customer" && <CustomerPortal />}
        {currentPortal === "staff" && <StaffPortal />}
        {currentPortal === "admin" && <AdminPortal />}
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;
