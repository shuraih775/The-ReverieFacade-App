import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image,ActivityIndicator } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { db,auth } from "../FirebaseConfig"; 
import { collection, addDoc } from "firebase/firestore";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
const  mood1 = require("../assets/images/mood1-icon.jpg");
const  mood2 = require("../assets/images/mood2-icon.jpg");
const  mood3 = require("../assets/images/mood3-icon.jpg");
const  mood4 = require("../assets/images/mood4-icon.jpg");
const  mood5 = require("../assets/images/mood5-icon.jpg");


const MoodJournalScreen = () => {
  const [moodText, setMoodText] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedCurrentWork, setSelectedCurrentWork] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('');
  const [loading,setLoading] = useState(false);

  const moodImages = [
    { name: 'angry', image: mood1  },
    { name: 'happy', image: mood2 },
    { name: 'normal', image: mood3  },
    { name: 'sad', image: mood4  },
    { name: 'very sad', image: mood5  },
  ];

  const timeOptions = [
    { label: 'Morning', value: 'morning' },
    { label: 'Afternoon', value: 'afternoon' },
    { label: 'Evening', value: 'evening' },
    { label: 'Night', value: 'night' },
  ];

  const workOptions = [
    { label: 'Eating', value: 'eating' },
    { label: 'Scrolling social media apps', value: 'scrolling' },
    { label: 'Listening to music', value: 'music' },
    { label: 'Simply Walking', value: 'walking' },
    { label: 'Studying or working', value: 'studying' },
    { label: 'Binge watching', value: 'binge watching' },
    { label: 'Having a conversation', value: 'conversation' },
    { label: 'Bathing or using washroom', value: 'using washroom' },
    { label: 'Being idle', value: 'idle' },
    { label: 'Laying on bed before or after sleep', value: 'laying' },
    { label: 'Doing a physical activity', value: 'activity' },
    { label: 'Other', value: 'other' },
  ];

  const themeOptions = [
    { label: 'Fulfilling Relationships', value: 'relationships' },
    { label: 'Conquering Challenges', value: 'challenges' },
    { label: 'Being center of attention', value: 'being center of attention' },
    { label: 'Being Succesful', value: 'being succesful' },
    { label: 'Fantasy', value: 'fantasy' },
    { label: 'Righting Wrongs', value: 'justice' },
    { label: 'Power & Control', value: 'power' },
    { label: 'Supernatural', value: 'supernatural' },
    { label: 'Sexual', value: 'sexual' },
    
    { label: 'Revenge or Vindication', value: 'revenge' },
    { label: 'Griefing', value: 'grief' },
    { label: 'Other', value: 'other' },
  ];

  const resetFields = () =>{
  setMoodText('');
  setDuration('');
  }


  const handleLogDream = async () => {
    setLoading(true);
    await auth.currentUser?.reload(); 
    const user = auth.currentUser;
  
    if (!user) {
      alert("You must be logged in to log a dream.");
      setLoading(false);
      return;
    }
  
    if (!selectedMood || !selectedTheme || !selectedTime || !selectedCurrentWork || !duration) {
      alert("Please fill in all required fields before logging the dream.");
      setLoading(false);
      return;
    }
  
    const dreamData = {
      userId: user.uid,
      mood: selectedMood,
      theme: selectedTheme,
      time: selectedTime,
      duration: duration,
      workDuringDream: selectedCurrentWork,
      dreamDescription: moodText, 
      createdAt: new Date(),
    };
  
    try {
      await addDoc(collection(db, "journals"), dreamData);
      resetFields();
      alert("Dream logged successfully!");
    } catch (error) {
      console.error("Error logging dream:", error);
      alert("Failed to log dream.");
    }
    setLoading(false);
  };
  
  



  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
  <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
    
      <Text className='text-3xl text-white font-bold mb-10' >Journal</Text>
      <Text style={styles.subtitle}>How was your mood before you started to daydream?</Text>
      <View style={styles.moodIcons}>
        {moodImages.map((mood, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedMood(mood.name)}
            style={[
              styles.moodIconContainer,
              selectedMood === mood.name && styles.selectedMood,
            ]}
          >
            <Image source={mood.image} style={styles.moodIcon} />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.subtitle}>What was the theme of your dream?</Text>
      <View style={styles.dropdownContainer}>
        <RNPickerSelect
          onValueChange={(value) => setSelectedTheme(value)}
          items={themeOptions}
          style={{
            ...pickerSelectStyles,
            iconContainer: {
              top: 12, right: 10, position: "absolute",
            },
          }}
          placeholder={{ label: 'Select a theme...', value: null }}
         
        />
      </View>
      <Text style={styles.subtitle}>At what time of the day?</Text>
      <View style={styles.dropdownContainer}>
        <RNPickerSelect
          onValueChange={(value) => setSelectedTime(value)}
          items={timeOptions}
          style={{
            ...pickerSelectStyles,
            iconContainer: {
              top: 12, right: 10, position: "absolute",
            },
          }}
          placeholder={{ label: 'Select a time...', value: null }}
        
        />
      </View>
      <Text style={styles.subtitle}>What was the duration of your dream?</Text>
      <TextInput
        style={styles.textInput}
        placeholder="in minutes"
        placeholderTextColor="gray"
        value={duration}
        onChangeText={setDuration}
      />
      <Text style={styles.subtitle}>What were you doing when you started daydreaming?</Text>
      <View style={styles.dropdownContainer}>
        <RNPickerSelect
          onValueChange={(value) => setSelectedCurrentWork(value)}
          items={workOptions}
          style={{
            ...pickerSelectStyles,
            iconContainer: {
              top: 12, right: 10, position: "absolute",
            },
          }}
          placeholder={{ label: 'Select a task...', value: null }}
          
        />
      </View>
    
      <Text style={styles.subtitle}>Write about your dream</Text>
      <TextInput
        style={styles.textInput}
        placeholder="write about the characters and the story"
        placeholderTextColor="gray"
        multiline
        value={moodText}
        onChangeText={setMoodText}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogDream} disabled={loading}>
    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Log Dream</Text>}
  </TouchableOpacity>
    </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    
  },
  moodIcons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  moodIconContainer: {
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 25,
  },
  moodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  selectedMood: {
    backgroundColor: 'gray',
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
  },
  dropdownContainer: {
    width: '100%',
    borderColor: '#1F1F1F',
    borderRadius: 5,
    marginBottom: 20,
    borderWidth:1,
    paddingHorizontal:10,
    // padding:2,
    backgroundColor:"#1F1F1F"
  
  },
  textInput: {
    width: '100%',
    height: 65,
    borderColor: '#1F1F1F',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#1F1F1F',
    color:'white',
    paddingVertical:0
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth:1,
    borderColor:'white'
  },
  buttonText: {
    color: '#ccc',
    fontSize: 16,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    // paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: '#1F1F1F',
    paddingRight: 30,
    backgroundColor: '#fff',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
  
    borderWidth: 0.5,

    borderRadius: 8,
    color: 'white',
    paddingRight: 30,
    backgroundColor: '#1F1F1F',
  },
  placeholder: {
    color: "gray", 
  },
  
});

export default MoodJournalScreen;
