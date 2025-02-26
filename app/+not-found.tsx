// app/+not-found.tsx
import { View, Text } from "react-native";

export default function NotFound() {
  return (
    <View className="flex-1 justify-center items-center bg-red-500">
      <Text className="text-white text-lg">NOT FOUND! :/   but working 🎉</Text>
    </View>
  );
}
