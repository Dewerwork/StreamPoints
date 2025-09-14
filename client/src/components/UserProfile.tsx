import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, LogOut, User } from "lucide-react";
import PointsDisplay from "./PointsDisplay";

interface UserProfileProps {
  user: {
    id: string;
    displayName: string;
    email: string;
    points: number;
    isAdmin: boolean;
    photoURL?: string;
  };
  onSignOut: () => void;
}

export default function UserProfile({ user, onSignOut }: UserProfileProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = () => {
    console.log('Sign out triggered');
    onSignOut();
  };

  return (
    <Card data-testid="card-user-profile">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16" data-testid="avatar-user">
            <AvatarImage src={user.photoURL} alt={user.displayName} />
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(user.displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-xl" data-testid="text-user-name">
                {user.displayName}
              </CardTitle>
              {user.isAdmin && (
                <Badge variant="destructive" className="text-xs" data-testid="badge-admin">
                  <Crown className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground" data-testid="text-user-email">
              {user.email}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
          <PointsDisplay points={user.points} variant="large" />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            data-testid="button-view-profile"
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            data-testid="button-sign-out"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}