import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCreateOrder } from "@/hooks/useOrders";
import { CartItem } from "@/types";
import { X, Plus, Minus } from "lucide-react";
import OrderConfirmation from "../order/OrderConfirmation";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  onRemoveItem: (index: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onClearCart: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  subtotal,
  tax,
  taxRate,
  total,
  onRemoveItem,
  onUpdateQuantity,
  onClearCart
}: CheckoutModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  const { mutate: createOrder, isPending } = useCreateOrder();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    
    if (!phoneNumber.trim()) {
      toast({ title: "Please enter your phone number", variant: "destructive" });
      return;
    }
    
    if (!tableNumber.trim()) {
      toast({ title: "Please enter your table number", variant: "destructive" });
      return;
    }
    
    const tableNum = parseInt(tableNumber);
    if (isNaN(tableNum) || tableNum <= 0) {
      toast({ title: "Please enter a valid table number", variant: "destructive" });
      return;
    }
    
    // Create order
    createOrder(
      {
        customer: {
          name,
          phoneNumber
        },
        cart,
        tableNumber: tableNum,
        specialInstructions: specialInstructions || undefined
      },
      {
        onSuccess: (data) => {
          setPlacedOrder(data);
          setOrderPlaced(true);
        },
        onError: (error) => {
          toast({
            title: "Failed to place order",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    );
  };

  const handleCloseConfirmation = () => {
    setOrderPlaced(false);
    onClearCart();
    onClose();
  };

  if (orderPlaced && placedOrder) {
    return (
      <OrderConfirmation
        isOpen={true}
        onClose={handleCloseConfirmation}
        order={placedOrder}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Complete Your Order</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="py-2">
          {/* Customer Information */}
          <div className="mb-5">
            <h4 className="font-medium text-neutral-darker mb-3">Your Information</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-sm text-neutral-dark">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm text-neutral-dark">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="table" className="text-sm text-neutral-dark">Table Number</Label>
                <Input
                  id="table"
                  type="number"
                  placeholder="Your table number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="instructions" className="text-sm text-neutral-dark">Special Instructions (Optional)</Label>
                <Input
                  id="instructions"
                  type="text"
                  placeholder="Any special instructions for the order"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <h4 className="font-medium text-neutral-darker mb-3">Order Summary</h4>
            <div className="max-h-60 overflow-y-auto mb-3 border rounded-md divide-y">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-start p-3">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{item.menuItem.name}</p>
                      <button 
                        type="button"
                        onClick={() => onRemoveItem(index)}
                        className="text-red-500 ml-2"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    {item.customizations.length > 0 && (
                      <p className="text-sm text-neutral-dark">
                        {item.customizations.map(c => 
                          `${c.optionName}: ${c.selections.join(', ')}`
                        ).join(' • ')}
                      </p>
                    )}
                    {item.specialInstructions && (
                      <p className="text-xs text-neutral-dark mt-1 italic">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                    <div className="flex items-center mt-1">
                      <button 
                        type="button"
                        onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                        className="p-1 text-neutral-dark"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="mx-2 text-sm">{item.quantity}</span>
                      <button 
                        type="button"
                        onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                        className="p-1 text-neutral-dark"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="font-medium whitespace-nowrap ml-4">₹{item.totalPrice.toFixed(2)}</p>
                </div>
              ))}
              
              {cart.length === 0 && (
                <div className="p-4 text-center text-neutral-dark">
                  Your cart is empty
                </div>
              )}
            </div>
            
            {/* Price Summary */}
            <div className="space-y-2 text-sm border-t pt-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST ({taxRate}%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="pt-5">
            <Button 
              type="submit" 
              className="w-full py-3 bg-primary text-white rounded-md font-medium hover:bg-opacity-90"
              disabled={isPending || cart.length === 0}
            >
              {isPending ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
