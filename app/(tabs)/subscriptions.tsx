import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import SubscriptionCard from "../components/SubscriptionCard";
const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const posthog = usePostHog();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const filteredSubscriptions = HOME_SUBSCRIPTIONS.filter(
    (subscription) =>
      subscription.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.category
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      subscription.plan?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={
          <>
            <View>
              <Text className="text-3xl font-bold text-dark">
                Subscriptions
              </Text>
            </View>

            <View className="flex-row items-center bg-white rounded-xl p-5 my-7">
              <Image
                source={{
                  uri: "https://img.icons8.com/m_sharp/200/FFFFFF/search.png",
                }}
                className="w-5 h-5 mr-3"
                style={{ tintColor: "black" }}
              />

              <TextInput
                value={searchQuery}
                placeholder="Search Subscriptions"
                placeholderTextColor="grey"
                onChangeText={setSearchQuery}
                className="flex-1 text-dark text-xl h-full"
                autoCorrect={false}
              />

              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery("")}
                  hitSlop={12}
                  className="bg-neutral-200 dark:bg-neutral-800 w-5 h-5 rounded-full items-center justify-center"
                  style={{ opacity: 0.7 }}
                >
                  <Text
                    className="text-neutral-600 dark:text-neutral-400 font-bold text-xs"
                    style={{ marginTop: -2 }}
                  >
                    ×
                  </Text>
                </Pressable>
              )}
            </View>
          </>
        }
        data={filteredSubscriptions}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              const isExpanding = expandedSubscriptionId !== item.id;
              posthog?.capture(
                isExpanding
                  ? "subscription_details_expanded"
                  : "subscription_details_collapsed",
                {
                  subscription_id: item.id,
                  subscription_category: item.category,
                  subscription_status: item.status,
                  billing_period: item.billing,
                },
              );
              setExpandedSubscriptionId(isExpanding ? item.id : null);
            }}
          />
        )}
        keyboardDismissMode="on-drag"
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerClassName="pb-30"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Subscriptions;
