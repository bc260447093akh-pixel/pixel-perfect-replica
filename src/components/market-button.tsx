import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; variant?: 'default' | 'icon' | 'plain' };
export const MarketButton = forwardRef<HTMLButtonElement, Props>(function MarketButton({ asChild, variant = 'default', className = '', ...props }, ref) {
  const Component = asChild ? Slot : 'button';
  return <Component ref={ref} className={`${variant === 'icon' ? 'market-icon' : variant === 'plain' ? 'market-plain' : 'button'} ${className}`} {...props} />;
});