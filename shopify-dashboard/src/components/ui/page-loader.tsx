import React from 'react';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  className?: string;
  message?: string;
}

/**
 * Reusable page loader component with better UX
 */
export const PageLoader: React.FC<PageLoaderProps> = ({ 
  className,
  message = "Loading..." 
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-screen gap-4",
      className
    )}>
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary"></div>
        <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-primary/20 animate-ping"></div>
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};