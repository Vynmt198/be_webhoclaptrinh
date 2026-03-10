declare module '@/app/components/ui/select' {
  import * as React from 'react';

  export interface SelectProps {
    value?: string;
    defaultValue?: string;
    disabled?: boolean;
    onValueChange?: (value: string) => void;
    children?: React.ReactNode;
  }

  export const Select: React.FC<SelectProps>;

  export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    children?: React.ReactNode;
  }

  export const SelectTrigger: React.FC<SelectTriggerProps>;

  export interface SelectValueProps {
    placeholder?: string;
    children?: React.ReactNode;
  }

  export const SelectValue: React.FC<SelectValueProps>;

  export interface SelectContentProps {
    children?: React.ReactNode;
  }

  export const SelectContent: React.FC<SelectContentProps>;

  export interface SelectItemProps {
    value: string;
    children?: React.ReactNode;
  }

  export const SelectItem: React.FC<SelectItemProps>;
}

