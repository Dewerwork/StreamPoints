import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Gift } from "lucide-react";
import PointsDisplay from "./PointsDisplay";

interface RewardCardProps {
  id: string;
  title: string;
  description: string;
  cost: number;
  isActive: boolean;
  actionType: string;
  userPoints: number;
  onRedeem: (rewardId: string) => void;
  isRedeeming?: boolean;
}

export default function RewardCard({
  id,
  title,
  description,
  cost,
  isActive,
  actionType,
  userPoints,
  onRedeem,
  isRedeeming = false
}: RewardCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const canAfford = userPoints >= cost;
  const canRedeem = isActive && canAfford;

  const handleRedeem = () => {
    if (!canRedeem || isRedeeming) return;
    
    setIsAnimating(true);
    console.log(`Redeeming reward: ${title} for ${cost} points`);
    onRedeem(id);
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getActionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'chat_message':
        return 'bg-blue-500';
      case 'sound_effect':
        return 'bg-green-500';
      case 'screen_effect':
        return 'bg-purple-500';
      case 'custom':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card 
      className={`transition-all duration-300 ${isAnimating ? 'scale-105' : ''} ${
        !isActive ? 'opacity-50' : ''
      } hover-elevate`}
      data-testid={`card-reward-${id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Gift className="w-5 h-5 text-muted-foreground" />
          <Badge 
            variant="secondary" 
            className={`text-xs ${getActionTypeColor(actionType)} text-white`}
            data-testid={`badge-action-${actionType}`}
          >
            {actionType.replace('_', ' ')}
          </Badge>
        </div>
        <CardTitle className="text-lg" data-testid={`text-reward-title-${id}`}>
          {title}
        </CardTitle>
        <CardDescription data-testid={`text-reward-description-${id}`}>
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-chart-2" />
            <span className="font-bold text-chart-2 font-mono" data-testid={`text-reward-cost-${id}`}>
              {cost.toLocaleString()}
            </span>
          </div>
          {!canAfford && (
            <Badge variant="destructive" className="text-xs" data-testid={`badge-insufficient-${id}`}>
              Need {(cost - userPoints).toLocaleString()} more
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button
          onClick={handleRedeem}
          disabled={!canRedeem || isRedeeming}
          className="w-full"
          variant={canRedeem ? "default" : "secondary"}
          data-testid={`button-redeem-${id}`}
        >
          {isRedeeming ? "Redeeming..." : canRedeem ? "Redeem" : "Cannot Redeem"}
        </Button>
      </CardFooter>
    </Card>
  );
}