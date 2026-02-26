import * as React from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    localStorage.setItem("theme", theme === "light" ? "dark" : "light");
  };

  return (
    <div data-theme={theme}>
      {children}
      <button
        onClick={toggleTheme}
        className="fixed p-2 rounded-full bottom-4 right-4 bg-muted hover:bg-muted/80"
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>
    </div>
  );
}