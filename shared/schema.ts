import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Restaurant settings
export const restaurantSettings = pgTable("restaurant_settings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Annapurna"),
  tagline: text("tagline").default("Authentic Indian Vegetarian Cuisine"),
  address: text("address"),
  phoneNumber: text("phone_number"),
  email: text("email"),
  taxRate: real("tax_rate").default(5),
  primaryColor: text("primary_color").default("#E64A19"),
  secondaryColor: text("secondary_color").default("#4CAF50"),
  fontSelection: text("font_selection").default("default"),
});

export const insertRestaurantSettingsSchema = createInsertSchema(restaurantSettings).omit({
  id: true,
});

// Menu category
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayOrder: integer("display_order").default(0),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

// Menu items
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  categoryId: integer("category_id").notNull(),
  imageUrl: text("image_url"),
  isCustomizable: boolean("is_customizable").default(true),
  isActive: boolean("is_active").default(true),
  customizationOptions: jsonb("customization_options"),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
});

// Customers
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

// Order status enum
export const OrderStatus = {
  NEW: "new",
  PREPARING: "preparing",
  READY: "ready",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  tableNumber: integer("table_number"),
  status: text("status").notNull().default(OrderStatus.NEW),
  totalAmount: real("total_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  specialInstructions: text("special_instructions"),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Order items (line items for each order)
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  menuItemId: integer("menu_item_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: real("price").notNull(),
  customizations: jsonb("customizations"),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

// Define types for each schema
export type RestaurantSettings = typeof restaurantSettings.$inferSelect;
export type InsertRestaurantSettings = z.infer<typeof insertRestaurantSettingsSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// Create full order type that includes customer and items
export type FullOrder = Order & {
  customer: Customer;
  items: (OrderItem & { menuItem: MenuItem })[];
};

// Type for customization options
export type CustomizationOption = {
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  choices: CustomizationChoice[];
};

export type CustomizationChoice = {
  name: string;
  price?: number;
};

// Type for applied customizations
export type AppliedCustomization = {
  optionName: string;
  selections: string[];
  additionalPrice: number;
};
