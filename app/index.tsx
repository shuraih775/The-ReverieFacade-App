import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';

import Header from './components/Header';
import { createStackNavigator } from "@react-navigation/stack";

import Home from './Home';
import Analytic from './Analytic';
import Tracker from './Tracker';
import Journal from './Journal';
import Profile from './Profile';

import TestsScreen from './Tests';
import PrivacyScreen from './Privacy';
import TestSummaryScreen from './testSummaryScreen';
import AboutScreen from './About';
import TermsScreen from './Terms';

import JournalLogo from './components/journallogo';
import AnalyticsLogo from './components/analyticslogo';
import HomeLogo from './components/homelogo';
import ReminderLogo from './components/Reminderlogo';
import JournalLogoFocused from './components/journallogoFocused';
import AnalyticsLogoFocused from './components/analyticslogoFocused';
import HomeLogoFocused from './components/homelogoFocused';
import ReminderLogoFocused from './components/ReminderlogoFocused';
import MenuLogo from './components/menulogo';

import '../global.css';
import DreamLogsScreen from './DreamLogs';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

interface CustomTabBarIconProps {
  route: { name: string };
  focused: boolean;
  color: string;
  size: number;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color, size }) => (
          <CustomTabBarIcon route={route} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: '#4D6175',
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: '#1F1F1F',
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Tracker" component={Tracker} />
      <Tab.Screen name="Journal" component={Journal} />
      <Tab.Screen name="Analytics" component={Analytic} />
    </Tab.Navigator>
  );
}

function CustomTabBarIcon({ route, focused }: CustomTabBarIconProps) {


  let iconComponent: JSX.Element;
  let label: string;

  switch (route.name) {
    case 'Home':
      iconComponent = focused ? <HomeLogoFocused /> : <HomeLogo />;
      label = 'Home';
      break;
    case 'Tracker':
      iconComponent = focused ? <ReminderLogoFocused /> : <ReminderLogo />;
      label = 'Tracker';
      break;
    case 'Analytics':
      iconComponent = focused ? <AnalyticsLogoFocused /> : <AnalyticsLogo />;
      label = 'Analytics';
      break;
    case 'Journal':
      iconComponent = focused ? <JournalLogoFocused /> : <JournalLogo />;
      label = 'Journal';
      break;
    default:
      return null;
  }

  

  return (
    <View className={`justify-center items-center width-[100%] rounded-lg h-[100%] flex flex-row mb-0 ${
      focused ? 'bg-black w-[95px] h-[50] pl-[28px]' : 'bg-transparent'
    }`}>
      {iconComponent}
      {focused && <Text className='ml-2  text-white text-xs w-[100%] font-bold'>{label}</Text>}
    </View>
  );
}

function CustomDrawerContent(props) {
  return (
    <>
    <View className="justify-center bg-gray-700  h-14 pl-[88%]">
      <TouchableOpacity onPress={() => props.navigation.toggleDrawer()}>
        <MenuLogo />
      </TouchableOpacity>
      </View>
    <DrawerContentScrollView {...props} style={styles.drawer}>
      
      <DrawerItem
        label="Home"
        onPress={() => {
          if (props.navigation.getState().index !== 0) {  // Check if Home is already active
            props.navigation.navigate("Home");
          }
        }}
        style={styles.drawerItem}
        labelStyle={styles.drawerItemLabel}
      />
      <DrawerItem
        label="Tests"
        onPress={() => props.navigation.navigate('Tests')}
        style={styles.drawerItem}
        labelStyle={styles.drawerItemLabel}
      />
      
      <DrawerItem
        label="Dream Logs"
        onPress={() => props.navigation.navigate('DreamLog')}
        style={styles.drawerItem}
        labelStyle={styles.drawerItemLabel}
      />
      <DrawerItem
        label="Privacy policy"
        onPress={() => props.navigation.navigate('Privacy')}
        style={styles.drawerItem}
        labelStyle={styles.drawerItemLabel}
      />
      <DrawerItem
        label="Terms & Conditions"
        onPress={() => props.navigation.navigate('Terms')}
        style={styles.drawerItem}
        labelStyle={styles.drawerItemLabel}
      />
      <DrawerItem
        label="About Us"
        onPress={() => props.navigation.navigate('About')}
        style={styles.drawerItem}
        labelStyle={styles.drawerItemLabel}
      />
      
    </DrawerContentScrollView>
    </>
  );
}


function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        header: ({ route }) =>
          ["Privacy", "About", "Tests", "Helpline", "PasswordScreen", "Terms", "TestSummaryScreen"].includes(route.name) ? (
            <></>
          ) : (
            <Header
              title={
                route.name === "ReverieFacade"
                  ? "ReverieFacade"
                  : route.name === "DreamLog"
                  ? "Dream Logs"
                  : route.name
              }
            />
          ),
      }}
    >
      <Drawer.Screen name="ReverieFacade" component={MainTabs} />
    </Drawer.Navigator>
  );
}

export default function Index() {
  return (
    
    <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Drawer" component={DrawerNavigator} />
    <Stack.Screen name="Profile" component={Profile} />
    <Stack.Screen name="Privacy" component={PrivacyScreen} />
    <Stack.Screen name="About" component={AboutScreen} />
    <Stack.Screen name="Tests" component={TestsScreen} />
    <Stack.Screen name="DreamLog" component={DreamLogsScreen} />
    
    <Stack.Screen name="Terms" component={TermsScreen} />
    <Stack.Screen name="TestSummaryScreen" component={TestSummaryScreen} />
  </Stack.Navigator>
  
  
  );
}


const styles = StyleSheet.create({
  drawerItem: {
    marginVertical: 4,
    backgroundColor:'#2B303C',
    borderRadius:15,
    borderColor:'white',
    borderWidth:1,
    
  },
  drawerItemLabel: {
    fontSize: 18,
    color:'white'
  },
  drawer:{
    backgroundColor:"#1F1F1F"
  }
})