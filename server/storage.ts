import session from "express-session";
import { restaurantSettings, categories, menuItems, customers, 
  orders, orderItems, type OrderStatusType, type RestaurantSettings, 
  type Category, type MenuItem, type Customer, type Order, type OrderItem, 
  type InsertCategory, type InsertMenuItem, type InsertCustomer, 
  type InsertOrder, type InsertOrderItem, OrderStatus, type FullOrder
} from "@shared/schema";

export interface IStorage {
  // Restaurant settings
  getRestaurantSettings(): Promise<RestaurantSettings>;
  updateRestaurantSettings(settings: Partial<RestaurantSettings>): Promise<RestaurantSettings>;
  
  // Categories
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Menu items
  getAllMenuItems(activeOnly?: boolean): Promise<MenuItem[]>;
  getMenuItemById(id: number): Promise<MenuItem | undefined>;
  getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;
  
  // Customers
  getAllCustomers(): Promise<Customer[]>;
  getCustomerById(id: number): Promise<Customer | undefined>;
  getCustomerByPhoneNumber(phoneNumber: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  
  // Orders
  getAllOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getFullOrderById(id: number): Promise<FullOrder | undefined>;
  getOrdersByStatus(status: OrderStatusType): Promise<Order[]>;
  getOrdersByCustomerId(customerId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: OrderStatusType): Promise<Order | undefined>;
  
  // Order items
  getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  
  // Full orders with all related data
  getAllFullOrders(): Promise<FullOrder[]>;
  
  sessionStore: any;
}

import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { 
  eq, and, desc, sql, asc, isNull, ne
} from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getRestaurantSettings(): Promise<RestaurantSettings> {
    const [settings] = await db.select().from(restaurantSettings).limit(1);
    return settings || {
      id: 1,
      name: "Annapurna",
      tagline: "Authentic Indian Vegetarian Cuisine",
      taxRate: 5,
      primaryColor: "#E64A19",
      secondaryColor: "#4CAF50"
    };
  }

  async updateRestaurantSettings(settings: Partial<RestaurantSettings>): Promise<RestaurantSettings> {
    const [existingSettings] = await db.select().from(restaurantSettings).limit(1);
    
    if (existingSettings) {
      const [updated] = await db
        .update(restaurantSettings)
        .set(settings)
        .where(eq(restaurantSettings.id, existingSettings.id))
        .returning();
      return updated;
    } else {
      // Create first restaurant settings
      const [newSettings] = await db
        .insert(restaurantSettings)
        .values({ id: 1, ...settings })
        .returning();
      return newSettings;
    }
  }

  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(asc(categories.displayOrder));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: number): Promise<boolean> {
    await db.delete(categories).where(eq(categories.id, id));
    return true;
  }

  async getAllMenuItems(activeOnly: boolean = false): Promise<MenuItem[]> {
    if (activeOnly) {
      return db.select().from(menuItems).where(eq(menuItems.isActive, true));
    }
    return db.select().from(menuItems);
  }

  async getMenuItemById(id: number): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item;
  }

  async getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]> {
    return db
      .select()
      .from(menuItems)
      .where(
        and(
          eq(menuItems.categoryId, categoryId),
          eq(menuItems.isActive, true)
        )
      );
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db
      .insert(menuItems)
      .values(item)
      .returning();
    return newItem;
  }

  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const [updated] = await db
      .update(menuItems)
      .set(item)
      .where(eq(menuItems.id, id))
      .returning();
    return updated;
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
    return true;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return db.select().from(customers);
  }

  async getCustomerById(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomerByPhoneNumber(phoneNumber: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.phoneNumber, phoneNumber));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    // Check if customer exists first
    const existingCustomer = await this.getCustomerByPhoneNumber(customer.phoneNumber);
    if (existingCustomer) {
      // Update the existing customer name if provided
      if (customer.name && customer.name !== existingCustomer.name) {
        const [updated] = await db
          .update(customers)
          .set({ name: customer.name })
          .where(eq(customers.id, existingCustomer.id))
          .returning();
        return updated;
      }
      return existingCustomer;
    }

    // Create new customer
    const now = new Date();
    const [newCustomer] = await db
      .insert(customers)
      .values({ ...customer, createdAt: now })
      .returning();
    return newCustomer;
  }

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders);
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByStatus(status: OrderStatusType): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .where(eq(orders.status, status))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByCustomerId(customerId: number): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const now = new Date();
    const [newOrder] = await db
      .insert(orders)
      .values({
        ...order,
        status: OrderStatus.NEW,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return newOrder;
  }

  async updateOrderStatus(id: number, status: OrderStatusType): Promise<Order | undefined> {
    const now = new Date();
    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: now })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    return db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [newItem] = await db
      .insert(orderItems)
      .values(item)
      .returning();
    return newItem;
  }

  async getFullOrderById(id: number): Promise<FullOrder | undefined> {
    const order = await this.getOrderById(id);
    if (!order) return undefined;

    const customer = await this.getCustomerById(order.customerId);
    if (!customer) return undefined;

    const items = await this.getOrderItemsByOrderId(id);
    const fullItems = await Promise.all(
      items.map(async (item) => {
        const menuItem = await this.getMenuItemById(item.menuItemId);
        return { ...item, menuItem: menuItem! };
      })
    );

    return {
      ...order,
      customer,
      items: fullItems,
    };
  }

  async getAllFullOrders(): Promise<FullOrder[]> {
    const allOrders = await this.getAllOrders();
    return Promise.all(
      allOrders.map(async (order) => {
        const customer = await this.getCustomerById(order.customerId);
        const items = await this.getOrderItemsByOrderId(order.id);
        const fullItems = await Promise.all(
          items.map(async (item) => {
            const menuItem = await this.getMenuItemById(item.menuItemId);
            return { ...item, menuItem: menuItem! };
          })
        );

        return {
          ...order,
          customer: customer!,
          items: fullItems,
        };
      })
    );
  }
}

// Use database storage
export const storage = new DatabaseStorage();