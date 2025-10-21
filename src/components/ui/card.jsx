import React from "react";

export const Card = ({ className = "", ...props }) => (
  <div className={`rounded-xl border border-black/10 bg-white ${className}`} {...props} />
);

export const CardContent = ({ className = "", ...props }) => (
  <div className={`p-4 ${className}`} {...props} />
);
