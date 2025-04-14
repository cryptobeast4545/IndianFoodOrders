import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useFullOrder } from "@/hooks/useOrders";
import { OrderStatus } from "@/types";
import { format } from "date-fns";

interface OrderTrackingProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
}

export default function OrderTracking({ 
  isOpen, 
  onClose, 
  orderId 
}: OrderTrackingProps) {
  const { data: order, isLoading } = useFullOrder(isOpen ? orderId : null);
  
  // Format dates safely
  const formatDateSafe = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "h:mm a");
    } catch (e) {
      return "-";
    }
  };

  // Format order stages for the timeline
  const orderStages = [
    {
      id: "received",
      label: "Order Received",
      time: order?.createdAt ? formatDateSafe(order.createdAt) : "-",
      completed: true,
    },
    {
      id: "preparing",
      label: "Preparing Your Food",
      time: order?.status === OrderStatus.PREPARING || 
            order?.status === OrderStatus.READY || 
            order?.status === OrderStatus.COMPLETED
            ? formatDateSafe(order.updatedAt) : "Estimated",
      completed: order?.status === OrderStatus.PREPARING || 
                order?.status === OrderStatus.READY || 
                order?.status === OrderStatus.COMPLETED,
      active: order?.status === OrderStatus.PREPARING,
    },
    {
      id: "ready",
      label: "Ready for Pickup",
      time: order?.status === OrderStatus.READY || 
            order?.status === OrderStatus.COMPLETED
            ? formatDateSafe(order.updatedAt) : "Estimated",
      completed: order?.status === OrderStatus.READY || 
                order?.status === OrderStatus.COMPLETED,
      active: order?.status === OrderStatus.READY,
    },
    {
      id: "completed",
      label: "Completed",
      time: order?.status === OrderStatus.COMPLETED
            ? formatDateSafe(order.updatedAt) : "-",
      completed: order?.status === OrderStatus.COMPLETED,
      active: order?.status === OrderStatus.COMPLETED,
    },
  ];
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Track Your Order</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto mb-2"></div>
            <p>Loading order details...</p>
          </div>
        ) : !order ? (
          <div className="text-center py-4">
            <p className="text-neutral-dark">Order not found</p>
          </div>
        ) : (
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-neutral-dark">Order #{order.id}</p>
                <p className="font-medium">{order.items.length} items • ₹{order.totalAmount.toFixed(2)}</p>
              </div>
              <div className="bg-[#2196F3] bg-opacity-10 text-[#2196F3] px-3 py-1 rounded-full text-sm font-medium">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>
            
            {/* Order Status Timeline */}
            <div className="relative pb-8">
              {/* Vertical Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-medium"></div>
              
              {/* Timeline Stages */}
              {orderStages.map((stage, index) => (
                <div key={index} className="relative flex items-start mb-6 ml-2">
                  <div 
                    className={`absolute left-2 w-4 h-4 rounded-full transform -translate-x-1/2 mt-1 z-10 ${
                      stage.completed 
                        ? stage.active 
                          ? "bg-[#2196F3] pulse-notification" 
                          : "bg-[#4CAF50]" 
                        : "bg-neutral-medium"
                    }`}
                  ></div>
                  <div className="ml-6">
                    <p className={`font-medium ${!stage.completed ? "text-neutral-dark" : ""}`}>
                      {stage.label}
                    </p>
                    <p className="text-sm text-neutral-dark">{stage.time}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Items */}
            <div className="mt-4 border-t pt-4">
              <h4 className="font-medium text-neutral-darker mb-3">Order Details</h4>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.menuItem.name} x{item.quantity}</p>
                      {item.customizations && (
                        <p className="text-sm text-neutral-dark">
                          {typeof item.customizations === 'string' 
                            ? (() => {
                                try {
                                  const customizations = JSON.parse(item.customizations);
                                  return (
                                    <>
                                      {customizations.map((c: any, i: number) => (
                                        <span key={i} className="block">
                                          {c.optionName}: {c.selections.join(', ')}
                                        </span>
                                      ))}
                                    </>
                                  );
                                } catch (e) {
                                  return <span>Custom options</span>;
                                }
                              })()
                            : typeof item.customizations === 'object'
                              ? <span>{JSON.stringify(item.customizations)}</span>
                              : <span>Custom options</span>
                          }
                        </p>
                      )}
                    </div>
                    <p>₹{item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
