import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * Tiny, dependency-free Select that mimics the shadcn API enough for this app.
 * It renders a native <select>, so it’s accessible and works everywhere.
 */
const Ctx = createContext(null);

export function Select({ value, onValueChange, children }) {
  const [items, setItems] = useState([]);
  const api = useMemo(
    () => ({
      value,
      setValue: (v) => onValueChange?.(v),
      register: (item) =>
        setItems((prev) => (prev.find((i) => i.value === item.value) ? prev : [...prev, item])),
      items
    }),
    [value, onValueChange, items]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function SelectTrigger({ className = "", children }) {
  const ctx = useContext(Ctx);
  if (!ctx) return null;
  return (
    <div className={`relative ${className}`}>
      <select
        className="h-9 w-full rounded-md border border-black/10 bg-white px-3 text-sm"
        value={ctx.value ?? ""}
        onChange={(e) => ctx.setValue(e.target.value)}
      >
        {/* Placeholder */}
        {ctx.items.length === 0 && <option value="" disabled>—</option>}
        {ctx.items.map((it) => (
          <option key={it.value} value={it.value}>
            {it.label ?? it.value}
          </option>
        ))}
      </select>
      {/* We ignore children visually; native select renders value. */}
      <div className="pointer-events-none absolute inset-0 flex items-center px-3 opacity-0">
        {children}
      </div>
    </div>
  );
}

export const SelectValue = ({ placeholder }) => null;
export const SelectContent = ({ className = "", children }) => <div className={className}>{children}</div>;

export function SelectItem({ value, children }) {
  const ctx = useContext(Ctx);
  useEffect(() => {
    ctx?.register?.({ value, label: typeof children === "string" ? children : value });
  }, [value, children]); // register once
  return null; // items are rendered by the native <select>
}
