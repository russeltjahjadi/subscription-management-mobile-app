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

export default function VerifyCode() {
  const { signUp } = useSignUp();
  const router = useRouter();

  const [verificationCode, setVerificationCode] = React.useState("");
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [verifying, setVerifying] = React.useState(false);
  const [sendingVerification, setSendingVerification] = React.useState(false);

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

  const handleVerifyCode = async () => {
    setSubmitError(null);
    setVerifying(true);

    try {
      if (!verificationCode) {
        setSubmitError("Enter the verification code");
        return;
      }

      if (signUp.verifications?.verifyEmailCode) {
        const { error } = await signUp.verifications.verifyEmailCode({
          code: verificationCode,
        });

        if (error) {
          setSubmitError((error as any)?.message ?? "Verification failed");
          return;
        }
      }

      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) return;
            handleFinalizeNavigate(decorateUrl, session);
          },
        });
      } else {
        setSubmitError("Verification succeeded but sign-up not completed yet.");
      }
    } catch {
      setSubmitError("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setSubmitError(null);
    setSendingVerification(true);

    try {
      if (signUp.verifications?.sendEmailCode) {
        await signUp.verifications.sendEmailCode();
        setSubmitError("Verification code resent to your email.");
      } else {
        setSubmitError("Unable to resend verification code.");
      }
    } catch {
      setSubmitError("Failed to resend code. Please try again.");
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/icons/logo.png")}
        style={styles.logo}
      />
      <Text style={styles.appName}>Renewly</Text>
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.description}>
        Enter the verification code we sent to your email.
      </Text>

      <TextInput
        style={styles.input}
        value={verificationCode}
        placeholder="123456"
        onChangeText={setVerificationCode}
        keyboardType="numeric"
      />

      {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          { marginTop: 8 },
        ]}
        onPress={handleVerifyCode}
        disabled={verifying}
      >
        <Text style={styles.buttonText}>
          {verifying ? "Verifying..." : "Verify code"}
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.secondaryButton,
          pressed && styles.buttonPressed,
          { marginTop: 8 },
        ]}
        onPress={handleResend}
        disabled={sendingVerification}
      >
        <Text style={styles.secondaryButtonText}>
          {sendingVerification ? "Resending..." : "Resend code"}
        </Text>
      </Pressable>

      <View style={styles.linkRow}>
        <Text>Already have an account? </Text>
        <Link href="/(auth)/sign-in">Sign in</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  description: { fontSize: 14, color: "#666", marginBottom: 16 },
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
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#0a7ea4", fontWeight: "600" },
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
