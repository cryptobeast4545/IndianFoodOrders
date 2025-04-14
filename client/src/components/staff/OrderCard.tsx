import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FullOrder, OrderStatus } from "@/types";
import { useState } from "react";
import OrderTracking from "../order/OrderTracking";
import { formatDistanceToNow } from "date-fns";
import { useUpdateOrderStatus } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";

interface OrderCardProps {
  order: FullOrder;
  onUpdateStatus: (id: number, status: typeof OrderStatus[keyof typeof OrderStatus]) => void;
}

export default function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();
  const { toast } = useToast();

  // Get the next status based on current status
  const getNextStatus = () => {
    switch (order.status) {
      case OrderStatus.NEW:
        return { status: OrderStatus.PREPARING, label: "Prepare" };
      case OrderStatus.PREPARING:
        return { status: OrderStatus.READY, label: "Ready" };
      case OrderStatus.READY:
        return { status: OrderStatus.COMPLETED, label: "Complete" };
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus();

  // Get border color based on status
  const getBorderColor = () => {
    switch (order.status) {
      case OrderStatus.NEW:
        return "border-[#FF9800]";
      case OrderStatus.PREPARING:
        return "border-[#2196F3]";
      case OrderStatus.READY:
        return "border-[#4CAF50]";
      case OrderStatus.COMPLETED:
        return "border-neutral-dark";
      default:
        return "border-neutral-medium";
    }
  };

  // Get background color for status badge
  const getStatusBgColor = () => {
    switch (order.status) {
      case OrderStatus.NEW:
        return "bg-[#FF9800] bg-opacity-10 text-[#FF9800]";
      case OrderStatus.PREPARING:
        return "bg-[#2196F3] bg-opacity-10 text-[#2196F3]";
      case OrderStatus.READY:
        return "bg-[#4CAF50] bg-opacity-10 text-[#4CAF50]";
      case OrderStatus.COMPLETED:
        return "bg-neutral-dark bg-opacity-10 text-neutral-dark";
      default:
        return "bg-neutral-medium bg-opacity-10 text-neutral-medium";
    }
  };

  // Format elapsed time
  const getElapsedTime = () => {
    try {
      return formatDistanceToNow(new Date(order.createdAt), { addSuffix: false });
    } catch (e) {
      return "unknown time";
    }
  };

  // Handle status update
  const handleUpdateStatus = () => {
    if (!nextStatus) return;
    
    updateStatus(
      { id: order.id, status: nextStatus.status },
      {
        onSuccess: () => {
          toast({
            title: "Order Status Updated",
            description: `Order #${order.id} is now ${nextStatus.status}`
          });
          onUpdateStatus(order.id, nextStatus.status);
        },
        onError: (error) => {
          toast({
            title: "Failed to update status",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <>
      <Card className={`overflow-hidden border-l-4 ${getBorderColor()}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-medium">#{order.id}</p>
              <p className="text-sm">{order.customer.name} • Table {order.tableNumber}</p>
            </div>
            <div className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBgColor()}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
          </div>
          
          <div className="border-t border-b py-3 my-3 text-sm">
            {order.items.map((item, index) => (
              <div key={index}>
                <p className="flex justify-between mb-1">
                  <span>{item.menuItem.name}</span>
                  <span>x{item.quantity}</span>
                </p>
                {item.customizations && (
                  <p className="text-xs text-neutral-dark ml-4 mb-2">
                    {JSON.stringify(item.customizations)}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <p>Ordered: <span className="font-medium">
                {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span></p>
              <p>Time elapsed: <span className={`font-medium ${
                order.status === OrderStatus.NEW ? "text-[#FF9800]" : ""
              }`}>
                {getElapsedTime()}
              </span></p>
            </div>
            <div className="flex space-x-2">
              {nextStatus && (
                <Button 
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    nextStatus.status === OrderStatus.PREPARING ? "bg-[#2196F3]" :
                    nextStatus.status === OrderStatus.READY ? "bg-[#4CAF50]" :
                    "bg-neutral-dark"
                  } text-white`}
                  onClick={handleUpdateStatus}
                  disabled={isPending}
                >
                  {isPending ? "Updating..." : nextStatus.label}
                </Button>
              )}
              <Button 
                variant="outline"
                className="px-3 py-1.5 bg-neutral-medium text-neutral-dark rounded-md text-sm font-medium"
                onClick={() => setDetailsOpen(true)}
              >
                Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <OrderTracking
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        orderId={order.id}
      />
    </>
  );
}
