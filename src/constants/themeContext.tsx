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
  isValidStudioPaletteId,
  STORAGE_STUDIO_PALETTE_KEY,
  StudioPaletteId,
  StudioThemeColors,
  ThemeMode,
} from "./theme";
import {
  readLocalJson,
  readLocalJsonAsync,
  writeLocalJson,
} from "../utils/storage";

export interface ThemeContextValue {
  themeMode: ThemeMode;
  paletteId: StudioPaletteId;
  isDark: boolean;
  colors: StudioThemeColors;
  setThemeMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
  setPaletteId: (next: StudioPaletteId) => void;
  toggleTheme: () => void;
}

const DEFAULT_COLORS = getStudioColors("dark", "arcade");

const ThemeContext = createContext<ThemeContextValue>({
  themeMode: "dark",
  paletteId: "arcade",
  isDark: true,
  colors: DEFAULT_COLORS,
  setThemeMode: () => {},
  setPaletteId: () => {},
  toggleTheme: () => {},
});

/**
 * Provides reactive light/dark theme mode + curated Studio Palette colors across
 * Web and Native iOS/Android so changing theme updates styles immediately.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [paletteId, setPaletteIdState] = useState<StudioPaletteId>(() => {
    const saved = readLocalJson<string>(STORAGE_STUDIO_PALETTE_KEY, "arcade");
    return isValidStudioPaletteId(saved) ? saved : "arcade";
  });

  useEffect(() => {
    let cancelled = false;
    void readLocalJsonAsync<string>(STORAGE_STUDIO_PALETTE_KEY, "arcade").then(
      (saved) => {
        if (!cancelled && isValidStudioPaletteId(saved)) {
          setPaletteIdState(saved);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    applyColorTheme(themeMode, paletteId);
  }, [themeMode, paletteId]);

  const setPaletteId = useCallback((next: StudioPaletteId) => {
    if (!isValidStudioPaletteId(next)) return;
    setPaletteIdState(next);
    writeLocalJson(STORAGE_STUDIO_PALETTE_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const colors = useMemo(
    () => getStudioColors(themeMode, paletteId),
    [themeMode, paletteId],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeMode,
      paletteId,
      isDark: themeMode === "dark",
      colors,
      setThemeMode,
      setPaletteId,
      toggleTheme,
    }),
    [themeMode, paletteId, colors, setPaletteId, toggleTheme],
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
