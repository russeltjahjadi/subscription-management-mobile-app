import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignUp() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleFinalizeNavigate = (
    decorateUrl: (p: string) => string,
    session?: any,
  ) => {
    const url = decorateUrl("/") as string;
    if (url.startsWith("http")) {
      Linking.openURL(url);
    } else {
      router.push(url as any);
    }
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    const { error } = await signUp.password({ emailAddress, password });

    if (error) {
      try {
        const msg = (error as any)?.message ?? JSON.stringify(error);
        setSubmitError(String(msg));
      } catch {
        setSubmitError("An unexpected error occurred");
      }
      return;
    }

    if (signUp.status === "missing_requirements") {
      try {
        if (
          Array.isArray(signUp.unverifiedFields) &&
          signUp.unverifiedFields.includes("email_address")
        ) {
          if (signUp.verifications?.sendEmailCode) {
            const { error } = await signUp.verifications.sendEmailCode();
            if (error) {
              setSubmitError(
                (error as any)?.message ?? "Failed to send verification code.",
              );
              return;
            }
            setSubmitError("A verification code was sent to your email.");
          } else {
            setSubmitError(
              "Verification required. Please check your email to continue.",
            );
          }
        } else if (
          Array.isArray(signUp.unverifiedFields) &&
          signUp.unverifiedFields.includes("phone_number")
        ) {
          if (signUp.verifications?.sendPhoneCode) {
            const { error } = await signUp.verifications.sendPhoneCode();
            if (error) {
              setSubmitError(
                (error as any)?.message ?? "Failed to send verification code.",
              );
              return;
            }
            setSubmitError("A verification code was sent to your phone.");
          } else {
            setSubmitError(
              "Verification required. Please check your phone to continue.",
            );
          }
        } else {
          setSubmitError(
            "Additional verification is required. Please follow the instructions sent to you.",
          );
        }
      } catch {
        setSubmitError("Failed to send verification code. Please try again.");
      }

      router.push("/(auth)/verify-code" as any);
      return;
    }

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          handleFinalizeNavigate(decorateUrl, session);
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/icons/logo.png")}
        style={styles.logo}
      />
      <Text style={styles.appName}>Renewly</Text>
      <Text style={styles.title}>Sign up</Text>

      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Email"
        onChangeText={setEmailAddress}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        value={password}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
      />

      {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          { marginTop: 12 },
        ]}
        onPress={handleSubmit}
        disabled={!emailAddress || !password || fetchStatus === "fetching"}
      >
        <Text style={styles.buttonText}>Sign up</Text>
      </Pressable>

      <View style={styles.linkRow}>
        <Text>Already have an account? </Text>
        <Link dismissTo href="/(auth)/sign-in">Sign in</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#0a7ea4",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: "#fff", fontWeight: "600" },
  linkRow: { flexDirection: "row", marginTop: 12, alignItems: "center" },
  error: { color: "red", marginTop: 8, fontSize: 13 },
  logo: { width: 88, height: 88, alignSelf: "center", marginBottom: 8 },
  appName: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
});
