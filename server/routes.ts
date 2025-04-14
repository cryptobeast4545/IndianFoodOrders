import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import * as ExcelJS from 'exceljs';
import { 
  insertRestaurantSettingsSchema, 
  insertMenuItemSchema, 
  insertCategorySchema,
  insertCustomerSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  OrderStatus
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Restaurant settings endpoints
  app.get("/api/settings", async (req, res) => {
    const settings = await storage.getRestaurantSettings();
    res.json(settings);
  });
  
  app.patch("/api/settings", async (req, res) => {
    try {
      const data = insertRestaurantSettingsSchema.partial().parse(req.body);
      const updatedSettings = await storage.updateRestaurantSettings(data);
      res.json(updatedSettings);
    } catch (error) {
      res.status(400).json({ error: "Invalid settings data" });
    }
  });
  
  // Category endpoints
  app.get("/api/categories", async (req, res) => {
    const categories = await storage.getAllCategories();
    res.json(categories);
  });
  
  app.post("/api/categories", async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const newCategory = await storage.createCategory(data);
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(400).json({ error: "Invalid category data" });
    }
  });
  
  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertCategorySchema.partial().parse(req.body);
      const updatedCategory = await storage.updateCategory(id, data);
      
      if (!updatedCategory) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      res.status(400).json({ error: "Invalid category data" });
    }
  });
  
  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCategory(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });
  
  // Menu item endpoints
  app.get("/api/menu-items", async (req, res) => {
    const activeOnly = req.query.activeOnly === 'true';
    const menuItems = await storage.getAllMenuItems(activeOnly);
    res.json(menuItems);
  });
  
  app.get("/api/menu-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const menuItem = await storage.getMenuItemById(id);
      
      if (!menuItem) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      
      res.json(menuItem);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });
  
  app.get("/api/categories/:categoryId/menu-items", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const menuItems = await storage.getMenuItemsByCategory(categoryId);
      res.json(menuItems);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });
  
  app.post("/api/menu-items", async (req, res) => {
    try {
      const data = insertMenuItemSchema.parse(req.body);
      const newMenuItem = await storage.createMenuItem(data);
      res.status(201).json(newMenuItem);
    } catch (error) {
      res.status(400).json({ error: "Invalid menu item data" });
    }
  });
  
  app.patch("/api/menu-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertMenuItemSchema.partial().parse(req.body);
      const updatedMenuItem = await storage.updateMenuItem(id, data);
      
      if (!updatedMenuItem) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      
      res.json(updatedMenuItem);
    } catch (error) {
      res.status(400).json({ error: "Invalid menu item data" });
    }
  });
  
  app.delete("/api/menu-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMenuItem(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });
  
  // Customer endpoints
  app.get("/api/customers", async (req, res) => {
    const customers = await storage.getAllCustomers();
    res.json(customers);
  });
  
  app.post("/api/customers", async (req, res) => {
    try {
      const data = insertCustomerSchema.parse(req.body);
      
      // Check if customer with this phone number already exists
      const existingCustomer = await storage.getCustomerByPhoneNumber(data.phoneNumber);
      if (existingCustomer) {
        return res.json(existingCustomer); // Return existing customer
      }
      
      const newCustomer = await storage.createCustomer(data);
      res.status(201).json(newCustomer);
    } catch (error) {
      res.status(400).json({ error: "Invalid customer data" });
    }
  });
  
  // Order endpoints
  app.get("/api/orders", async (req, res) => {
    const status = req.query.status as string;
    
    let orders;
    if (status && Object.values(OrderStatus).includes(status as any)) {
      orders = await storage.getOrdersByStatus(status as any);
    } else {
      orders = await storage.getAllOrders();
    }
    
    res.json(orders);
  });
  
  app.get("/api/orders/full", async (req, res) => {
    const fullOrders = await storage.getAllFullOrders();
    res.json(fullOrders);
  });
  
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });
  
  app.get("/api/orders/:id/full", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getFullOrderById(id);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });
  
  app.get("/api/customers/:customerId/orders", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const orders = await storage.getOrdersByCustomerId(customerId);
      res.json(orders);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });
  
  // Create new order with items
  app.post("/api/orders", async (req, res) => {
    try {
      console.log("Received order data:", JSON.stringify(req.body));
      
      // Validate order data
      const orderData = insertOrderSchema.parse(req.body.order);
      
      // Validate order items data and parse customizations if needed
      const orderItemsData = req.body.items.map((item: any) => {
        if (typeof item.customizations === 'string') {
          try {
            item.customizations = JSON.parse(item.customizations);
          } catch (e) {
            console.log("Failed to parse customizations", e);
            // Keep it as string if parsing fails
          }
        }
        return item;
      });
      
      // Validate parsed items
      const validatedItems = z.array(insertOrderItemSchema).parse(orderItemsData);
      
      // Create the order
      const newOrder = await storage.createOrder(orderData);
      
      // Create order items
      const orderItems = await Promise.all(
        validatedItems.map(item => 
          storage.createOrderItem({ ...item, orderId: newOrder.id })
        )
      );
      
      // Return the full order
      const fullOrder = await storage.getFullOrderById(newOrder.id);
      res.status(201).json(fullOrder);
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(400).json({ error: "Invalid order data" });
    }
  });
  
  // Update order status
  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!Object.values(OrderStatus).includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(id, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });
  
  // Export customer data to Excel
  app.get("/api/export/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      const fullOrders = await storage.getAllFullOrders();
      
      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Customer Data');
      
      // Define columns
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Phone Number', key: 'phoneNumber', width: 20 },
        { header: 'Total Orders', key: 'totalOrders', width: 15 },
        { header: 'Total Spent', key: 'totalSpent', width: 15 },
        { header: 'First Order Date', key: 'firstOrderDate', width: 20 },
        { header: 'Last Order Date', key: 'lastOrderDate', width: 20 }
      ];
      
      // Prepare data
      for (const customer of customers) {
        const customerOrders = fullOrders.filter(order => order.customerId === customer.id);
        const totalOrders = customerOrders.length;
        const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        
        // Sort orders by date
        const sortedOrders = customerOrders.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        });
        
        // Create dates safely with null checks
        // Get the first order's date safely
        let firstOrderDate: Date;
        if (sortedOrders.length > 0 && sortedOrders[0]?.createdAt) {
          firstOrderDate = new Date(String(sortedOrders[0].createdAt));
        } else if (customer.createdAt) {
          firstOrderDate = new Date(customer.createdAt.toString());
        } else {
          firstOrderDate = new Date();
        }
        
        // Get the last order's date safely
        let lastOrderDate: Date;
        const lastOrder = sortedOrders.length > 0 ? sortedOrders[sortedOrders.length - 1] : null;
        if (lastOrder && lastOrder.createdAt) {
          lastOrderDate = new Date(String(lastOrder.createdAt));
        } else if (customer.createdAt) {
          lastOrderDate = new Date(customer.createdAt.toString());
        } else {
          lastOrderDate = new Date();
        }
        
        worksheet.addRow({
          id: customer.id,
          name: customer.name,
          phoneNumber: customer.phoneNumber,
          totalOrders,
          totalSpent: `₹${totalSpent.toFixed(2)}`,
          firstOrderDate,
          lastOrderDate
        });
      }
      
      // Set header style
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
      
      // Write to buffer
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=customer-data.xlsx');
      
      // Send buffer
      res.send(Buffer.from(buffer));
    } catch (error) {
      res.status(500).json({ error: "Failed to export customer data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
