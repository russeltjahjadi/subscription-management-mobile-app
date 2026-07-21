import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import React from "react";
import LoadingFallback from "@/components/LoadingFallback";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <LoadingFallback />;

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
