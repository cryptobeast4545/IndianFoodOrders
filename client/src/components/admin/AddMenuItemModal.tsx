import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAddMenuItem, useUpdateMenuItem, useCategories } from "@/hooks/useMenuItems";
import { Category, MenuItem, CustomizationOption } from "@/types";
import { X, Plus, Trash } from "lucide-react";

interface AddMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: MenuItem | null;
}

export default function AddMenuItemModal({
  isOpen,
  onClose,
  editItem = null,
}: AddMenuItemModalProps) {
  const { toast } = useToast();
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { mutate: addMenuItem, isPending: isAddingItem } = useAddMenuItem();
  const { mutate: updateMenuItem, isPending: isUpdatingItem } = useUpdateMenuItem();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isCustomizable, setIsCustomizable] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOption[]>([]);
  
  // Reset form when opening modal or changing edit item
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setName(editItem.name);
        setDescription(editItem.description || "");
        setPrice(editItem.price.toString());
        setCategoryId(editItem.categoryId);
        setImageUrl(editItem.imageUrl || "");
        setIsCustomizable(editItem.isCustomizable);
        setIsActive(editItem.isActive);
        setCustomizationOptions(editItem.customizationOptions as CustomizationOption[] || []);
      } else {
        setName("");
        setDescription("");
        setPrice("");
        setCategoryId(null);
        setImageUrl("");
        setIsCustomizable(true);
        setIsActive(true);
        setCustomizationOptions([]);
      }
    }
  }, [isOpen, editItem]);
  
  // Add a new empty customization option
  const addCustomizationOption = () => {
    setCustomizationOptions([
      ...customizationOptions,
      {
        name: "",
        type: "single",
        required: false,
        choices: [{ name: "" }]
      }
    ]);
  };
  
  // Remove a customization option
  const removeCustomizationOption = (index: number) => {
    setCustomizationOptions(customizationOptions.filter((_, i) => i !== index));
  };
  
  // Update a customization option
  const updateCustomizationOption = (index: number, field: keyof CustomizationOption, value: any) => {
    const updated = [...customizationOptions];
    updated[index] = { ...updated[index], [field]: value };
    setCustomizationOptions(updated);
  };
  
  // Add a choice to a customization option
  const addChoice = (optionIndex: number) => {
    const updated = [...customizationOptions];
    updated[optionIndex].choices.push({ name: "" });
    setCustomizationOptions(updated);
  };
  
  // Remove a choice from a customization option
  const removeChoice = (optionIndex: number, choiceIndex: number) => {
    const updated = [...customizationOptions];
    updated[optionIndex].choices = updated[optionIndex].choices.filter((_, i) => i !== choiceIndex);
    setCustomizationOptions(updated);
  };
  
  // Update a choice in a customization option
  const updateChoice = (optionIndex: number, choiceIndex: number, field: keyof CustomizationOption["choices"][0], value: any) => {
    const updated = [...customizationOptions];
    updated[optionIndex].choices[choiceIndex] = { 
      ...updated[optionIndex].choices[choiceIndex], 
      [field]: value 
    };
    setCustomizationOptions(updated);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast({ title: "Please enter a valid price", variant: "destructive" });
      return;
    }
    
    if (!categoryId) {
      toast({ title: "Please select a category", variant: "destructive" });
      return;
    }
    
    // Validate customization options if present
    if (customizationOptions.length > 0) {
      for (let i = 0; i < customizationOptions.length; i++) {
        const option = customizationOptions[i];
        
        if (!option.name.trim()) {
          toast({ 
            title: "Customization option name cannot be empty", 
            variant: "destructive" 
          });
          return;
        }
        
        if (option.choices.length === 0) {
          toast({ 
            title: `Customization option "${option.name}" must have at least one choice`, 
            variant: "destructive" 
          });
          return;
        }
        
        for (let j = 0; j < option.choices.length; j++) {
          if (!option.choices[j].name.trim()) {
            toast({ 
              title: `Choice name cannot be empty in "${option.name}"`, 
              variant: "destructive" 
            });
            return;
          }
        }
      }
    }
    
    const menuItemData = {
      name,
      description,
      price: parseFloat(price),
      categoryId,
      imageUrl: imageUrl || undefined,
      isCustomizable,
      isActive,
      customizationOptions: isCustomizable && customizationOptions.length > 0
        ? customizationOptions
        : []
    };
    
    if (editItem) {
      // Update existing item
      updateMenuItem(
        { id: editItem.id, ...menuItemData },
        {
          onSuccess: () => {
            toast({ title: "Menu item updated successfully" });
            onClose();
          },
          onError: (error) => {
            toast({
              title: "Failed to update menu item",
              description: error.message,
              variant: "destructive"
            });
          }
        }
      );
    } else {
      // Add new item
      addMenuItem(menuItemData, {
        onSuccess: () => {
          toast({ title: "Menu item added successfully" });
          onClose();
        },
        onError: (error) => {
          toast({
            title: "Failed to add menu item",
            description: error.message,
            variant: "destructive"
          });
        }
      });
    }
  };
  
  const isPending = isAddingItem || isUpdatingItem;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editItem ? "Edit Menu Item" : "Add Menu Item"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Paneer Butter Masala"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={categoryId?.toString() || ""}
                onValueChange={(value) => setCategoryId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {loadingCategories ? (
                    <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                  ) : categories?.length === 0 ? (
                    <SelectItem value="none" disabled>No categories available</SelectItem>
                  ) : (
                    categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 250"
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={isActive ? "active" : "inactive"}
                onValueChange={(value) => setIsActive(value === "active")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the dish"
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="URL to the dish image"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isCustomizable"
              checked={isCustomizable}
              onCheckedChange={setIsCustomizable}
            />
            <Label htmlFor="isCustomizable">Allow Customization</Label>
          </div>
          
          {isCustomizable && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Customization Options</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomizationOption}
                  className="text-primary text-sm hover:bg-primary hover:text-white"
                >
                  <Plus size={16} className="mr-1" /> Add Option
                </Button>
              </div>
              
              <div className="space-y-4">
                {customizationOptions.map((option, optionIndex) => (
                  <div key={optionIndex} className="border border-neutral-medium rounded-md p-3">
                    <div className="flex justify-between items-center mb-2">
                      <Input
                        value={option.name}
                        onChange={(e) => updateCustomizationOption(optionIndex, "name", e.target.value)}
                        placeholder="Option name (e.g. Spice Level)"
                        className="max-w-[70%]"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomizationOption(optionIndex)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <Label className="text-xs">Option Type</Label>
                        <Select
                          value={option.type}
                          onValueChange={(value) => updateCustomizationOption(
                            optionIndex, 
                            "type", 
                            value as "single" | "multiple"
                          )}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single Choice</SelectItem>
                            <SelectItem value="multiple">Multiple Choice</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Required?</Label>
                        <Select
                          value={option.required ? "yes" : "no"}
                          onValueChange={(value) => updateCustomizationOption(
                            optionIndex, 
                            "required", 
                            value === "yes"
                          )}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="mt-2 space-y-2">
                      <Label className="text-xs">Choices</Label>
                      {option.choices.map((choice, choiceIndex) => (
                        <div key={choiceIndex} className="grid grid-cols-6 gap-2 items-center">
                          <div className="col-span-3">
                            <Input
                              value={choice.name}
                              onChange={(e) => updateChoice(
                                optionIndex, 
                                choiceIndex, 
                                "name", 
                                e.target.value
                              )}
                              placeholder="Option name"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={choice.price?.toString() || ""}
                              onChange={(e) => updateChoice(
                                optionIndex, 
                                choiceIndex, 
                                "price", 
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )}
                              placeholder="Price (optional)"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="col-span-1 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeChoice(optionIndex, choiceIndex)}
                              disabled={option.choices.length <= 1}
                              className="h-8 w-8 p-0 text-red-500"
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addChoice(optionIndex)}
                        className="text-primary text-sm hover:bg-primary/10"
                      >
                        <Plus size={16} className="mr-1" /> Add Choice
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={isPending}
            >
              {isPending
                ? (editItem ? "Updating..." : "Adding...")
                : (editItem ? "Update Item" : "Add Item")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
