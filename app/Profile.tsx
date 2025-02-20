import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert,ActivityIndicator,Image } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useFocusEffect, useNavigation, NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendEmailVerification, reload } from "firebase/auth";
import { auth } from "../FirebaseConfig";
import { reloadAsync } from "expo-updates";

import MailIcon from "./components/mailIcon";
import LockIcon from "./components/lockIcon";
import EyeopenIcon from "./components/eyeopen";
import EyeclosedIcon from "./components/eyeclosed";
import LeftArrowIcon from "./components/leftArrow";
// import GoogleSignIn from './GoogleSignIn';
import CustomModal from './components/custommodel';



const Tab = createMaterialTopTabNavigator();

interface ProfileScreenProps {
  navigation: NavigationProp<any>;
}

const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  // const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const navigation = useNavigation();
  
  useEffect(() => {
  const loadUser = async () => {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      setUsername(auth.currentUser.displayName || "");
      setEmail(auth.currentUser.email || "");
    }
  };
  loadUser();
}, []);


  const handleLogout = async () => {
    await auth.signOut();
    await AsyncStorage.clear();
    await reloadAsync();
    Alert.alert("Success", "Logged out successfully!");
    navigation.reset({
      index: 0,
      routes: [{ name: 'Profile' }],
    });
  };

  return (
    <View className=" h-[100%] bg-black p-5">
      <Text className="text-3xl font-bold mb-10 text-white text-center mt-20">Profile</Text>
      <View className="mb-5">
        <Text className="text-s text-white mb-2">Username:</Text>
        <TextInput
          className="border p-4 rounded bg-gray-800 text-white"
          value={username}
          editable={false}
          placeholderTextColor="#999"
        />
      </View>
      <View className="mb-5">
        <Text className="text-s text-white mb-2">Email:</Text>
        <TextInput
          className="border p-4 rounded bg-gray-800 text-white"
          value={email}
          editable={false}
          placeholderTextColor="#999"
        />
      </View>
      <TouchableOpacity className="bg-red-600 p-4 rounded" onPress={handleLogout}>
        <Text className="text-white text-center text-lg">Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};


const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const isValidPassword = (password) => {
    return password.length >= 6;
  };
  const handleLogin = async () => {
    if (!isValidEmail(email)) {
      setModalMessage("Invalid email format.");
      setModalVisible(true);
      return;
    }

    if (!isValidPassword(password)) {
      setModalMessage("Password must be at least 6 characters long.");
      setModalVisible(true);
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await reload(userCredential.user); 
      
      if (!userCredential.user.emailVerified) {
        await auth.signOut(); 
        setModalMessage("Please verify your email before logging in.");
        setModalVisible(true);
        setLoading(false);
        return;
      }
      
      setModalMessage("Logged in successfully!");
      setModalVisible(true);
      navigation.goBack();
    } catch (error) {
      console.error(error);
      setModalMessage("Login failed: " + error.message);
      setModalVisible(true);
    }
    setLoading(false);
  };
  

  return (
    <View className="flex-1 bg-black p-5">
      <Text className="text-2xl font-bold mb-4 text-white">Login</Text>

      {/* Email Input */}
      <View className="border p-3 rounded flex-row items-center bg-gray-800 mb-3">
        <MailIcon />
        <TextInput
          className="flex-1 ml-3 text-white"
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
      </View>

      {/* Password Input */}
      <View className="border p-3 rounded flex-row items-center bg-gray-800 mb-3">
        <LockIcon />
        <TextInput
          className="flex-1 ml-3 text-white"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          {showPassword ? <EyeclosedIcon /> : <EyeopenIcon />}
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity
      className="bg-gray-700 p-3 rounded mb-3 flex-row justify-center items-center"
      onPress={handleLogin}
      disabled={loading}
    >
      {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center">Login</Text>}
    </TouchableOpacity>

      {/* OR Divider */}
      {/* <View className="flex-row items-center mb-4">
        <View className="flex-1 border-t border-gray-500"></View>
        <Text className="text-white mx-3">OR</Text>
        <View className="flex-1 border-t border-gray-500"></View>
      </View> */}

      {/* Google SignIn */}
      {/* <GoogleSignIn /> */}
      <CustomModal
        visible={modalVisible}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};


const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [username, setUsername] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPassword = (password) => {
    return password.length >= 6;
  };

  const handleSignUp = async () => {
    if (!isValidEmail(email)) {
      setModalMessage("Invalid email format.");
      setModalVisible(true);
      return;
    }

    if (!isValidPassword(password)) {
      setModalMessage("Password must be at least 6 characters long.");
      setModalVisible(true);
      return;
    }

    if (password !== verifyPassword) {
      setModalMessage("Passwords do not match.");
      setModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });
      await sendEmailVerification(userCredential.user);
      setModalMessage("Sign-up successful! Please verify your email before logging in.");
      setModalVisible(true);
    } catch (error) {
      console.error(error);
      setModalMessage("Sign up failed: " + error.message);
      setModalVisible(true);
    }
    setLoading(false);
  };

  return (
    <View className="flex-1 bg-black p-5">
      <Text className="text-2xl font-bold mb-4 text-white">Sign Up</Text>
      <TextInput className="border p-3 rounded text-white bg-gray-800 mb-3" placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#999" />
      <TextInput className="border p-3 rounded text-white bg-gray-800 mb-3" placeholder="Username" value={username} onChangeText={setUsername} placeholderTextColor="#999" />
      <TextInput className="border p-3 rounded text-white bg-gray-800 mb-3" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#999" />
      <TextInput className="border p-3 rounded text-white bg-gray-800 mb-3" placeholder="Verify Password" value={verifyPassword} onChangeText={setVerifyPassword} secureTextEntry placeholderTextColor="#999" />
      <TouchableOpacity className="bg-gray-700 p-3 rounded flex-row justify-center items-center" onPress={handleSignUp} disabled={loading}>
        {loading ? <ActivityIndicator color='white' /> : <Text className="text-white text-center">Sign Up</Text>}
      </TouchableOpacity>
      <CustomModal visible={modalVisible} message={modalMessage} onClose={() => setModalVisible(false)} />
    </View>
  );
};


const Profile = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigation = useNavigation();


  const logo = require('../assets/images/logo.png')

  useFocusEffect(
  useCallback(() => {
    const checkLoginStatus = async () => {
      try {
        const user = await auth.currentUser;
        setIsLoggedIn(!!user);
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };
    checkLoginStatus();
  }, [])
);


  return (
    <>
      {isLoggedIn ? (

        
          <ProfileScreen />
        
      ) : (
        <>
          <View className="relative h-[40%] contain text-center pt-[5%] bg-[#1F1F1F]">
            <TouchableOpacity className="absolute top-5 left-5" onPress={() => { navigation.goBack() }}>
              <LeftArrowIcon color="white" />
            </TouchableOpacity>
            <Image
              source={logo}
              className="p-10 mt-10 w-[50%] h-[40%] rounded-full mx-auto"
            />
            <Text className="text-2xl text-center font-bold text-white mt-4">
              REVERIE FACADE
            </Text>
            <Text className="text-m text-center text-gray-400 mt-2">
              Login or Sign up to access your account
            </Text>
          </View>

          <Tab.Navigator
            screenOptions={{
              tabBarStyle: { backgroundColor: 'black' },
              tabBarActiveTintColor: 'white',
              tabBarInactiveTintColor: 'gray',
            }}
          >
            <Tab.Screen name="Login" component={LoginScreen} />
            <Tab.Screen name="Sign Up" component={SignUpScreen} />
          </Tab.Navigator>
        </>
      )}
    </>
  );
};

export default Profile;
