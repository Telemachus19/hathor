import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import './ui.css';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownMenuContent({
  children,
  align = 'end',
  ...props
}: DropdownMenuPrimitive.DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content align={align} className="hathor-dropdown-content" {...props}>
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  children,
  className = '',
  variant = 'default',
  ...props
}: DropdownMenuPrimitive.DropdownMenuItemProps & { variant?: 'default' | 'danger' }) {
  return (
    <DropdownMenuPrimitive.Item
      className={`hathor-dropdown-item ${variant === 'danger' ? 'danger' : ''} ${className}`}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  );
}
