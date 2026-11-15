import { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import NativePythonBridge from "../components/NativePythonBridge";
import { ThemeProvider } from "../constants/themeContext";
import { hydrateSoundPreference } from "../utils/soundEffects";

export default function RootLayout() {
  useEffect(() => {
    void hydrateSoundPreference();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NativePythonBridge />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
