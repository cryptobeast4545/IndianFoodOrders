import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/types";

interface FoodCardProps {
  item: MenuItem;
  onCustomize: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem) => void;
}

export default function FoodCard({ item, onCustomize, onAddToCart }: FoodCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="h-48 w-full overflow-hidden">
        <img 
          src={item.imageUrl || "https://via.placeholder.com/500x500?text=No+Image"} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-heading font-semibold text-lg">{item.name}</h3>
          <span className="bg-[#4CAF50] text-white px-1.5 py-0.5 rounded text-xs">VEG</span>
        </div>
        <p className="text-neutral-dark text-sm mt-1 line-clamp-2">{item.description}</p>
        <div className="flex justify-between items-center mt-3">
          <p className="font-semibold text-neutral-darker">₹{item.price.toFixed(2)}</p>
          <div className="flex space-x-2">
            {item.isCustomizable && (
              <Button 
                variant="outline" 
                className="px-2 py-1 border border-primary text-primary rounded-md text-sm hover:bg-primary hover:text-white" 
                onClick={() => onCustomize(item)}
              >
                Customize
              </Button>
            )}
            <Button 
              className="px-2 py-1 bg-primary text-white rounded-md text-sm hover:bg-opacity-90" 
              onClick={() => onAddToCart(item)}
            >
              Add +
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
