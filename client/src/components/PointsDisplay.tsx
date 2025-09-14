import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Coins } from "lucide-react";

interface PointsDisplayProps {
  points: number;
  variant?: "default" | "large" | "compact";
  showIcon?: boolean;
}

export default function PointsDisplay({ 
  points, 
  variant = "default", 
  showIcon = true 
}: PointsDisplayProps) {
  const formatPoints = (points: number) => {
    return points.toLocaleString();
  };

  if (variant === "compact") {
    return (
      <Badge variant="secondary" className="font-mono" data-testid="badge-points">
        {showIcon && <Coins className="w-3 h-3 mr-1" />}
        {formatPoints(points)}
      </Badge>
    );
  }

  if (variant === "large") {
    return (
      <Card data-testid="card-points-large">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            {showIcon && <Coins className="w-8 h-8 mr-2 text-chart-2" />}
            <span className="text-3xl font-bold font-mono text-chart-2" data-testid="text-points-value">
              {formatPoints(points)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Channel Points</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-center gap-2" data-testid="container-points-default">
      {showIcon && <Coins className="w-5 h-5 text-chart-2" />}
      <span className="font-bold font-mono text-chart-2" data-testid="text-points-value">
        {formatPoints(points)}
      </span>
      <span className="text-sm text-muted-foreground">points</span>
    </div>
  );
}