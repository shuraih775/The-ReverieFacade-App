import React, { useState, useEffect,useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Switch ,Platform} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { db,auth } from "../FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";

const STORAGE_KEY = "reminder_settings";
const LOGS_KEY = "daydream_logs"
const BACKGROUND_TASK_NAME = "uploadLogsTask";
// const NOTIFICATION_TASK = "notificationResponseTask";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const AlarmScreen = () => {
  const [frequency, setFrequency] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [editing,setEditing] = useState(false);
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();
  const [logs,setlogs] = useState([])
 
  const registerBackgroundTask = async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
    if (isRegistered) {
      console.log("Background task is already registered.");
      return;
    }
  
    const status = await BackgroundFetch.getStatusAsync();
    if (status === BackgroundFetch.BackgroundFetchStatus.Restricted || status === BackgroundFetch.BackgroundFetchStatus.Denied) {
      console.log("Background fetch is disabled");
      return;
    }
  
    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
      minimumInterval: 60 * 60 * 24, 
      stopOnTerminate: false,
      startOnBoot: true,
    });
  
    console.log("Background task registered successfully");
  };

  // const registerNotificationTask = async () => {
  //   const isRegistered = await TaskManager.isTaskRegisteredAsync(NOTIFICATION_TASK);
  //   if (!isRegistered) {
  //     await Notifications.registerTaskAsync(NOTIFICATION_TASK);
  //     console.log("notification tak registered");
  //     return
  //   }
  //   console.log("notification task already registered");
  // };
  
  const loadReminderSettings = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const { reminderStatus, frequency } = JSON.parse(storedData);
        setReminderEnabled(reminderStatus);
        setFrequency(frequency.toString());
       
      }
    } catch (error) {
      console.error("Error loading reminder settings:", error);
    }
  };
  const setupNotificationCategory = async () => {
    await Notifications.setNotificationCategoryAsync("daydream_reminder", [
      { identifier: "notDaydreaming", buttonTitle: "Not Daydreaming",options:{opensAppToForeground:false} },
      { identifier: "daydreaming", buttonTitle: "Daydreaming",options:{opensAppToForeground:false}  },
    ]);

    
  };
  const toggleReminder = async () => {
    const newStatus = !reminderEnabled;
    setReminderEnabled(newStatus);
    

    if (!newStatus) { 
      await Notifications.dismissAllNotificationsAsync()

      await Notifications.cancelAllScheduledNotificationsAsync();
      await saveReminderSettings(false, 0);
    }
    else{
      setEditing(true);
    }

    await saveReminderSettings(newStatus, Number(frequency) || 0);
  };

  const updateFrequency = (text: string) => {
    setFrequency(text);
    
  };
  const saveReminderSettings = async (status: boolean, freq: number) => {
    try {
      const data = { reminderStatus: status, frequency: freq };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving reminder settings:", error);
    }
  };

  async function schedulePushNotification(frequency:number) {
    try{
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Reminder",
          body: 'Were You Daydreaming Now?',
          data: { data: 'goes here', test: { test1: 'more data' } },
          categoryIdentifier:'daydream_reminder',
          autoDismiss:false
        },
        // identifier:'daydream_reminder',
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: frequency * 60,
          repeats:true
        },
      });
      if (!isNaN(Number(frequency)) && Number(frequency) > 0) {
        await saveReminderSettings(reminderEnabled, Number(frequency));
  
    }
    alert("Reminder is set")
    setEditing(false);
  }
    catch (error) {
      console.error("Error scheduling notification:", error);
    }
  
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));
    const initialize = async () => {
      await setupNotificationCategory();
      await loadReminderSettings();
    };
    initialize();
    registerBackgroundTask();
    // registerNotificationTask();

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
    }
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    Notifications.addNotificationResponseReceivedListener(async (response) => {
      const status = response.actionIdentifier === "daydreaming" ? "Daydreaming" : "Not Daydreaming";
      const timestamp = new Date().toISOString();
      const entry = { timestamp, status };
      alert(`${entry}`);
      let existingData:any = await AsyncStorage.getItem("daydream_logs");
      existingData = existingData ? JSON.parse(existingData) : [];
      alert(status)
      existingData.push(entry);

      await AsyncStorage.setItem("daydream_logs", JSON.stringify(existingData));
      await Notifications.dismissAllNotificationsAsync()
    });
    
    const getLogs = async ()=>{
      let existingData = await AsyncStorage.getItem("daydream_logs");
  setlogs(existingData ? JSON.parse(existingData) : []);
    }
    getLogs();
   

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View className="flex-1 bg-black p-5">
      <Text className="text-white text-3xl font-bold text-center mb-5">Set Reminder</Text>

      {/* Toggle Switch for Reminder */}
      <View className="flex-row items-center justify-between bg-[#3B3B3B] p-4 rounded-lg mb-4">
        <Text className="text-white text-lg">Enable Reminder</Text>
        <Switch value={reminderEnabled} onValueChange={toggleReminder} />
      </View>

      {reminderEnabled && (
        <View className="bg-[#2D2D2D] p-4 rounded-lg">
          <Text className="text-white text-lg mb-2">Frequency (minutes):</Text>
          {editing?(<>
            <TextInput
            className="bg-white text-black p-3 rounded-lg mb-4"
            placeholder="Enter frequency in minutes"
            keyboardType="numeric"
            value={frequency}
            onChangeText={updateFrequency}
          />
          <TouchableOpacity className="bg-[#1F1F1F] p-5 rounded-lg" 
  onPress={async () => {
    await schedulePushNotification(parseInt(frequency));
  }}>

          <Text className="text-center text-gray-100">Set Reminder</Text>
        </TouchableOpacity></>):(
          <View>
            <TouchableOpacity className="bg-[#1f1f1f] p-5 rounded-lg mt-2" onPress={()=>{setEditing(true)}}>
              <Text className="text-gray-100 text-center ">Edit Frequency</Text>
            </TouchableOpacity>
          </View>
        )}
        </View>
      )}
      {logs.length > 0 ? (
  logs.map((log) => (
    <View key={log.timestamp} className="p-2 bg-gray-800 rounded-lg my-1">
      <Text className="text-white">Timestamp: {log.timestamp}</Text>
      <Text className="text-white">Status: {log.status}</Text>
    </View>
  ))
) : (
  <View>
    <Text className="text-gray-400 text-center mt-4">No logs available</Text>
  </View>
)}
    </View>
  );
};




async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('myNotificationChannel', {
      name: 'A channel is needed for the permissions prompt to appear',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      // alert(`${projectId}`)
      if (!projectId) {

        throw new Error('Project ID not found');
      }
      token = (

        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    // alert('Must use physical device for Push Notifications');
  }

  return token;
}

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  console.log("Running background task for uploading logs...");

  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("No user logged in. Skipping log upload.");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const logs = await AsyncStorage.getItem(LOGS_KEY);
    if (!logs) return BackgroundFetch.BackgroundFetchResult.NoData;

    const parsedLogs = JSON.parse(logs);
    if (parsedLogs.length === 0) return BackgroundFetch.BackgroundFetchResult.NoData;

    await addDoc(collection(db, "daydream_logs"), {
      userId: user.uid, 
      logs: parsedLogs,
      uploadedAt: new Date().toISOString(),
    });

    console.log("Logs uploaded successfully");
    await AsyncStorage.removeItem(LOGS_KEY); 
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Error uploading logs:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// TaskManager.defineTask(NOTIFICATION_TASK, async ({ data, error }) => {
//   if (error) {
//     console.error("Notification Task Error:", error);
//     return;
//   }
//   alert('enteres')
//   if (!data) return;

//   const { notification, actionIdentifier } = data;
//   // alert(`${notification} ${actionId}`)
//   console.log("Received Background Notification Action:", actionIdentifier);
//   // alert('atep 2')

//   if (actionIdentifier === "daydreaming" || actionIdentifier === "notDaydreaming") {
//     const status = actionIdentifier === "daydreaming" ? "Daydreaming" : "Not Daydreaming";
//     const timestamp = new Date().toISOString();
//     const entry = { timestamp, status };
//     // alert('steo 3')

//     let existingData:any = await AsyncStorage.getItem("daydream_logs");
//     existingData = existingData ? JSON.parse(existingData) : [];
//     existingData.push(entry);

//     await AsyncStorage.setItem("daydream_logs", JSON.stringify(existingData));

//     console.log("Action processed in background:", entry);
//   }
// });


export default AlarmScreen;


