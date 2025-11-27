import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "checked"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { className, checked, defaultChecked, onCheckedChange, disabled, ...props },
  ref
) {
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer select-none items-center gap-2",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        disabled={disabled}
        {...props}
      />
      <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-muted transition-colors peer-checked:bg-primary">
        <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-background shadow transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
});
