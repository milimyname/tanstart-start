import { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "dark" | "light" | "system";
export type ThemeCompany = "default" | "acme";

type ThemeState = {
  mode: ThemeMode;
  company: ThemeCompany;
};

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: ThemeState;
  storageKey?: string;
};

type ThemeProviderState = ThemeState & {
  setTheme: (theme: Partial<ThemeState>) => void;
};

const initialState: ThemeProviderState = {
  mode: "system",
  company: "default",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = { mode: "system", company: "default" },
  storageKey = "tanstack-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeState>(defaultTheme);

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedTheme = localStorage.getItem(storageKey);
      if (storedTheme) {
        const parsedTheme = JSON.parse(storedTheme) as ThemeState;
        setTheme(parsedTheme);
      }
    } catch (e) {
      console.error("Error loading theme from localStorage", e);
    }
  }, [storageKey]);

  // Apply theme classes whenever theme changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = window.document.documentElement;

    // Remove all possible theme classes
    root.classList.remove("light", "dark", "acme-light", "acme-dark");

    // Determine actual mode (light/dark)
    let actualMode = theme.mode;
    if (theme.mode === "system") {
      actualMode = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    // Apply appropriate classes based on company and mode
    if (theme.company === "acme") {
      root.classList.add(`acme-${actualMode}`);
    } else {
      root.classList.add(actualMode);
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme.mode !== "system" || typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark", "acme-light", "acme-dark");

      const newMode = mediaQuery.matches ? "dark" : "light";

      if (theme.company === "acme") {
        root.classList.add(`acme-${newMode}`);
      } else {
        root.classList.add(newMode);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme.mode, theme.company]);

  const value = {
    ...theme,
    setTheme: (newTheme: Partial<ThemeState>) => {
      const updatedTheme = { ...theme, ...newTheme };

      if (typeof window !== "undefined") {
        // Store in localStorage
        localStorage.setItem(storageKey, JSON.stringify(updatedTheme));

        // Set cookies for SSR consistency
        if (newTheme.mode) {
          document.cookie = `ui-theme=${newTheme.mode}; path=/; max-age=31536000`;
        }
        if (newTheme.company) {
          document.cookie = `company=${newTheme.company}; path=/; max-age=31536000`;
        }
      }

      setTheme(updatedTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
