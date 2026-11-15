import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  applyColorTheme,
  getStudioColors,
  StudioThemeColors,
  ThemeMode,
} from "./theme";

export interface ThemeContextValue {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: StudioThemeColors;
  setThemeMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
  toggleTheme: () => void;
}

const DEFAULT_COLORS = getStudioColors("dark");

const ThemeContext = createContext<ThemeContextValue>({
  themeMode: "dark",
  isDark: true,
  colors: DEFAULT_COLORS,
  setThemeMode: () => {},
  toggleTheme: () => {},
});

/**
 * Provides reactive light/dark theme colors across Web and Native iOS/Android
 * so changing theme updates styles immediately without stale static StyleSheets.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    applyColorTheme(themeMode);
  }, [themeMode]);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const colors = useMemo(() => getStudioColors(themeMode), [themeMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeMode,
      isDark: themeMode === "dark",
      colors,
      setThemeMode,
      toggleTheme,
    }),
    [themeMode, colors, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/** Returns the active theme mode and resolved palette colors. */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

/**
 * Memoizes a component's StyleSheet factory against the active theme palette so
 * light/dark toggles recompute styles cleanly on both Web and Native.
 */
export function useThemedStyles<T>(
  factory: (colors: StudioThemeColors, themeMode: ThemeMode) => T,
): T {
  const { colors, themeMode } = useTheme();
  return useMemo(() => factory(colors, themeMode), [factory, colors, themeMode]);
}
