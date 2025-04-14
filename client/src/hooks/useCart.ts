import { useState, useEffect } from 'react';
import { CartItem, MenuItem, AppliedCustomization } from '@/types';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [taxRate, setTaxRate] = useState(5); // Default tax rate
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  // Calculate totals whenever cart changes
  useEffect(() => {
    const newSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const newTax = (newSubtotal * taxRate) / 100;
    const newTotal = newSubtotal + newTax;

    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  }, [cart, taxRate]);

  // Add item to cart
  const addToCart = (
    menuItem: MenuItem, 
    quantity: number = 1, 
    customizations: AppliedCustomization[] = [],
    specialInstructions?: string
  ) => {
    // Calculate the total price including customizations
    const basePrice = menuItem.price * quantity;
    const customizationPrice = customizations.reduce(
      (sum, customization) => sum + customization.additionalPrice, 
      0
    );
    const totalPrice = basePrice + customizationPrice;

    // Create cart item
    const cartItem: CartItem = {
      menuItem,
      quantity,
      customizations,
      totalPrice,
      specialInstructions
    };

    setCart(prev => [...prev, cartItem]);
  };

  // Remove item from cart
  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  // Update item quantity
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;

    setCart(prev => {
      const newCart = [...prev];
      const item = newCart[index];
      
      // Recalculate price based on quantity
      const basePrice = item.menuItem.price * quantity;
      const customizationPrice = item.customizations.reduce(
        (sum, customization) => sum + customization.additionalPrice, 
        0
      );
      
      newCart[index] = {
        ...item,
        quantity,
        totalPrice: basePrice + customizationPrice
      };
      
      return newCart;
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Update tax rate
  const updateTaxRate = (rate: number) => {
    setTaxRate(rate);
  };

  return {
    cart,
    subtotal,
    tax,
    taxRate,
    total,
    itemCount: cart.length,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    updateTaxRate
  };
}
