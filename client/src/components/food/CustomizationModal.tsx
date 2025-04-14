import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  MenuItem, 
  CustomizationOption, 
  CustomizationChoice, 
  AppliedCustomization
} from "@/types";

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onAddToCart: (
    item: MenuItem, 
    customizations: AppliedCustomization[], 
    specialInstructions?: string
  ) => void;
}

export default function CustomizationModal({ 
  isOpen, 
  onClose, 
  item, 
  onAddToCart 
}: CustomizationModalProps) {
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [additionalPrice, setAdditionalPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Reset state when item changes
  useEffect(() => {
    if (item) {
      setSpecialInstructions("");
      setSelections({});
      setAdditionalPrice(0);
      setTotalPrice(item?.price || 0);
    }
  }, [item]);
  
  // Update total price when additional price changes
  useEffect(() => {
    if (item) {
      setTotalPrice(item.price + additionalPrice);
    }
  }, [item, additionalPrice]);

  if (!item) return null;

  const customizationOptions = item.customizationOptions as CustomizationOption[] || [];

  // Handle radio selection (single choice)
  const handleSingleSelection = (optionName: string, value: string) => {
    // Find previous selection to calculate price difference
    const prevSelection = selections[optionName]?.[0];
    
    const option = customizationOptions.find(opt => opt.name === optionName);
    if (!option) return;
    
    // Calculate price adjustments
    if (prevSelection) {
      const prevChoice = option.choices.find(choice => choice.name === prevSelection);
      const newChoice = option.choices.find(choice => choice.name === value);
      
      const prevPrice = (prevChoice && typeof prevChoice.price === 'number') ? prevChoice.price : 0;
      const newPrice = (newChoice && typeof newChoice.price === 'number') ? newChoice.price : 0;
      
      setAdditionalPrice(prev => prev - prevPrice + newPrice);
    } else {
      const choice = option.choices.find(choice => choice.name === value);
      if (choice && typeof choice.price === 'number') {
        setAdditionalPrice(prev => prev + choice.price);
      }
    }
    
    setSelections(prev => ({
      ...prev,
      [optionName]: [value]
    }));
  };

  // Handle checkbox selection (multiple choice)
  const handleMultipleSelection = (optionName: string, value: string, checked: boolean) => {
    const option = customizationOptions.find(opt => opt.name === optionName);
    if (!option) return;
    
    const choice = option.choices.find(choice => choice.name === value);
    if (!choice) return;
    
    // Update price based on selection/deselection
    if (checked && typeof choice.price === 'number') {
      setAdditionalPrice(prev => prev + choice.price);
    } else if (!checked && typeof choice.price === 'number') {
      setAdditionalPrice(prev => prev - choice.price);
    }
    
    // Update selections
    setSelections(prev => {
      const currentSelections = prev[optionName] || [];
      
      if (checked) {
        return {
          ...prev,
          [optionName]: [...currentSelections, value]
        };
      } else {
        return {
          ...prev,
          [optionName]: currentSelections.filter(item => item !== value)
        };
      }
    });
  };

  // Removed duplicate useEffect for totalPrice update

  // Prepare customizations for cart
  const getAppliedCustomizations = (): AppliedCustomization[] => {
    return Object.entries(selections).map(([optionName, selectedValues]) => {
      // Skip if no selections
      if (selectedValues.length === 0) return null;
      
      const option = customizationOptions.find(opt => opt.name === optionName);
      if (!option) return null;
      
      let additionalPrice = 0;
      
      // Calculate additional price
      selectedValues.forEach(value => {
        const choice = option.choices.find(choice => choice.name === value);
        if (choice && typeof choice.price === 'number') {
          additionalPrice += choice.price;
        }
      });
      
      return {
        optionName,
        selections: selectedValues,
        additionalPrice
      };
    }).filter((item): item is AppliedCustomization => item !== null);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    const customizations = getAppliedCustomizations();
    onAddToCart(item, customizations, specialInstructions || undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Customize Your Dish</DialogTitle>
        </DialogHeader>
        
        <div className="py-2">
          <h4 className="font-semibold text-lg">{item.name}</h4>
          
          {customizationOptions.map((option, index) => (
            <div key={index} className="mt-4">
              <h5 className="font-medium text-neutral-darker mb-2">{option.name}</h5>
              
              {option.type === 'single' ? (
                <RadioGroup 
                  value={selections[option.name]?.[0]} 
                  onValueChange={(value) => handleSingleSelection(option.name, value)}
                >
                  <div className="flex flex-wrap gap-2">
                    {option.choices.map((choice, choiceIndex) => (
                      <div key={choiceIndex} className="flex items-center">
                        <RadioGroupItem 
                          id={`${option.name}-${choiceIndex}`} 
                          value={choice.name} 
                          className="hidden"
                        />
                        <Label 
                          htmlFor={`${option.name}-${choiceIndex}`}
                          className={`px-3 py-1.5 border rounded-full text-sm cursor-pointer hover:bg-neutral-light ${
                            selections[option.name]?.[0] === choice.name 
                              ? 'border-primary bg-primary bg-opacity-10' 
                              : 'border-neutral-medium'
                          }`}
                        >
                          {choice.name} {choice.price ? `(+₹${choice.price})` : ''}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  {option.choices.map((choice, choiceIndex) => (
                    <label 
                      key={choiceIndex} 
                      className="flex items-center justify-between p-2 border border-neutral-medium rounded-md"
                    >
                      <div className="flex items-center">
                        <Checkbox 
                          id={`${option.name}-${choiceIndex}`}
                          checked={selections[option.name]?.includes(choice.name) || false}
                          onCheckedChange={(checked) => 
                            handleMultipleSelection(option.name, choice.name, checked === true)
                          }
                        />
                        <span className="ml-2 text-sm">{choice.name}</span>
                      </div>
                      {choice.price && <span className="text-sm">+₹{choice.price}</span>}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* Special Instructions */}
          <div className="mt-4">
            <h5 className="font-medium text-neutral-darker mb-2">Special Instructions</h5>
            <Textarea 
              placeholder="Any special requests or allergies?"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        
        <DialogFooter className="p-4 border-t bg-neutral-light">
          <div className="w-full">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Item Total:</span>
              <span className="font-semibold">₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button className="flex-1 bg-primary" onClick={handleAddToCart}>
                Add to Order
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
