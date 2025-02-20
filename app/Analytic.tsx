import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { getFirestore, collection, query, where, getDocs, DocumentData } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from "../FirebaseConfig";  
import { onAuthStateChanged } from 'firebase/auth';
import MonthlyAnalytics from './MonthlyAnalytic';
import WeeklyAnalytics from './WeeklyAnalytic';
import DailyAnalytics from './DailyAnalytic';

const screenWidth = Dimensions.get("window").width;

interface JournalEntry {
  id:string,
  createdAt: { seconds: number }; 
  dreamDescription: string;
  duration: string; 
  mood: string;
  theme: string;
  time: string;
  userId: string;
  workDuringDream: string;
}

interface MonthlyData {
  [month: number]: JournalEntry[];
}

interface DailyData {
  [day: string]: JournalEntry[];
}

interface WeeklyData {
  [week: string]: { totalDuration: number; entries: JournalEntry[] };
}

const AnalyticsScreen: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<"Daily" | "Weekly" | "Monthly">("Monthly");
  const [data, setData] = useState<JournalEntry[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({});
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({});
  const [dailyData, setDailyData] = useState<DailyData>({});
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!auth.currentUser);

  const fetchData = async (): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log("No authenticated user.");
        return;
      }

      setIsLoggedIn(true);
      const db = getFirestore();
      const q = query(collection(db, "journals"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      const fetchedData: JournalEntry[] = [];
      querySnapshot.forEach((doc) => {
        fetchedData.push({ id: doc.id, ...doc.data() } as JournalEntry);
      });

      await AsyncStorage.setItem("journalsData", JSON.stringify(fetchedData));
      setData(fetchedData);
      processAnalytics(fetchedData);
    } catch (error) {
      console.error("Error fetching journal entries: ", error);
    }
  };

  const loadDataFromStorage = async (): Promise<void> => {
    try {
      const storedData = await AsyncStorage.getItem("journalsData");
      if (storedData) {
        const parsedData: JournalEntry[] = JSON.parse(storedData);
        setData(parsedData);
        processAnalytics(parsedData);
      }
    } catch (error) {
      console.error("Error loading data from storage: ", error);
    }
  };

  const processAnalytics = (entries: JournalEntry[]): void => {
    computeMonthlyAnalytics(entries);
    computeDailyAnalytics(entries);
    computeWeeklyAnalytics(entries);
  };

  const computeMonthlyAnalytics = (entries: JournalEntry[]): void => {
    const groupedData = entries.reduce<MonthlyData>((acc, entry) => {
      if (!entry.createdAt || !entry.createdAt.seconds) return acc;
      const entryDate = new Date(entry.createdAt.seconds * 1000);
      const month = entryDate.getMonth() + 1;
      if (!acc[month]) acc[month] = [];
      acc[month].push(entry);
      return acc;
    }, {});
    setMonthlyData(groupedData);
  };

  const computeDailyAnalytics = (entries: JournalEntry[]): void => {
    const days: DailyData = {};
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);

    entries.forEach(entry => {
      if (!entry.createdAt || !entry.createdAt.seconds) return;
      const entryDate = new Date(entry.createdAt.seconds * 1000);
      if (entryDate >= startOfWeek && entryDate <= today) {
        const dayKey = entryDate.toLocaleDateString('en-US', { weekday: 'long' });
        if (!days[dayKey]) days[dayKey] = [];
        days[dayKey].push(entry);
      }
    });

    setDailyData(days);
  };

  const computeWeeklyAnalytics = (entries: JournalEntry[]): void => {
    const weeks: WeeklyData = {};
    const currentMonth = new Date().getMonth() + 1;

    entries.forEach(entry => {
      if (!entry.createdAt || !entry.createdAt.seconds) return;
      const entryDate = new Date(entry.createdAt.seconds * 1000);
      const entryMonth = entryDate.getMonth() + 1;

      if (entryMonth === currentMonth) {
        const startOfWeek = new Date(entryDate);
        startOfWeek.setDate(entryDate.getDate() - entryDate.getDay() + 1);
        const weekNumber = Math.ceil(startOfWeek.getDate() / 7);
        const weekKey = `Week ${weekNumber}`;

        if (!weeks[weekKey]) weeks[weekKey] = { totalDuration: 0, entries: [] };

        const duration = parseInt(entry.duration || "0", 10);
        weeks[weekKey].totalDuration += duration;
        weeks[weekKey].entries.push(entry);
      }
    });

    setWeeklyData(weeks);
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        loadDataFromStorage();
        fetchData();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <View className="min-h-screen bg-[#1F1F1F]">
      {!isLoggedIn ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg font-bold">Please log in to view analytics.</Text>
        </View>
      ) : (
        <>
          <View
            className="bg-gray-600 flex-row justify-evenly items-center rounded-[40px] mt-5 h-20 p-2 px-10 mx-auto"
            style={{ width: screenWidth - 30 }}
          >
            {["Daily", "Weekly", "Monthly"].map((screen) => (
              <TouchableOpacity
                key={screen}
                onPress={() => setCurrentScreen(screen as "Daily" | "Weekly" | "Monthly")}
                className={`h-full w-[34%] rounded-2xl flex items-center justify-center ${
                  currentScreen === screen ? "bg-[#1F1F1F]" : ""
                }`}
              >
                <Text className={currentScreen === screen ? "text-white" : ""}>{screen}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            className="m-0 p-0 bg-[#1F1F1F] pt-5"
            contentContainerStyle={{ alignItems: "center", justifyContent: "center", flexGrow: 1 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {currentScreen === "Daily" ? (
              <DailyAnalytics dailydata={dailyData} />
            ) : currentScreen === "Weekly" ? (
              <WeeklyAnalytics data1={weeklyData} />
            ) : (
              <MonthlyAnalytics data={monthlyData} />
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

export default AnalyticsScreen;
