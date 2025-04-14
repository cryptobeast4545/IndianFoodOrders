import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock } from 'lucide-react';

interface LoginPageProps {
  portalType: "staff" | "admin";
  onLogin: (portalType: "staff" | "admin", password: string) => boolean;
}

export default function LoginPage({ portalType, onLogin }: LoginPageProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter a password to continue",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Attempt login
    const success = onLogin(portalType, password);
    
    setTimeout(() => {
      setIsLoading(false);
      
      if (success) {
        // Redirect to home after successful login
        setLocation("/");
      }
    }, 500);
  };

  const handleBack = () => {
    setLocation("/");
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {portalType === "staff" ? "Staff Login" : "Admin Login"}
          </CardTitle>
          <CardDescription className="text-center">
            Enter your password to access the {portalType === "staff" ? "staff" : "admin"} portal
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-dark" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Login"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={handleBack}
            >
              Back to Customer Portal
            </Button>
          </CardFooter>
        </form>
      </Card>
      <div className="mt-6 p-4 bg-neutral-light rounded-md">
        <p className="text-sm text-neutral-dark text-center">
          <strong>For demo purposes:</strong>
          <br />
          {portalType === "staff" 
            ? "Staff password is: staff123" 
            : "Admin password is: admin123"
          }
        </p>
      </div>
    </div>
  );
}