import { useState } from "react";
import { Button } from "@/components/ui/button";
import CheckoutModal from "./CheckoutModal";
import { CartItem } from "@/types";
import { useRestaurantSettings } from "@/hooks/useRestaurantData";

interface CartProps {
  cart: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
  onRemoveItem: (index: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onClearCart: () => void;
}

export default function Cart({
  cart,
  subtotal,
  tax,
  total,
  itemCount,
  onRemoveItem,
  onUpdateQuantity,
  onClearCart
}: CartProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { data: settings } = useRestaurantSettings();

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-40">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">Your Order</span>
              <div className="flex items-center">
                <span className="text-sm">{itemCount} items</span>
                <span className="mx-2 text-neutral-medium">•</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>
            <Button 
              className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90"
              onClick={handleOpenCheckout}
              disabled={cart.length === 0}
            >
              {cart.length === 0 ? "Cart Empty" : "Checkout"}
            </Button>
          </div>
        </div>
      </div>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        subtotal={subtotal}
        tax={tax}
        taxRate={settings?.taxRate || 5}
        total={total}
        onRemoveItem={onRemoveItem}
        onUpdateQuantity={onUpdateQuantity}
        onClearCart={onClearCart}
      />
    </>
  );
}
