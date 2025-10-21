import React from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition h-9 px-3";

const variants = {
  default: "bg-black text-white hover:bg-black/90",
  outline: "border border-black/10 bg-white hover:bg-black/5",
  ghost: "hover:bg-black/5",
  secondary: "bg-white text-black border border-black/10 hover:bg-white/90"
};

const sizes = {
  default: "h-9 px-3",
  icon: "h-9 w-9 p-0"
};

export const Button = ({ variant = "default", size = "default", className = "", ...props }) => {
  return (
    <button
      className={`${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
      {...props}
    />
  );
};
