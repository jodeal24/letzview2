import React, { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);

export function Dialog({ open: controlledOpen, onOpenChange, children }) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const api = {
    open,
    setOpen: (v) => (isControlled ? onOpenChange?.(v) : setUncontrolledOpen(v))
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function DialogTrigger({ asChild, children }) {
  const ctx = useContext(Ctx);
  if (!ctx) return children;
  const child = React.Children.only(children);
  const onClick = (e) => {
    child.props?.onClick?.(e);
    ctx.setOpen(true);
  };
  return React.cloneElement(child, { onClick });
}

export function DialogContent({ className = "", children }) {
  const ctx = useContext(Ctx);
  if (!ctx?.open) return null;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && ctx.setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={() => ctx.setOpen(false)} />
      <div className={`absolute left-1/2 top-1/2 w-[90vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-4 shadow-xl ${className}`}>
        {children}
      </div>
    </div>
  );
}

export const DialogHeader = ({ children }) => <div className="mb-2">{children}</div>;
export const DialogTitle = ({ children }) => <h3 className="text-lg font-semibold">{children}</h3>;
