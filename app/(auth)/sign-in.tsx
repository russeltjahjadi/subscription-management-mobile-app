import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
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
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = async () => {
    const { error } = await signIn.password({ emailAddress, password });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl("/");
          if (url.startsWith("http")) window.location.href = url;
          else router.push(url as any);
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
      <Text style={styles.title}>Sign in</Text>
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

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleSubmit}
        disabled={!emailAddress || !password || fetchStatus === "fetching"}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>

      <View style={styles.linkRow}>
        <Text>Don't have an account? </Text>
        <Link href="/(auth)/sign-up">Sign up</Link>
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
  debug: { marginTop: 12, color: "#666", fontSize: 12 },
  logo: { width: 88, height: 88, alignSelf: "center", marginBottom: 8 },
  appName: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
});
