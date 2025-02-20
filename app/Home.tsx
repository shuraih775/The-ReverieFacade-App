import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity,Dimensions } from 'react-native';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { auth } from "../FirebaseConfig"; // Firebase authentication instance
import Icon from 'react-native-vector-icons/Ionicons'; // Importing Ionicons for the info icon

const { width } = Dimensions.get('window');
const circleSize = 144; 
const gap = width * 0.1;

function Home() {
  const [daydreamCount, setDaydreamCount] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [commonTrigger, setCommonTrigger] = useState("N/A");
  const [refreshing, setRefreshing] = useState(false); 

  const [showDescription, setShowDescription] = useState({
    totalMinutes: false,
    daydreamCount: false,
    commonTrigger: false,
  });

  // Function to fetch daydream data
  const fetchDaydreamData = async () => {
    setRefreshing(true);

    const user = auth.currentUser;
    if (!user) {
      setRefreshing(false);
      return;
    }

    const db = getFirestore();
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const q = query(collection(db, "journals"), where("userId", "==", user.uid));

    try {
      const querySnapshot = await getDocs(q);
      let count = 0;
      let totalDuration = 0;
      let triggerCounts = {};

      querySnapshot.forEach((doc) => {
        const entry = doc.data();
        if (!entry.createdAt || !entry.createdAt.seconds) return; 

        const entryDate = new Date(entry.createdAt.seconds * 1000); 
        if (entryDate.toDateString() === today.toDateString()) { 
          count++;
          totalDuration += parseInt(entry.duration, 10) || 0;

          if (entry.workDuringDream) {
            triggerCounts[entry.workDuringDream] = (triggerCounts[entry.workDuringDream] || 0) + 1;
          }
        }
      });

      
      const mostCommonTrigger = Object.keys(triggerCounts).reduce((a, b) => 
        triggerCounts[a] > triggerCounts[b] ? a : b, "N/A"
      );

      setDaydreamCount(count);
      setTotalMinutes(totalDuration);
      setCommonTrigger(mostCommonTrigger);
    } catch (error) {
      console.error("Error fetching daydream data: ", error);
    }

    setRefreshing(false); 
  };

 
  useEffect(() => {
    fetchDaydreamData();
  }, []);

  const toggleDescription = (section) => {
    setShowDescription((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchDaydreamData} />}
    >
      <View style={{ flex: 1, backgroundColor: 'black', alignItems: 'center', paddingTop: 40 }}>
        
        {/* Circular Borders */}
        <View style={{
          position: 'absolute',
          top: 80,
          left: width * 0.05, 
          width: circleSize,
          height: circleSize,
          borderWidth: 1,
          borderColor: 'white',
          borderRadius: circleSize / 2,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text className="text-white text-4xl">{totalMinutes}</Text>
          <Text className="text-xl text-white">mins</Text>
          <TouchableOpacity style={{ position: 'absolute', top: -5, right: -5 }} onPress={() => toggleDescription('totalMinutes')}>
            <Icon name="information-circle" size={20} color="white" />
          </TouchableOpacity>
          {showDescription.totalMinutes && (
            <View style={{ position: 'absolute', top: 0, left: circleSize + 10, backgroundColor: 'black', borderColor: 'white', borderWidth: 1, padding: 8, borderRadius: 8 }}>
              <Text className="text-white">Total minutes you spent daydreaming today.</Text>
            </View>
          )}
        </View>

        <View style={{
          position: 'absolute',
          top: 80,
          left: width * 0.75 - circleSize / 2, 
          width: circleSize,
          height: circleSize,
          borderWidth: 1,
          borderColor: 'white',
          borderRadius: circleSize / 2,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        >
          <Text className="text-white text-4xl">{daydreamCount}</Text>
          <Text className="text-xl text-white">times</Text>
          <TouchableOpacity style={{ position: 'absolute', top: -5, right: -5 }} onPress={() => toggleDescription('daydreamCount')}>
            <Icon name="information-circle" size={20} color="white" />
          </TouchableOpacity>
          {showDescription.daydreamCount && (
            <View style={{ position: 'absolute', top: 16, left: circleSize - 122, backgroundColor: 'black', borderColor: 'white', borderWidth: 1, padding: 8, borderRadius: 8 }}>
              <Text className="text-white">The number of times you daydreamed today.</Text>
            </View>
          )}
        </View>

        <View style={{
          position: 'absolute',
          top: 222,
          left: width * 0.69 - circleSize, 
          width: circleSize,
          height: circleSize,
          borderWidth: 1,
          borderColor: 'white',
          borderRadius: circleSize / 2,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text className="text-white text-center text-xl px-2">{commonTrigger}</Text>
          <TouchableOpacity style={{ position: 'absolute', top: -5, right: -5 }} onPress={() => toggleDescription('commonTrigger')}>
            <Icon name="information-circle" size={20} color="white" />
          </TouchableOpacity>
          {showDescription.commonTrigger && (
            <View style={{ position: 'absolute', top: 16, left: circleSize - 16, backgroundColor: 'black', borderColor: 'white', borderWidth: 1, padding: 8, borderRadius: 8 }}>
              <Text className="text-white">The task where you daydreamed most today.</Text>
            </View>
          )}
        </View>

        {/* Tips Section */}
        <View style={{
          position: 'absolute',
          bottom: 50,
          width: '85%',
          padding: 10,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 10,
          backgroundColor: '#222',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 4,
        }}>
          <Text className='text-white text-2xl text-center font-semibold'>Some Tips:</Text>
          <Text className='text-white mb-1'> • Keep yourself busy</Text>
          <Text className="text-white mb-1"> • Engage in physical activities like walking or exercise</Text>
          <Text className="text-white mb-1"> • Journal your thoughts to track and understand patterns</Text>
          <Text className='text-white mb-1'> • Avoid music if it triggers excessive daydreaming</Text>
        </View>

      </View>
    </ScrollView>
  );
}

export default Home;
