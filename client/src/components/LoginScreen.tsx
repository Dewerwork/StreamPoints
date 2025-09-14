import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, LogIn, Sparkles } from "lucide-react";

interface LoginScreenProps {
  onGoogleSignIn: () => void;
  isSigningIn?: boolean;
}

export default function LoginScreen({ onGoogleSignIn, isSigningIn = false }: LoginScreenProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSignIn = () => {
    setIsAnimating(true);
    console.log('Google sign in triggered');
    onGoogleSignIn();
    
    setTimeout(() => setIsAnimating(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md" data-testid="card-login">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className={`p-4 bg-primary/10 rounded-full ${isAnimating ? 'animate-pulse' : ''}`}>
              <Coins className="w-12 h-12 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">StreamPoints</CardTitle>
            <CardDescription className="text-base mt-2">
              Your channel points system for livestreaming
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span>Earn points, redeem rewards, engage with streamers</span>
            </div>
          </div>
          
          <Button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full h-12 text-base"
            data-testid="button-google-signin"
          >
            <LogIn className="w-5 h-5 mr-2" />
            {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
          </Button>
          
          <div className="text-xs text-center text-muted-foreground">
            <p>
              By signing in, you agree to our terms of service and privacy policy.
              Your Google account will be used for authentication only.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}