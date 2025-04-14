import { 
  type RestaurantSettings,
  type Category,
  type MenuItem,
  type Customer,
  type Order,
  type OrderStatusType,
  type FullOrder,
  type CustomizationOption,
  type CustomizationChoice,
  type AppliedCustomization,
  OrderStatus
} from "@shared/schema";

// Re-export types from schema
export type {
  RestaurantSettings,
  Category,
  MenuItem,
  Customer,
  Order,
  OrderStatusType,
  FullOrder,
  CustomizationOption,
  CustomizationChoice,
  AppliedCustomization
};

export { OrderStatus };

// Cart Item type
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  customizations: AppliedCustomization[];
  totalPrice: number;
  specialInstructions?: string;
}

// Portal types
export type PortalType = 'customer' | 'staff' | 'admin';
