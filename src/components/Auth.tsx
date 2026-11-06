import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { StudioColors } from "../constants/theme";

interface AuthProps {
  onSuccess?: () => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccessMsg, setIsSuccessMsg] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(
    null,
  );

  async function handleAuth() {
    if (!email || !password) {
      setIsSuccessMsg(false);
      setErrorMsg("Please enter both your email address and password.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setIsSuccessMsg(false);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setIsSuccessMsg(true);
        setErrorMsg(
          "Account created! Check your email to confirm or sign in directly.",
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setIsSuccessMsg(false);
      setErrorMsg(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerBadge}>
        <Text style={styles.headerBadgeText}>⚡ CLOUD SYNC</Text>
      </View>

      <Text style={styles.title}>
        {isSignUp ? "Create Your Developer Profile" : "Welcome Back"}
      </Text>
      <Text style={styles.subtitle}>
        {isSignUp
          ? "Sync your solved modules, XP streak, and Pro tracks across all devices."
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
              isSuccessMsg
                ? { color: StudioColors.emeraldLight }
                : { color: "#FCA5A5" },
            ]}
          >
            {errorMsg}
          </Text>
        </View>
      ) : null}

      <View style={styles.fieldGroup}>
        <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
        <TextInput
          style={[
            styles.input,
            focusedField === "email" && styles.inputFocused,
          ]}
          placeholder="you@domain.com"
          placeholderTextColor={StudioColors.textDim}
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocusedField("email")}
          onBlur={() => setFocusedField(null)}
          autoCapitalize="none"
          keyboardType="email-address"
          onSubmitEditing={handleAuth}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.inputLabel}>PASSWORD</Text>
        <TextInput
          style={[
            styles.input,
            focusedField === "password" && styles.inputFocused,
          ]}
          placeholder="••••••••"
          placeholderTextColor={StudioColors.textDim}
          value={password}
          onChangeText={setPassword}
          onFocus={() => setFocusedField("password")}
          onBlur={() => setFocusedField(null)}
          secureTextEntry
          onSubmitEditing={handleAuth}
        />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.9 },
        ]}
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={StudioColors.bg} />
        ) : (
          <Text style={styles.buttonText}>
            {isSignUp ? "Create Free Account ➔" : "Sign In ➔"}
          </Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => {
          setIsSignUp(!isSignUp);
          setErrorMsg("");
        }}
        style={styles.switchBtn}
      >
        <Text style={styles.switchText}>
          {isSignUp ? "Already have an account? " : "New to DevLearn? "}
          <Text style={styles.switchTextHighlight}>
            {isSignUp ? "Sign In" : "Create Account"}
          </Text>
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: StudioColors.surface,
    padding: 28,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: StudioColors.borderStrong,
    width: 370,
    maxWidth: "92%",
    alignSelf: "center",
  },
  headerBadge: {
    alignSelf: "center",
    backgroundColor: StudioColors.amberSoft,
    borderWidth: 1,
    borderColor: StudioColors.amberBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 12,
  },
  headerBadgeText: {
    color: StudioColors.amber,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: {
    color: StudioColors.textPrimary,
    fontSize: 22,
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
    marginBottom: 20,
  },
  feedbackBanner: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
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
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 17,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: StudioColors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: StudioColors.bg,
    color: StudioColors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
    marginTop: 6,
    ...Platform.select({
      web: {
        cursor: "pointer",
        userSelect: "none",
      },
    }),
  },
  buttonText: {
    color: StudioColors.bg,
    fontWeight: "900",
    fontSize: 14,
  },
  switchBtn: {
    marginTop: 18,
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
