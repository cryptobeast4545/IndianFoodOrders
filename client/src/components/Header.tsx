import { PortalType } from "@/types";

interface HeaderProps {
  currentPortal: PortalType;
  onSwitchPortal: (portal: PortalType) => void;
  restaurantName: string;
}

export default function Header({ currentPortal, onSwitchPortal, restaurantName }: HeaderProps) {
  return (
    <header className="bg-primary shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="font-['Satisfy',_cursive] text-2xl md:text-3xl text-white">
            {restaurantName}
          </h1>
          <p className="ml-2 bg-[#4CAF50] text-white px-2 py-0.5 rounded-md text-xs">100% Veg</p>
        </div>
        
        {/* Portal Navigation */}
        <nav>
          <ul className="flex gap-2 md:gap-4 text-white text-sm">
            <li>
              <button 
                onClick={() => onSwitchPortal("customer")}
                className={`px-3 py-1 rounded-full transition ${
                  currentPortal === "customer" 
                    ? "bg-white bg-opacity-20" 
                    : "hover:bg-white hover:bg-opacity-20"
                }`}
              >
                Customer
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSwitchPortal("staff")}
                className={`px-3 py-1 rounded-full transition ${
                  currentPortal === "staff" 
                    ? "bg-white bg-opacity-20" 
                    : "hover:bg-white hover:bg-opacity-20"
                }`}
              >
                Staff
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSwitchPortal("admin")}
                className={`px-3 py-1 rounded-full transition ${
                  currentPortal === "admin" 
                    ? "bg-white bg-opacity-20" 
                    : "hover:bg-white hover:bg-opacity-20"
                }`}
              >
                Admin
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
