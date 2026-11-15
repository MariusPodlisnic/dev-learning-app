import { Stack } from "expo-router";
import { ThemeProvider } from "../constants/themeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </ThemeProvider>
  );
}
