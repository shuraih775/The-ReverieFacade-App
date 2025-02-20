import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, query, where, getDocs, orderBy, limit, startAfter } from "firebase/firestore";
import { auth } from "../FirebaseConfig"; 
import LeftArrow from './components/leftArrow';

const PAGE_SIZE = 10;

const DreamLogsScreen = () => {
  const [dreams, setDreams] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const navigation = useNavigation();

  const fetchDreams = async (loadMore = false) => {
    if (loading || (loadMore && !hasMore)) return;
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("You need to be logged in to view your dreams.");
        setLoading(false);
        return;
      }

      const db = getFirestore();
      let q = query(
        collection(db, "journals"),
        where("userId", "==", user.uid),
        orderBy("time", "desc"),
        limit(PAGE_SIZE)
      );

      if (loadMore && lastDoc) {
        q = query(
          collection(db, "journals"),
          where("userId", "==", user.uid),
          orderBy("time", "desc"),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      }

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setHasMore(false);
      }

      const dreamEntries = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

      setDreams(prevDreams => (loadMore ? [...prevDreams, ...dreamEntries] : dreamEntries));
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
    } catch (error) {
      console.error("Error fetching dreams: ", error);
      Alert.alert("Error", "Could not load dreams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDreams();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setHasMore(true);
    setLastDoc(null);
    await fetchDreams();
    setRefreshing(false);
  };

  return (
    <View className='bg-black h-[100%]'>
      <TouchableOpacity className='pl-5 pt-10' onPress={() => navigation.goBack()}>
        <LeftArrow color="white" />
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 10, alignItems: 'center' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text className='text-3xl text-[gray] mb-5'>Dream Logs</Text>
        {dreams.map((dream) => (
          <View key={dream.id} style={{ width: '100%', backgroundColor: '#1F1F1F', padding: 20, borderRadius: 10, marginBottom: 20 }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: "300" }}>Mood: {dream.mood}</Text>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: "300" }}>Theme: {dream.theme}</Text>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: "300" }}>Time: {dream.time}</Text>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: "300" }}>Duration: {dream.duration} minutes</Text>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: "300" }}>Task: {dream.workDuringDream}</Text>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: "300" }}>Description: {dream.dreamDescription}</Text>
          </View>
        ))}
        {hasMore && !loading && (
          <TouchableOpacity style={{ padding: 15, backgroundColor: '#444', borderRadius: 10, alignItems: 'center', marginBottom: 20 }} onPress={() => fetchDreams(true)}>
            <Text style={{ color: 'white', fontSize: 16 }}>Load More</Text>
          </TouchableOpacity>
        )}
        {loading && <ActivityIndicator size="large" color="white" />}
      </ScrollView>
    </View>
  );
};

export default DreamLogsScreen;
