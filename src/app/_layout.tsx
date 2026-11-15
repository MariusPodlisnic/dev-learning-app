import { useEffect } from "react";
import { Stack } from "expo-router";
import NativePythonBridge from "../components/NativePythonBridge";
import { ThemeProvider } from "../constants/themeContext";
import { hydrateSoundPreference } from "../utils/soundEffects";

export default function RootLayout() {
  useEffect(() => {
    void hydrateSoundPreference();
  }, []);

  return (
    <ThemeProvider>
      <NativePythonBridge />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </ThemeProvider>
  );
}
