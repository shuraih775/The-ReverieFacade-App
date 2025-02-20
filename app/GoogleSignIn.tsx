import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { getAuth, signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../FirebaseConfig"; // Import your Firebase configuration
import { FontAwesome } from "@expo/vector-icons";
import * as WebBrowser from 'expo-web-browser';


WebBrowser.maybeCompleteAuthSession();

const GoogleSignInScreen = () => {

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: "165446697625-q8k6t4ebir4606u3mr4lu1ate8lq93nh.apps.googleusercontent.com",
    androidClientId:"165446697625-t7rkdamg67p1n5haahd8jah24inoi2a7.apps.googleusercontent.com"
  });

  // Handle the response from Google OAuth
  useEffect(() => {
    if (response?.type === "success") {
      const  id_token  = response.authentication?.accessToken;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log("Signed in user:", user);
        })
        .catch((error) => {
          console.error("Error signing in:", error);
        });
    }
  }, [response]);

  return (
    <View className="flex-1 items-center justify-center bg-black">
      <TouchableOpacity
        onPress={() => promptAsync()}
        disabled={!request}
        className="bg-[#1F1F1F] flex-row items-center w-[100%] p-4 rounded-lg space-x-2 justify-center"
      >
        <FontAwesome name="google" size={24} color="cyan" style={{ marginRight: 10 }} />
        <Text className="ml-1 text-white text-lg font-medium">Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

export default GoogleSignInScreen;
