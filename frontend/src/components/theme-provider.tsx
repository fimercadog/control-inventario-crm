"use client";

import { createContext, useContext, useEffect, useMemo } from "react";

type Theme = "light";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>({
  theme: "light",
  setTheme: () => {},
});

function applyLightTheme() {
  if (typeof document !== "undefined") {
    document.documentElement.classList.remove("dark");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyLightTheme();
    window.localStorage.removeItem("hrms_theme");
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: "light",
      setTheme: () => {
        applyLightTheme();
      },
    }),
    [],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    return { theme: "light" as const, setTheme: () => {} };
  }

  return context;
}
