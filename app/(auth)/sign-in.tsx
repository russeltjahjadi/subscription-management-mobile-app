import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { posthog } from "@/lib/posthog";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignIn() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();

  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitError(null);

    try {
      const { error } = await signIn.password({
        identifier,
        password,
      });

      if (error) {
        setSubmitError(error.message ?? "Unable to sign in.");
        return;
      }

      if (signIn.status === "complete" && signIn.createdSessionId) {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) return;
            posthog?.capture("sign_in_completed");
            const url = decorateUrl("/");
            if (url.startsWith("http")) {
              window.location.href = url;
            } else {
              router.push(url as any);
            }
          },
        });
        return;
      }

      setSubmitError("Sign-in is not complete yet. Please try again.");
    } catch (error: any) {
      setSubmitError(
        error?.errors?.[0]?.message ?? error?.message ?? "Unable to sign in.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/icons/logo.png")}
        style={styles.logo}
      />
      <Text style={styles.appName}>Renewly</Text>
      <Text style={styles.title}>Sign in</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={identifier}
        placeholder="Email or username"
        onChangeText={setIdentifier}
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
        ]}
        onPress={handleSubmit}
        disabled={!identifier || !password || fetchStatus === "fetching"}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>

      <View style={styles.linkRow}>
        <Text>Don&apos;t have an account? </Text>
        <Link
          href="/(auth)/sign-up"
          onPress={() => posthog?.capture("sign_up_link_selected")}
        >
          Sign up
        </Link>
      </View>

      {/* {errors && <Text style={styles.debug}>{JSON.stringify(errors, null, 2)}</Text>} */}
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
  debug: { marginTop: 12, color: "#666", fontSize: 12 },
  logo: { width: 88, height: 88, alignSelf: "center", marginBottom: 8 },
  appName: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
});
