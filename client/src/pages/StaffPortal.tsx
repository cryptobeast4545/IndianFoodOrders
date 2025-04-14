import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFullOrders, useOrdersByStatus, useUpdateOrderStatus } from '@/hooks/useOrders';
import { OrderStatus } from '@/types';
import OrderCard from '@/components/staff/OrderCard';
import OrderTable from '@/components/staff/OrderTable';
import { Search, Bell, LogOut } from 'lucide-react';

interface StaffPortalProps {
  onLogout?: () => void;
}

export default function StaffPortal({ onLogout }: StaffPortalProps) {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: allOrders, isLoading: loadingAllOrders } = useFullOrders();
  const { data: newOrders } = useOrdersByStatus(OrderStatus.NEW);
  const { data: preparingOrders } = useOrdersByStatus(OrderStatus.PREPARING);
  const { data: readyOrders } = useOrdersByStatus(OrderStatus.READY);

  // Get mutation function to update order status
  const { mutate: updateOrderStatus, isPending: isUpdating } = useUpdateOrderStatus();

  // Handle order status update
  const handleUpdateOrderStatus = (id: number, status: typeof OrderStatus[keyof typeof OrderStatus]) => {
    updateOrderStatus({ id, status }, {
      onSuccess: () => {
        toast({
          title: `Order #${id} updated`,
          description: `Status changed to ${status}`,
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error updating order",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  // Get active orders based on current filter
  const getFilteredOrders = () => {
    if (!allOrders) return [];
    
    let filtered = [...allOrders];
    
    // Filter by status if not "all"
    if (filterStatus !== "all") {
      filtered = filtered.filter(order => order.status === filterStatus);
    } else {
      // When showing all, prioritize active orders (all except completed)
      filtered = filtered.filter(order => order.status !== OrderStatus.COMPLETED);
    }
    
    // Apply search filter if present
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toString().includes(query) || 
        order.customer.name.toLowerCase().includes(query) ||
        (order.tableNumber && order.tableNumber.toString().includes(query))
      );
    }
    
    return filtered;
  };

  // Get active order count with notification
  const activeOrderCount = (newOrders?.length || 0);

  // Get recent orders (completed orders)
  const getRecentOrders = () => {
    if (!allOrders) return [];
    return allOrders
      .filter(order => order.status === OrderStatus.COMPLETED)
      .sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA; // Descending order
      })
      .slice(0, 10); // Show only last 10 completed orders
  };

  const filteredOrders = getFilteredOrders();
  const recentOrders = getRecentOrders();

  return (
    <div>
      <div className="bg-white rounded-lg p-6 shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-heading text-2xl text-neutral-darker">Staff Dashboard</h2>
          {onLogout && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogout}
              className="text-neutral-dark"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
          <Button 
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
            className={filterStatus === "all" ? "bg-primary" : ""}
          >
            All Orders
          </Button>
          <Button 
            variant={filterStatus === OrderStatus.NEW ? "default" : "outline"}
            onClick={() => setFilterStatus(OrderStatus.NEW)}
            className={filterStatus === OrderStatus.NEW ? "bg-[#FF9800] hover:bg-[#FF9800]/90" : ""}
          >
            New
            {newOrders && newOrders.length > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-white w-5 h-5 text-xs font-medium text-[#FF9800]">
                {newOrders.length}
              </span>
            )}
          </Button>
          <Button 
            variant={filterStatus === OrderStatus.PREPARING ? "default" : "outline"}
            onClick={() => setFilterStatus(OrderStatus.PREPARING)}
            className={filterStatus === OrderStatus.PREPARING ? "bg-[#2196F3] hover:bg-[#2196F3]/90" : ""}
          >
            Preparing
          </Button>
          <Button 
            variant={filterStatus === OrderStatus.READY ? "default" : "outline"}
            onClick={() => setFilterStatus(OrderStatus.READY)}
            className={filterStatus === OrderStatus.READY ? "bg-[#4CAF50] hover:bg-[#4CAF50]/90" : ""}
          >
            Ready
          </Button>
          <Button 
            variant={filterStatus === OrderStatus.COMPLETED ? "default" : "outline"}
            onClick={() => setFilterStatus(OrderStatus.COMPLETED)}
            className={filterStatus === OrderStatus.COMPLETED ? "bg-neutral-dark hover:bg-neutral-dark/90 text-white" : ""}
          >
            Completed
          </Button>
        </div>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search orders by ID or customer name"
            className="w-full p-3 pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-dark h-5 w-5" />
        </div>
      </div>
      
      {/* Active Orders Section */}
      <div className="mb-8">
        <h3 className="font-heading text-xl mb-4 text-neutral-darker flex items-center">
          <span className="relative">
            <Bell className="mr-2 text-primary h-5 w-5" />
            {activeOrderCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#F44336] text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {activeOrderCount}
              </span>
            )}
          </span>
          Active Orders
        </h3>
        
        {loadingAllOrders ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-neutral-dark">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-neutral-dark">No active orders found</p>
            {searchQuery && (
              <p className="text-sm mt-2">Try adjusting your search query</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onUpdateStatus={handleUpdateOrderStatus} 
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Order History Section */}
      <div>
        <h3 className="font-heading text-xl mb-4 text-neutral-darker">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2 text-primary h-5 w-5">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
          Recent Orders
        </h3>
        
        <OrderTable orders={recentOrders} />
      </div>
    </div>
  );
}
