import React, { useEffect } from "react";

export function ToolDrawer({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  width = 420,
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={() => onOpenChange(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 80,
        }}
      />

      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width,
          maxWidth: "92vw",
          height: "100vh",
          background: "var(--card)",
          borderLeft: "1px solid var(--border)",
          zIndex: 90,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-10px 0 24px rgba(0,0,0,0.28)",
        }}
      >
        <header
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
            display: "grid",
            gap: 4,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <h3 style={{ fontSize: 14, color: "var(--foreground)", margin: 0 }}>{title}</h3>
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close drawer"
              style={{
                border: "1px solid var(--border)",
                background: "var(--background)",
                color: "var(--foreground)",
                borderRadius: 6,
                padding: "4px 8px",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Close
            </button>
          </div>
          {subtitle && <p style={{ fontSize: 11, color: "var(--muted-foreground)", margin: 0 }}>{subtitle}</p>}
        </header>

        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
          {children}
        </div>
      </aside>
    </>
  );
}
