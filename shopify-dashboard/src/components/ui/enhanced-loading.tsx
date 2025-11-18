import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 
      className={cn('animate-spin text-primary', sizeClasses[size], className)} 
    />
  );
};

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'card' | 'overlay';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  size = 'md',
  variant = 'inline',
  className 
}) => {
  const content = (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      <LoadingSpinner size={size} />
      <span className="text-muted-foreground animate-pulse">{message}</span>
    </div>
  );

  if (variant === 'card') {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12">
          {content}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
        {content}
      </div>
    );
  }

  return content;
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <AlertCircle className="h-12 w-12" />,
  title,
  description,
  action,
  className
}) => (
  <div className={cn('text-center py-12', className)}>
    <div className="text-muted-foreground mb-4 opacity-50">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    {description && (
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
        {description}
      </p>
    )}
    {action && (
      <Button onClick={action.onClick} variant="outline">
        {action.label}
      </Button>
    )}
  </div>
);

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className
}) => (
  <Card className={cn('border-destructive/20 bg-destructive/5', className)}>
    <CardContent className="py-12">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-destructive mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          {message}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

interface ProgressIndicatorProps {
  progress: number;
  message?: string;
  variant?: 'linear' | 'circular';
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  message,
  variant = 'linear',
  className
}) => {
  if (variant === 'circular') {
    return (
      <div className={cn('text-center', className)}>
        <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-muted"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
              className="text-primary transition-all duration-300"
            />
          </svg>
          <span className="absolute text-sm font-semibold">{Math.round(progress)}%</span>
        </div>
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center">
        {message && <span className="text-sm text-muted-foreground">{message}</span>}
        <span className="text-sm font-semibold">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};