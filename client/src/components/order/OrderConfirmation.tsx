import { 
  Dialog, 
  DialogContent 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { FullOrder, OrderStatus } from "@/types";
import { useState } from "react";
import OrderTracking from "./OrderTracking";

interface OrderConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  order: FullOrder;
}

export default function OrderConfirmation({ 
  isOpen, 
  onClose, 
  order 
}: OrderConfirmationProps) {
  const [trackingOpen, setTrackingOpen] = useState(false);
  
  const handleTrackOrder = () => {
    setTrackingOpen(true);
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center p-4">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-status-success bg-opacity-10 rounded-full">
              <CheckCircle className="text-[#4CAF50] h-8 w-8" />
            </div>
            <h3 className="font-heading text-xl mb-2">Order Placed Successfully!</h3>
            <p className="text-neutral-dark mb-4">
              Your order #{order.id} has been received and is being prepared.
            </p>
            
            <div className="bg-neutral-light p-4 rounded-md mb-4 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-sm">Order Status:</span>
                <span className="font-medium text-[#2196F3]">
                  {order.status === OrderStatus.NEW ? "Preparing" : order.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Estimated Time:</span>
                <span className="font-medium">15-20 mins</span>
              </div>
            </div>
            
            <Button 
              className="w-full py-3 bg-primary text-white rounded-md font-medium hover:bg-opacity-90 mb-2"
              onClick={handleTrackOrder}
            >
              Track Your Order
            </Button>
            <Button 
              variant="outline"
              className="w-full py-3 border border-neutral-dark text-neutral-dark rounded-md hover:bg-neutral-medium"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <OrderTracking 
        isOpen={trackingOpen} 
        onClose={() => setTrackingOpen(false)} 
        orderId={order.id}
      />
    </>
  );
}
