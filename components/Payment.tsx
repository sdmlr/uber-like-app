import { Alert, Image, Text, View } from "react-native";
import CustomButton from "./CustomButton";
import { useStripe } from "@stripe/stripe-react-native";
import { useState } from "react";
import { PaymentProps } from "@/types/type";
import { fetchAPI } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { useAuth } from "@clerk/clerk-expo";
import ReactNativeModal from "react-native-modal";
import { images } from "@/constants";
import { router } from "expo-router";

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}: PaymentProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { userId } = useAuth();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude,
  } = useLocationStore();

  // const fetchPaymentSheetParams = async () => {
  //   const response = await fetch(`${API_URL}/payment-sheet`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
  //   const { paymentIntent, ephemeralKey, customer } = await response.json();

  //   return {
  //     paymentIntent,
  //     ephemeralKey,
  //     customer,
  //   };
  // };

  const initializePaymentSheet = async () => {
    // const { paymentIntent, ephemeralKey, customer } =
    //   await fetchPaymentSheetParams();

    const { error } = await initPaymentSheet({
      merchantDisplayName: "Ryde Inc",
      intentConfiguration: {
        mode: {
          amount: parseInt(amount) * 100,
          currencyCode: "GBP",
        },
        confirmHandler: async (paymentMethod, _, intentCreationCallback) => {
          try {
            // 1. Create PaymentIntent on your server
            const createResponse = await fetchAPI("/(api)/(stripe)/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: fullName || email.split("@")[0],
                email: email,
                amount: amount,
                paymentMethodId: paymentMethod.id,
              }),
            });

            const { paymentIntent, customer } = createResponse;
            if (!paymentIntent || !paymentIntent.client_secret) {
              console.error(
                "Missing paymentIntent or client_secret in create response:",
                createResponse
              );
              return;
            }

            // 2. Confirm the PaymentIntent on your server
            const payResponse = await fetchAPI("/(api)/(stripe)/pay", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                payment_method: paymentMethod.id, // Must be 'payment_method'
                payment_intent_id: paymentIntent.id,
                customer_id: customer,
              }),
            });

            const { result } = payResponse;
            if (!result || !result.client_secret) {
              console.error(
                "Missing result or client_secret in pay response:",
                payResponse
              );
              return;
            }

            // 3. Create the ride on your server
            const rideResponse = await fetchAPI("/(api)/ride/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                origin_address: userAddress,
                destination_address: destinationAddress,
                origin_latitude: userLatitude,
                origin_longitude: userLongitude,
                destination_latitude: destinationLatitude,
                destination_longitude: destinationLongitude,
                ride_time: rideTime.toFixed(0),
                fare_price: parseInt(amount) * 100,
                payment_status: "paid",
                driver_id: driverId,
                user_id: userId,
              }),
            });

            // 4. Notify Payment Sheet with the updated client secret
            intentCreationCallback({ clientSecret: result.client_secret });
          } catch (error) {
            console.error("Error in confirmHandler:", error);
          }
        },
      },
      returnURL: "myapp://book-ride",
    });
    if (error) {
      console.log("Error initializing payment sheet:", error);
    }
  };

  const openPaymentSheet = async () => {
    await initializePaymentSheet();
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      setSuccess(true);
      // Alert.alert("Success", "Your order is confirmed!");
    }
  };

  return (
    <>
      <CustomButton
        title="Confirm Ride"
        className="my-10"
        onPress={openPaymentSheet}
      />

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Ride Booked!
          </Text>

          <Text className="text-md text-general-200 font-JakartaMedium text-center mt-3">
            Thank you for your booking. Your reservation has been placed. Please
            proceed with your trip!
          </Text>

          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/home");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;
