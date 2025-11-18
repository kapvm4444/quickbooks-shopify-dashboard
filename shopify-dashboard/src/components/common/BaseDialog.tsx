import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
  closeButtonText?: string;
  onClose?: () => void;
}

const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl'
};

/**
 * Reusable base dialog component
 * Provides consistent dialog structure and styling
 */
export const BaseDialog: React.FC<BaseDialogProps> = ({
  open,
  onOpenChange,
  title,
  children,
  footer,
  className,
  size = 'md',
  showCloseButton = true,
  closeButtonText = 'Close',
  onClose
}) => {
  const handleClose = () => {
    onClose?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(sizeClasses[size], className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {children}
        </div>
        
        {(footer || showCloseButton) && (
          <DialogFooter>
            {footer}
            {showCloseButton && !footer && (
              <Button variant="outline" onClick={handleClose}>
                {closeButtonText}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface FormDialogProps extends Omit<BaseDialogProps, 'footer'> {
  onSubmit: () => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
}

/**
 * Specialized dialog for forms
 * Provides standard form buttons and submission handling
 */
export const FormDialog: React.FC<FormDialogProps> = ({
  onSubmit,
  onCancel,
  submitText = 'Submit',
  cancelText = 'Cancel',
  isSubmitting = false,
  submitDisabled = false,
  ...props
}) => {
  const handleCancel = () => {
    onCancel?.();
    props.onOpenChange(false);
  };

  const footer = (
    <>
      <Button type="button" variant="outline" onClick={handleCancel}>
        {cancelText}
      </Button>
      <Button 
        type="submit" 
        onClick={onSubmit}
        disabled={isSubmitting || submitDisabled}
      >
        {isSubmitting ? 'Submitting...' : submitText}
      </Button>
    </>
  );

  return (
    <BaseDialog 
      {...props} 
      footer={footer}
      showCloseButton={false}
    />
  );
};

/**
 * Confirmation dialog
 * For delete confirmations and other destructive actions
 */
interface ConfirmDialogProps extends Omit<BaseDialogProps, 'children' | 'footer'> {
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel?: () => void;
  isConfirming?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
  isConfirming = false,
  ...props
}) => {
  const handleCancel = () => {
    onCancel?.();
    props.onOpenChange(false);
  };

  const footer = (
    <>
      <Button type="button" variant="outline" onClick={handleCancel}>
        {cancelText}
      </Button>
      <Button 
        variant={variant === 'destructive' ? 'destructive' : 'default'}
        onClick={onConfirm}
        disabled={isConfirming}
      >
        {isConfirming ? 'Processing...' : confirmText}
      </Button>
    </>
  );

  return (
    <BaseDialog 
      {...props} 
      footer={footer}
      showCloseButton={false}
      size="sm"
    >
      <p className="text-muted-foreground">{message}</p>
    </BaseDialog>
  );
};