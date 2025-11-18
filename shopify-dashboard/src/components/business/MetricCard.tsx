import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  variant?: 'default' | 'revenue' | 'expense' | 'neutral';
  className?: string;
  isLoading?: boolean;
}

/**
 * Memoized MetricCard component for better performance
 * Only re-renders when props actually change
 */
export const MetricCard = memo<MetricCardProps>(({ 
  title, 
  value, 
  change, 
  icon, 
  variant = 'default',
  className,
  isLoading = false
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'revenue':
        return 'border-financial-revenue/20 bg-gradient-to-br from-financial-revenue/5 to-financial-accent/5';
      case 'expense':
        return 'border-financial-expense/20 bg-gradient-to-br from-financial-expense/5 to-warning/5';
      case 'neutral':
        return 'border-financial-neutral/20 bg-gradient-to-br from-financial-neutral/5 to-muted/50';
      default:
        return 'border-financial-primary/20 bg-gradient-to-br from-financial-primary/5 to-financial-secondary/5';
    }
  };

  const getChangeColor = () => {
    if (change === undefined) return 'text-foreground';
    return change > 0 ? 'text-financial-revenue' : change < 0 ? 'text-financial-expense' : 'text-foreground';
  };

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-4 w-4 bg-muted rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted rounded w-20 mb-2"></div>
          <div className="h-3 bg-muted rounded w-32"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-hover-custom",
      getVariantStyles(),
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {formatValue(value)}
        </div>
        {change !== undefined && (
          <p className={cn("text-xs", getChangeColor())}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
});

MetricCard.displayName = "MetricCard";