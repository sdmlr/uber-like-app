import { icons, images } from "@/constants";
import { Image, ScrollView, Text, View } from "react-native";
import InputField from "@/components/InputField";
import { useState } from "react";

const SignUp = () => {
  const [form, setform] = useState({ name: "", email: "", password: "" });

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Create your Account
          </Text>
        </View>

        <View className="p-5">
          <InputField
            label="Name"
            placeholder="ENter your name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setform({ ...form, name: value })}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default SignUp;
