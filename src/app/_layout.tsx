import { Stack } from "expo-router";
import NativePythonBridge from "../components/NativePythonBridge";
import { ThemeProvider } from "../constants/themeContext";

export default function RootLayout() {
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
