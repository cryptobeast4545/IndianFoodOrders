import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import FoodCard from '@/components/food/FoodCard';
import CustomizationModal from '@/components/food/CustomizationModal';
import Cart from '@/components/cart/Cart';
import { useMenuItems, useCategories } from '@/hooks/useMenuItems';
import { useCart } from '@/hooks/useCart';
import { MenuItem, AppliedCustomization } from '@/types';
import { useRestaurantSettings } from '@/hooks/useRestaurantData';

export default function CustomerPortal() {
  const { data: settings } = useRestaurantSettings();
  const { data: menuItems, isLoading: loadingMenuItems } = useMenuItems(true);
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const { 
    cart,
    subtotal,
    tax,
    total,
    itemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    updateTaxRate
  } = useCart();

  // Set tax rate from restaurant settings
  useEffect(() => {
    if (settings?.taxRate) {
      updateTaxRate(settings.taxRate);
    }
  }, [settings, updateTaxRate]);

  // Filter menu items by category
  const filteredMenuItems = selectedCategoryId 
    ? menuItems?.filter(item => item.categoryId === selectedCategoryId)
    : menuItems;

  // Handle customization
  const handleOpenCustomization = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setIsCustomizationOpen(true);
  };

  // Handle add to cart (without customization)
  const handleAddToCart = (item: MenuItem) => {
    addToCart(item, 1, []);
  };

  // Handle add to cart (with customization)
  const handleAddCustomizedToCart = (
    item: MenuItem, 
    customizations: AppliedCustomization[],
    specialInstructions?: string
  ) => {
    addToCart(item, 1, customizations, specialInstructions);
  };

  return (
    <div>
      {/* Customer Welcome Banner */}
      <div className="bg-white rounded-lg p-6 shadow-md mb-6 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="font-heading text-2xl mb-2 text-neutral-darker">
            Welcome to <span className="font-['Satisfy',_cursive] text-primary">{settings?.name || "Annapurna"}</span>
          </h2>
          <p className="text-neutral-dark mb-4">{settings?.tagline || "Authentic Indian Vegetarian Cuisine. Place your order below."}</p>
          <a href="#menu" className="inline-block bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition">View Menu</a>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#4CAF50] to-transparent opacity-10"></div>
      </div>

      {/* Menu Section */}
      <div id="menu" className="mb-8">
        <h2 className="font-heading text-2xl mb-4 text-neutral-darker flex items-center">
          <span className="mr-2">🍽️</span> Our Menu
        </h2>
        
        {/* Menu Categories Tabs */}
        <div className="flex overflow-x-auto mb-4 pb-2 no-scrollbar">
          <Button
            variant={selectedCategoryId === null ? "default" : "outline"}
            className={`px-4 py-2 mr-2 whitespace-nowrap ${
              selectedCategoryId === null 
                ? "bg-primary text-white" 
                : "bg-white text-neutral-dark hover:bg-neutral-medium"
            }`}
            onClick={() => setSelectedCategoryId(null)}
          >
            All Items
          </Button>
          
          {loadingCategories ? (
            <div className="flex items-center px-4 py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              <span className="ml-2">Loading categories...</span>
            </div>
          ) : (
            categories?.map(category => (
              <Button
                key={category.id}
                variant={selectedCategoryId === category.id ? "default" : "outline"}
                className={`px-4 py-2 mr-2 whitespace-nowrap ${
                  selectedCategoryId === category.id 
                    ? "bg-primary text-white" 
                    : "bg-white text-neutral-dark hover:bg-neutral-medium"
                }`}
                onClick={() => setSelectedCategoryId(category.id)}
              >
                {category.name}
              </Button>
            ))
          )}
        </div>
        
        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingMenuItems ? (
            <div className="col-span-full py-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-neutral-dark">Loading menu items...</p>
            </div>
          ) : filteredMenuItems?.length === 0 ? (
            <div className="col-span-full py-8 text-center">
              <p className="text-neutral-dark">
                {selectedCategoryId ? "No items in this category" : "No menu items available"}
              </p>
            </div>
          ) : (
            filteredMenuItems?.map(item => (
              <FoodCard
                key={item.id}
                item={item}
                onCustomize={handleOpenCustomization}
                onAddToCart={handleAddToCart}
              />
            ))
          )}
        </div>
      </div>

      {/* Customization Modal */}
      <CustomizationModal
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        item={selectedMenuItem}
        onAddToCart={handleAddCustomizedToCart}
      />

      {/* Cart */}
      <Cart
        cart={cart}
        subtotal={subtotal}
        tax={tax}
        total={total}
        itemCount={itemCount}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onClearCart={clearCart}
      />
    </div>
  );
}
