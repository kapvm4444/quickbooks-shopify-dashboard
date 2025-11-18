import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FinancialCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: ReactNode;
  variant?: 'default' | 'revenue' | 'expense' | 'neutral';
  className?: string;
  loading?: boolean;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
}

/**
 * Enhanced Financial Card Component
 * Consolidates FinancialCard and MemoizedFinancialCard with additional features
 */
const FinancialCardBase: React.FC<FinancialCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  variant = 'default',
  className,
  loading = false,
  subtitle,
  trend
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') {
      return val;
    }
    return val.toLocaleString();
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

  const getTrendColor = () => {
    if (trend === 'up') return 'text-financial-revenue';
    if (trend === 'down') return 'text-financial-expense';
    return 'text-foreground';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  if (loading) {
    return (
      <Card className={cn(
        "transition-all duration-200",
        getVariantStyles(),
        className
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
          {icon && <div className="text-muted-foreground opacity-50">{icon}</div>}
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted animate-pulse rounded w-32 mb-2"></div>
          <div className="h-3 bg-muted animate-pulse rounded w-24"></div>
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
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
        {(change !== undefined || trend) && (
          <div className="flex items-center mt-2">
            {trend && (
              <span className={cn("text-xs mr-1", getTrendColor())}>
                {getTrendIcon()}
              </span>
            )}
            {change !== undefined && (
              <p className={cn("text-xs", getTrendColor())}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}% from last month
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Regular Financial Card
 */
export const FinancialCard = FinancialCardBase;

/**
 * Memoized version for performance optimization
 */
export const MemoizedFinancialCard = React.memo(FinancialCardBase, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.value === nextProps.value &&
    prevProps.change === nextProps.change &&
    prevProps.variant === nextProps.variant &&
    prevProps.loading === nextProps.loading &&
    prevProps.trend === nextProps.trend
  );
});

// Legacy compatibility export
export default FinancialCard;