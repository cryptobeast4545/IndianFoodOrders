import { storage } from "./storage";
import { OrderStatus } from "@shared/schema";
import { log } from "./vite";

/**
 * Seed initial data into the database if it's empty
 */
export async function seedInitialData() {
  try {
    log("Checking if initial data needs to be seeded...", "seed");
    
    // Check if we have any categories already
    const existingCategories = await storage.getAllCategories();
    if (existingCategories.length > 0) {
      log("Database already has data, skipping seed", "seed");
      return;
    }
    
    log("Seeding initial data...", "seed");
    
    // Create categories
    const categories = [
      { name: "Starters", displayOrder: 1 },
      { name: "Main Course", displayOrder: 2 },
      { name: "Breads", displayOrder: 3 },
      { name: "Rice", displayOrder: 4 },
      { name: "Desserts", displayOrder: 5 },
      { name: "Beverages", displayOrder: 6 }
    ];
    
    for (const category of categories) {
      await storage.createCategory(category);
    }
    
    log("Created categories", "seed");
    
    // Create menu items
    const menuItems = [
      { 
        name: "Paneer Butter Masala", 
        description: "Cottage cheese cubes in a rich tomato and butter gravy",
        price: 350,
        categoryId: 2,
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
        name: "Veg Fried Rice", 
        description: "Aromatic basmati rice stir-fried with mixed vegetables",
        price: 250,
        categoryId: 4,
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
              { name: "Extra Vegetables", price: 40 },
              { name: "Fried Egg", price: 60 }
            ]
          }
        ]
      },
      { 
        name: "Masala Dosa", 
        description: "Crispy rice crepe filled with spiced potato filling",
        price: 180,
        categoryId: 1,
        isCustomizable: true,
        isActive: true,
        customizationOptions: [
          {
            name: "Type",
            type: "single",
            required: true,
            choices: [
              { name: "Regular" },
              { name: "Paper", price: 20 },
              { name: "Rava", price: 30 }
            ]
          },
          {
            name: "Add-ons",
            type: "multiple",
            required: false,
            choices: [
              { name: "Extra Potato Filling", price: 40 },
              { name: "Extra Chutney", price: 20 }
            ]
          }
        ]
      },
      { 
        name: "Garlic Naan", 
        description: "Soft bread with garlic and butter, baked in tandoor",
        price: 80,
        categoryId: 3,
        isCustomizable: true,
        isActive: true,
        customizationOptions: [
          {
            name: "Type",
            type: "single",
            required: true,
            choices: [
              { name: "Regular" },
              { name: "Butter", price: 20 },
              { name: "Stuffed", price: 50 }
            ]
          }
        ]
      },
      { 
        name: "Gulab Jamun", 
        description: "Deep-fried milk solids soaked in sugar syrup",
        price: 120,
        categoryId: 5,
        isCustomizable: true,
        isActive: true,
        customizationOptions: [
          {
            name: "Extras",
            type: "multiple",
            required: false,
            choices: [
              { name: "Ice Cream", price: 40 },
              { name: "Dry Fruits", price: 30 }
            ]
          }
        ]
      },
      { 
        name: "Masala Chai", 
        description: "Spiced tea with milk",
        price: 70,
        categoryId: 6,
        isCustomizable: true,
        isActive: true,
        customizationOptions: [
          {
            name: "Sweetness",
            type: "single",
            required: true,
            choices: [
              { name: "Low Sugar" },
              { name: "Regular" },
              { name: "Extra Sweet" }
            ]
          },
          {
            name: "Add-ons",
            type: "multiple",
            required: false,
            choices: [
              { name: "Ginger", price: 10 },
              { name: "Cardamom", price: 10 }
            ]
          }
        ]
      }
    ];
    
    for (const item of menuItems) {
      await storage.createMenuItem(item);
    }
    
    log("Created menu items", "seed");
    
    // Set restaurant settings
    await storage.updateRestaurantSettings({
      id: 1,
      name: "Annapurna",
      tagline: "Authentic Indian Vegetarian Cuisine",
      taxRate: 5,
      primaryColor: "#E64A19",
      secondaryColor: "#4CAF50"
    });
    
    log("Set initial restaurant settings", "seed");
    log("Database seeding complete!", "seed");
    
  } catch (error) {
    log(`Error seeding database: ${error}`, "seed");
  }
}