import * as React from "react";
import { strictButtonVariants, type StrictButtonProps } from "./strict-variants";

export function StrictButton({ className, variant, size, ...props }: StrictButtonProps) {
  return (
    <button
      className={strictButtonVariants({ variant, size, className })}
      {...props}
    />
  );
}