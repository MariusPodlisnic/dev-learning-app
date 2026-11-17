import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { type StudioThemeColors } from "../constants/theme";
import { useTheme, useThemedStyles } from "../constants/themeContext";
import {
  getSupabaseSignupMetadata,
  trackFunnelMilestone,
} from "../utils/attribution";
import { parseAuthCallbackParams } from "../utils/authHelpers";
import { Text } from "./StudioIcon";

if (Platform.OS === "web" && typeof window !== "undefined") {
  try {
    WebBrowser.maybeCompleteAuthSession();
  } catch {}
}

export type AuthModalMode = "signup" | "signin" | "forgot" | "update_password";

interface AuthProps {
  defaultMode?: AuthModalMode;
  guestXp?: number;
  guestSolvedCount?: number;
  promptReason?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

function getAuthRedirectUrl(): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.origin;
  }
  return Linking.createURL("auth/callback");
}

export default function Auth({
  defaultMode = "signin",
  guestXp = 0,
  guestSolvedCount = 0,
  promptReason,
  onSuccess,
  onClose,
}: AuthProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"github" | "google" | null>(
    null,
  );
  const [prevDefaultMode, setPrevDefaultMode] =
    useState<AuthModalMode>(defaultMode);
  const [mode, setMode] = useState<AuthModalMode>(defaultMode);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccessMsg, setIsSuccessMsg] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(
    null,
  );

  if (defaultMode !== prevDefaultMode) {
    setPrevDefaultMode(defaultMode);
    setMode(defaultMode);
    setErrorMsg("");
    setIsSuccessMsg(false);
  }

  const isSignUp = mode === "signup";
  const isForgot = mode === "forgot";
  const isUpdatePassword = mode === "update_password";
  const hasGuestProgress = guestXp > 0 || guestSolvedCount > 0;

  function switchMode(nextMode: AuthModalMode) {
    setMode(nextMode);
    setErrorMsg("");
    setIsSuccessMsg(false);
  }

  async function handleAuth() {
    const trimmedEmail = email.trim();

    if (isForgot) {
      if (!trimmedEmail || !trimmedEmail.includes("@")) {
        setIsSuccessMsg(false);
        setErrorMsg("Enter the email address for your account first.");
        return;
      }
      setLoading(true);
      setErrorMsg("");
      setIsSuccessMsg(false);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(
          trimmedEmail,
          {
            redirectTo: getAuthRedirectUrl(),
          },
        );
        if (error) throw error;
        setIsSuccessMsg(true);
        setErrorMsg(
          "Reset link sent! Check your email inbox to set a new password.",
        );
      } catch (err: any) {
        setIsSuccessMsg(false);
        setErrorMsg(err?.message || "Could not send password reset email.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isUpdatePassword) {
      if (!password || password.length < 6) {
        setIsSuccessMsg(false);
        setErrorMsg("New password must be at least 6 characters.");
        return;
      }
      setLoading(true);
      setErrorMsg("");
      setIsSuccessMsg(false);
      try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setIsSuccessMsg(true);
        setErrorMsg("Password updated! Your account is synced and ready.");
        onSuccess?.();
      } catch (err: any) {
        setIsSuccessMsg(false);
        setErrorMsg(err?.message || "Could not update password.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!trimmedEmail || !password) {
      setIsSuccessMsg(false);
      setErrorMsg("Please enter both your email address and password.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setIsSuccessMsg(false);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: getSupabaseSignupMetadata(),
            emailRedirectTo: getAuthRedirectUrl(),
          },
        });
        if (error) throw error;
        trackFunnelMilestone("account_signed_up");
        if (data.session && onSuccess) {
          onSuccess();
        } else {
          setIsSuccessMsg(true);
          setErrorMsg(
            "Account created! Check your email to confirm or sign in directly.",
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (error) throw error;
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setIsSuccessMsg(false);
      setErrorMsg(err?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuthSignIn(provider: "github" | "google") {
    setOauthLoading(provider);
    setErrorMsg("");
    setIsSuccessMsg(false);
    const redirectTo = getAuthRedirectUrl();

    try {
      if (Platform.OS === "web") {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo,
          },
        });
        if (error) throw error;
        trackFunnelMilestone("account_signed_up");
        return;
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (!data?.url) {
        throw new Error(`No OAuth URL returned for ${provider}.`);
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== "success" || !result.url) {
        return;
      }

      const parsed = parseAuthCallbackParams(result.url);
      if (parsed.error) {
        throw new Error(parsed.error);
      }

      if (parsed.code) {
        const { error: exchangeErr } =
          await supabase.auth.exchangeCodeForSession(parsed.code);
        if (exchangeErr) throw exchangeErr;
      } else if (parsed.accessToken && parsed.refreshToken) {
        const { error: sessionErr } = await supabase.auth.setSession({
          access_token: parsed.accessToken,
          refresh_token: parsed.refreshToken,
        });
        if (sessionErr) throw sessionErr;
      } else {
        throw new Error("Could not verify login callback tokens.");
      }

      trackFunnelMilestone("account_signed_up");
      onSuccess?.();
    } catch (err: any) {
      setIsSuccessMsg(false);
      setErrorMsg(err?.message || `${provider} sign-in failed.`);
    } finally {
      setOauthLoading(null);
    }
  }

  const busy = loading || oauthLoading !== null;

  return (
    <View style={styles.card}>
      {onClose ? (
        <View style={styles.topRow}>
          <View style={styles.topRowSpacer} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close authentication modal"
            style={({ pressed }) => [
              styles.closeIconBtn,
              pressed && { opacity: 0.85 },
            ]}
            onPress={onClose}
          >
            <Text style={styles.closeIconText}>✕</Text>
          </Pressable>
        </View>
      ) : null}
      <Text style={styles.title}>
        {isForgot
          ? "Reset Your Password"
          : isUpdatePassword
            ? "Choose a New Password"
            : isSignUp
              ? hasGuestProgress
                ? "Save Your Arcade Progress"
                : "Create Your Developer Profile"
              : "Welcome Back"}
      </Text>
      <Text style={styles.subtitle}>
        {isForgot
          ? "Enter your email address and we'll send a password reset link."
          : isUpdatePassword
            ? "Enter a new password (6+ characters) to finish securing your account."
            : isSignUp
              ? promptReason ||
                "Sync your solved modules, XP streak, and Pro tracks across all devices."
              : "Sign in to restore your completed modules and streak progress."}
      </Text>

      {errorMsg ? (
        <View
          style={[
            styles.feedbackBanner,
            isSuccessMsg ? styles.feedbackSuccess : styles.feedbackError,
          ]}
        >
          <Text
            style={[
              styles.feedbackText,
              isSuccessMsg ? styles.feedbackSuccessText : styles.feedbackErrorText,
            ]}
          >
            {errorMsg}
          </Text>
        </View>
      ) : null}

      {!isUpdatePassword && (
        <View style={styles.fieldGroup}>
          <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
          <TextInput
            style={[
              styles.input,
              focusedField === "email" && styles.inputFocused,
            ]}
            placeholder="you@domain.com"
            placeholderTextColor={colors.textDim}
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            autoCapitalize="none"
            keyboardType="email-address"
            onSubmitEditing={handleAuth}
          />
        </View>
      )}

      {!isForgot && (
        <View style={styles.fieldGroup}>
          <View style={styles.inputLabelRow}>
            <Text style={styles.inputLabel}>
              {isUpdatePassword ? "NEW PASSWORD" : "PASSWORD"}
            </Text>
            {mode === "signin" && (
              <Pressable onPress={() => switchMode("forgot")}>
                <Text style={styles.forgotLinkText}>Forgot password?</Text>
              </Pressable>
            )}
          </View>
          <TextInput
            style={[
              styles.input,
              focusedField === "password" && styles.inputFocused,
            ]}
            placeholder="••••••••"
            placeholderTextColor={colors.textDim}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            secureTextEntry
            onSubmitEditing={handleAuth}
          />
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.9 },
          busy && { opacity: 0.7 },
        ]}
        onPress={handleAuth}
        disabled={busy}
      >
        {loading ? (
          <ActivityIndicator color={colors.bg} />
        ) : (
          <Text style={styles.buttonText}>
            {isForgot
              ? "Send Reset Link ➔"
              : isUpdatePassword
                ? "Update Password ➔"
                : isSignUp
                  ? "Create Free Account ➔"
                  : "Sign In ➔"}
          </Text>
        )}
      </Pressable>

      {(mode === "signin" || mode === "signup") && (
        <>
          <View style={styles.oauthDividerRow}>
            <View style={styles.oauthDividerLine} />
            <Text style={styles.oauthDividerText}>OR CONTINUE WITH</Text>
            <View style={styles.oauthDividerLine} />
          </View>

          <View style={styles.oauthRow}>
            <Pressable
              style={({ pressed }) => [
                styles.oauthBtn,
                pressed && { opacity: 0.85 },
                busy && { opacity: 0.65 },
              ]}
              onPress={() => handleOAuthSignIn("github")}
              disabled={busy}
            >
              {oauthLoading === "github" ? (
                <ActivityIndicator size="small" color={colors.textPrimary} />
              ) : (
                <Text style={styles.oauthBtnText}>GitHub</Text>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.oauthBtn,
                pressed && { opacity: 0.85 },
                busy && { opacity: 0.65 },
              ]}
              onPress={() => handleOAuthSignIn("google")}
              disabled={busy}
            >
              {oauthLoading === "google" ? (
                <ActivityIndicator size="small" color={colors.textPrimary} />
              ) : (
                <Text style={styles.oauthBtnText}>Google</Text>
              )}
            </Pressable>
          </View>
        </>
      )}

      {isForgot ? (
        <Pressable
          onPress={() => switchMode("signin")}
          style={styles.switchBtn}
        >
          <Text style={styles.switchTextHighlight}>← Back to Sign In</Text>
        </Pressable>
      ) : !isUpdatePassword ? (
        <Pressable
          onPress={() => switchMode(isSignUp ? "signin" : "signup")}
          style={styles.switchBtn}
        >
          <Text style={styles.switchText}>
            {isSignUp ? "Already have an account? " : "New to Devy? "}
            <Text style={styles.switchTextHighlight}>
              {isSignUp ? "Sign In" : "Create Account"}
            </Text>
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (StudioColors: StudioThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: StudioColors.surface,
      padding: 24,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: StudioColors.borderStrong,
      width: 390,
      maxWidth: "94%",
      alignSelf: "center",
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    topRowSpacer: {
      flex: 1,
    },
    closeIconBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: StudioColors.bg,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({ web: { cursor: "pointer", userSelect: "none" } }),
    },
    closeIconText: {
      color: StudioColors.textPrimary,
      fontSize: 13,
      fontWeight: "900",
    },
    title: {
      color: StudioColors.textPrimary,
      fontSize: 21,
      fontWeight: "800",
      marginBottom: 6,
      textAlign: "center",
      letterSpacing: -0.4,
    },
    subtitle: {
      color: StudioColors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
      marginBottom: 16,
    },
    feedbackBanner: {
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      marginBottom: 14,
    },
    feedbackError: {
      backgroundColor: StudioColors.roseSoft,
      borderColor: StudioColors.roseBorder,
    },
    feedbackSuccess: {
      backgroundColor: StudioColors.emeraldSoft,
      borderColor: StudioColors.emeraldBorder,
    },
    feedbackText: {
      fontSize: 12,
      fontWeight: "700",
      textAlign: "center",
      lineHeight: 17,
    },
    feedbackErrorText: {
      color: "#9F1239",
    },
    feedbackSuccessText: {
      color: "#065F46",
    },
    fieldGroup: {
      marginBottom: 14,
    },
    inputLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    inputLabel: {
      color: StudioColors.textMuted,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1,
      marginBottom: 6,
    },
    forgotLinkText: {
      color: StudioColors.amber,
      fontSize: 11.5,
      fontWeight: "700",
      marginBottom: 6,
      ...Platform.select({
        web: { cursor: "pointer", userSelect: "none" },
      }),
    },
    input: {
      backgroundColor: StudioColors.bg,
      color: StudioColors.textPrimary,
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      fontSize: 14,
      ...Platform.select({
        web: {
          outlineStyle: "none" as any,
        },
      }),
    },
    inputFocused: {
      borderColor: StudioColors.amber,
    },
    button: {
      backgroundColor: StudioColors.amber,
      paddingVertical: 13,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 4,
      ...Platform.select({
        web: {
          cursor: "pointer",
          userSelect: "none",
        },
      }),
    },
    buttonText: {
      color: StudioColors.ink,
      fontWeight: "900",
      fontSize: 14,
    },
    oauthDividerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 16,
      marginBottom: 12,
    },
    oauthDividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: StudioColors.borderSubtle,
    },
    oauthDividerText: {
      color: StudioColors.textMuted,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.8,
    },
    oauthRow: {
      flexDirection: "row",
      gap: 10,
    },
    oauthBtn: {
      flex: 1,
      backgroundColor: StudioColors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: StudioColors.border,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({
        web: { cursor: "pointer", userSelect: "none" },
      }),
    },
    oauthBtnText: {
      color: StudioColors.textPrimary,
      fontSize: 13,
      fontWeight: "800",
    },
    switchBtn: {
      marginTop: 16,
      alignItems: "center",
      ...Platform.select({
        web: {
          cursor: "pointer",
          userSelect: "none",
        },
      }),
    },
    switchText: {
      color: StudioColors.textMuted,
      fontSize: 13,
    },
    switchTextHighlight: {
      color: StudioColors.amber,
      fontWeight: "700",
    },
  });
