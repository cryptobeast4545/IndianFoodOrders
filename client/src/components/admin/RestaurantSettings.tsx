import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRestaurantSettings, useUpdateRestaurantSettings } from "@/hooks/useRestaurantData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";

export default function RestaurantSettings() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useRestaurantSettings();
  const { mutate: updateSettings, isPending: isSaving } = useUpdateRestaurantSettings();
  
  // Form state
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#E64A19");
  const [secondaryColor, setSecondaryColor] = useState("#4CAF50");
  const [fontSelection, setFontSelection] = useState("default");
  const [taxRate, setTaxRate] = useState("5");
  const [notificationSound, setNotificationSound] = useState(true);
  const [notificationDesktop, setNotificationDesktop] = useState(true);
  const [orderTimeout, setOrderTimeout] = useState("30");
  
  // Initialize form with settings
  useEffect(() => {
    if (settings) {
      setName(settings.name);
      setTagline(settings.tagline || "");
      setAddress(settings.address || "");
      setPhoneNumber(settings.phoneNumber || "");
      setEmail(settings.email || "");
      setPrimaryColor(settings.primaryColor);
      setSecondaryColor(settings.secondaryColor);
      setFontSelection(settings.fontSelection);
      setTaxRate(settings.taxRate.toString());
    }
  }, [settings]);
  
  const handleSaveInformation = () => {
    updateSettings({
      name,
      tagline,
      address,
      phoneNumber,
      email,
    }, {
      onSuccess: () => {
        toast({
          title: "Settings Saved",
          description: "Restaurant information has been updated successfully."
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to save settings: ${error.message}`,
          variant: "destructive"
        });
      }
    });
  };
  
  const handleSaveTheme = () => {
    updateSettings({
      primaryColor,
      secondaryColor,
      fontSelection,
    }, {
      onSuccess: () => {
        toast({
          title: "Theme Applied",
          description: "Restaurant theme has been updated successfully."
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to save theme: ${error.message}`,
          variant: "destructive"
        });
      }
    });
  };
  
  const handleSaveSystemSettings = () => {
    const parsedTaxRate = parseFloat(taxRate);
    if (isNaN(parsedTaxRate) || parsedTaxRate < 0) {
      toast({
        title: "Invalid Tax Rate",
        description: "Please enter a valid tax rate percentage.",
        variant: "destructive"
      });
      return;
    }
    
    updateSettings({
      taxRate: parsedTaxRate,
    }, {
      onSuccess: () => {
        toast({
          title: "Settings Saved",
          description: "System settings have been updated successfully."
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to save settings: ${error.message}`,
          variant: "destructive"
        });
      }
    });
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-neutral-dark">Loading restaurant settings...</p>
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="font-heading text-xl mb-4 text-neutral-darker flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-primary h-5 w-5">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        Restaurant Settings
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Restaurant Information */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Restaurant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="restaurant-name">Restaurant Name</Label>
              <Input
                id="restaurant-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="logo">Logo</Label>
              <div className="flex items-center">
                <div className="w-15 h-15 mr-4 border rounded flex items-center justify-center bg-neutral-light">
                  <span className="text-sm text-neutral-dark">Logo Preview</span>
                </div>
                <Button variant="outline">Upload New</Button>
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="phone">Contact Number</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="pt-2">
              <Button 
                className="w-full bg-primary hover:bg-primary/90" 
                onClick={handleSaveInformation}
                disabled={isSaving}
              >
                <Save size={16} className="mr-1" />
                {isSaving ? "Saving..." : "Save Information"}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Theme Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center">
                  <input
                    type="color"
                    id="primary-color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-8 border border-neutral-medium rounded mr-2"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex items-center">
                  <input
                    type="color"
                    id="secondary-color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-8 border border-neutral-medium rounded mr-2"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="font-selection">Font Selection</Label>
                <Select
                  value={fontSelection}
                  onValueChange={setFontSelection}
                >
                  <SelectTrigger id="font-selection">
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default (Poppins/Open Sans)</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                    <SelectItem value="lato">Lato</SelectItem>
                    <SelectItem value="montserrat">Montserrat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-2">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90" 
                  onClick={handleSaveTheme}
                  disabled={isSaving}
                >
                  <Save size={16} className="mr-1" />
                  {isSaving ? "Applying..." : "Apply Theme"}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* System Settings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">System Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label className="block text-sm text-neutral-dark mb-1">Order Notifications</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notification-sound"
                      checked={notificationSound}
                      onCheckedChange={setNotificationSound}
                    />
                    <Label htmlFor="notification-sound">Sound</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notification-desktop"
                      checked={notificationDesktop}
                      onCheckedChange={setNotificationDesktop}
                    />
                    <Label htmlFor="notification-desktop">Desktop</Label>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="order-timeout">Order Timeout (minutes)</Label>
                <Input
                  id="order-timeout"
                  type="number"
                  value={orderTimeout}
                  onChange={(e) => setOrderTimeout(e.target.value)}
                  min="1"
                />
              </div>
              <div className="pt-2">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90" 
                  onClick={handleSaveSystemSettings}
                  disabled={isSaving}
                >
                  <Save size={16} className="mr-1" />
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
