import React from "react";

export const Input = React.forwardRef(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`h-9 w-full rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black/10 ${className}`}
    {...props}
  />
));
Input.displayName = "Input";
