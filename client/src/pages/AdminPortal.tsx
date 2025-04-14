import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import MenuItemTable from '@/components/admin/MenuItemTable';
import CustomerDataTable from '@/components/admin/CustomerDataTable';
import RestaurantSettings from '@/components/admin/RestaurantSettings';
import { Utensils, Users, Settings, BarChart } from 'lucide-react';

export default function AdminPortal() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("menu-management");

  return (
    <div>
      {/* Admin Tabs Navigation */}
      <div className="bg-white rounded-lg p-4 shadow-md mb-6">
        <h2 className="font-heading text-2xl mb-4 text-neutral-darker">Admin Dashboard</h2>
        <Tabs defaultValue="menu-management" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="border-b w-full justify-start space-x-6 bg-transparent">
            <TabsTrigger 
              value="menu-management" 
              className="border-b-2 border-transparent px-1 pb-3 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              <Utensils className="h-4 w-4 mr-2" />
              Menu Management
            </TabsTrigger>
            <TabsTrigger 
              value="customer-data" 
              className="border-b-2 border-transparent px-1 pb-3 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              <Users className="h-4 w-4 mr-2" />
              Customer Data
            </TabsTrigger>
            <TabsTrigger 
              value="restaurant-settings" 
              className="border-b-2 border-transparent px-1 pb-3 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              <Settings className="h-4 w-4 mr-2" />
              Restaurant Settings
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="border-b-2 border-transparent px-1 pb-3 data-[state=active]:border-primary data-[state=active]:text-primary"
              disabled
            >
              <BarChart className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>
          
          {/* Tab Content */}
          <TabsContent value="menu-management" className="mt-6 p-0">
            <MenuItemTable />
          </TabsContent>
          
          <TabsContent value="customer-data" className="mt-6 p-0">
            <CustomerDataTable />
          </TabsContent>
          
          <TabsContent value="restaurant-settings" className="mt-6 p-0">
            <RestaurantSettings />
          </TabsContent>
          
          <TabsContent value="reports" className="mt-6 p-0">
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-neutral-dark">Reports feature coming soon!</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
