import { 
  type RestaurantSettings, type InsertRestaurantSettings,
  type Category, type InsertCategory,
  type MenuItem, type InsertMenuItem, 
  type Customer, type InsertCustomer,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type OrderStatusType, type FullOrder, 
  OrderStatus
} from "@shared/schema";

// Storage interface for restaurant operations
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
}

export class MemStorage implements IStorage {
  private restaurantSettings: RestaurantSettings;
  private categories: Map<number, Category>;
  private menuItems: Map<number, MenuItem>;
  private customers: Map<number, Customer>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  
  private nextRestaurantId: number = 1;
  private nextCategoryId: number = 1;
  private nextMenuItemId: number = 1;
  private nextCustomerId: number = 1;
  private nextOrderId: number = 1;
  private nextOrderItemId: number = 1;
  
  constructor() {
    // Initialize with default restaurant settings
    this.restaurantSettings = {
      id: this.nextRestaurantId++,
      name: "Annapurna",
      tagline: "Authentic Indian Vegetarian Cuisine",
      address: "123 Food Street, Flavor Town, FT 12345",
      phoneNumber: "+91 1234 567890",
      email: "info@annapurnarestaurant.com",
      taxRate: 5,
      primaryColor: "#E64A19",
      secondaryColor: "#4CAF50",
      fontSelection: "default"
    };
    
    // Initialize empty maps for each entity
    this.categories = new Map();
    this.menuItems = new Map();
    this.customers = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    // Add some default categories
    const categories = [
      { name: "Starters", displayOrder: 1 },
      { name: "Main Course", displayOrder: 2 },
      { name: "Breads", displayOrder: 3 },
      { name: "Rice & Biryani", displayOrder: 4 },
      { name: "Desserts", displayOrder: 5 },
      { name: "Beverages", displayOrder: 6 }
    ];
    
    categories.forEach(cat => this.createCategory(cat));
    
    // Add some default menu items
    const menuItems = [
      {
        name: "Paneer Butter Masala",
        description: "Cottage cheese cubes in rich tomato and butter gravy.",
        price: 250,
        categoryId: 2, // Main Course
        imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        isCustomizable: true,
        isActive: true,
        customizationOptions: [
          {
            name: "Spice Level",
            type: "single",
            required: true,
            choices: [
              { name: "Mild" },
              { name: "Medium" },
              { name: "Hot" }
            ]
          },
          {
            name: "Add-ons",
            type: "multiple",
            required: false,
            choices: [
              { name: "Extra Paneer", price: 50 },
              { name: "Extra Gravy", price: 30 },
              { name: "Extra Butter", price: 20 }
            ]
          }
        ]
      },
      {
        name: "Masala Dosa",
        description: "Crispy rice crepe stuffed with spiced potato filling.",
        price: 180,
        categoryId: 1, // Starters
        imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        isCustomizable: true,
        isActive: true,
        customizationOptions: [
          {
            name: "Add-ons",
            type: "multiple",
            required: false,
            choices: [
              { name: "Extra Chutney", price: 20 },
              { name: "Extra Potato Filling", price: 40 }
            ]
          }
        ]
      },
      {
        name: "Vegetable Biryani",
        description: "Fragrant basmati rice cooked with vegetables and aromatic spices.",
        price: 220,
        categoryId: 4, // Rice & Biryani
        imageUrl: "https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        isCustomizable: true,
        isActive: true,
        customizationOptions: [
          {
            name: "Spice Level",
            type: "single",
            required: true,
            choices: [
              { name: "Mild" },
              { name: "Medium" },
              { name: "Hot" }
            ]
          }
        ]
      },
      {
        name: "Butter Naan",
        description: "Soft leavened bread brushed with butter.",
        price: 60,
        categoryId: 3, // Breads
        imageUrl: "https://images.unsplash.com/photo-1572057045486-77a0d118ae13?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        isCustomizable: false,
        isActive: true,
        customizationOptions: []
      },
      {
        name: "Gulab Jamun",
        description: "Deep-fried milk solids soaked in sugar syrup.",
        price: 120,
        categoryId: 5, // Desserts
        imageUrl: "https://images.unsplash.com/photo-1605197161470-5cb86a245ba4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        isCustomizable: false,
        isActive: true,
        customizationOptions: []
      }
    ];
    
    menuItems.forEach(item => this.createMenuItem(item));
  }
  
  /* Restaurant Settings Methods */
  async getRestaurantSettings(): Promise<RestaurantSettings> {
    return this.restaurantSettings;
  }
  
  async updateRestaurantSettings(settings: Partial<RestaurantSettings>): Promise<RestaurantSettings> {
    this.restaurantSettings = { ...this.restaurantSettings, ...settings };
    return this.restaurantSettings;
  }
  
  /* Category Methods */
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values())
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.nextCategoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory = { ...existingCategory, ...category };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }
  
  /* Menu Item Methods */
  async getAllMenuItems(activeOnly: boolean = false): Promise<MenuItem[]> {
    const items = Array.from(this.menuItems.values());
    return activeOnly ? items.filter(item => item.isActive) : items;
  }
  
  async getMenuItemById(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }
  
  async getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values())
      .filter(item => item.categoryId === categoryId);
  }
  
  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const id = this.nextMenuItemId++;
    const newMenuItem: MenuItem = { ...item, id };
    this.menuItems.set(id, newMenuItem);
    return newMenuItem;
  }
  
  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const existingItem = this.menuItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem = { ...existingItem, ...item };
    this.menuItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteMenuItem(id: number): Promise<boolean> {
    return this.menuItems.delete(id);
  }
  
  /* Customer Methods */
  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }
  
  async getCustomerById(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }
  
  async getCustomerByPhoneNumber(phoneNumber: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values())
      .find(customer => customer.phoneNumber === phoneNumber);
  }
  
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.nextCustomerId++;
    const now = new Date();
    const newCustomer: Customer = { ...customer, id, createdAt: now };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }
  
  /* Order Methods */
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersByStatus(status: OrderStatusType): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getOrdersByCustomerId(customerId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.nextOrderId++;
    const now = new Date();
    const newOrder: Order = { ...order, id, createdAt: now, updatedAt: now };
    this.orders.set(id, newOrder);
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: OrderStatusType): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) return undefined;
    
    const now = new Date();
    const updatedOrder: Order = { ...existingOrder, status, updatedAt: now };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  /* Order Item Methods */
  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);
  }
  
  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const id = this.nextOrderItemId++;
    const newOrderItem: OrderItem = { ...item, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }
  
  /* Full Order Methods */
  async getFullOrderById(id: number): Promise<FullOrder | undefined> {
    const order = await this.getOrderById(id);
    if (!order) return undefined;
    
    const customer = await this.getCustomerById(order.customerId);
    if (!customer) return undefined;
    
    const orderItems = await this.getOrderItemsByOrderId(id);
    const items = await Promise.all(orderItems.map(async (item) => {
      const menuItem = await this.getMenuItemById(item.menuItemId);
      return { ...item, menuItem: menuItem! };
    }));
    
    return { ...order, customer, items };
  }
  
  async getAllFullOrders(): Promise<FullOrder[]> {
    const orders = await this.getAllOrders();
    const fullOrders = await Promise.all(
      orders.map(order => this.getFullOrderById(order.id))
    );
    
    return fullOrders.filter((order): order is FullOrder => order !== undefined);
  }
}

export const storage = new MemStorage();
