import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import Arrow from './components/leftArrow';
import BackGr from './components/cloudIcon';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import { auth } from "../FirebaseConfig";

const screenWidth = Dimensions.get("window").width;

type RootStackParamList = {
  TestSummaryScreen: { passedThreshold: boolean };
  
};

interface Question {
  id: string;
  question: string;
  weight: number;
}

const questions: Question[] = [
  { id: '1', question: 'How often do you find yourself daydreaming?', weight: 1.2 },
  { id: '2', question: 'Are your daydreams vivid and immersive, often lasting a long time?', weight: 1.5 },
  { id: '3', question: 'How often do you daydream when you should be focused, like at work or while driving?', weight: 1.8 },
  { id: '4', question: 'Do you daydream in stressful situations?', weight: 1.0 },
  { id: '5', question: 'How often do you listen to music?', weight: 1.3 },
  { id: '6', question: 'How often do you daydream while listening to music?', weight: 1.7 },
  { id: '7', question: 'Is it hard to control when you start daydreaming?', weight: 2.0 },
  { id: '8', question: 'Do you feel restlessness in your body, especially your legs?', weight: 1.1 },
  { id: '9', question: 'Do you start pacing while daydreaming?', weight: 1.6 },
  { id: '10', question: 'How often do you lose track of time while daydreaming?', weight: 1.4 },
];

const options: string[] = ['Very often', 'Often', 'Sometimes', 'Rarely or never'];
const optionWeights: { [key: string]: number } = { 'Very often': 4, 'Often': 3, 'Sometimes': 2, 'Rarely or never': 1 }; 
const threshold: number = 30;

type Answer = string | null;

export default function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Answer[]>(Array(questions.length).fill(null));
  const navigation = useNavigation();

  const calculateScore = (): number => {
    let totalScore = 0;
    answers.forEach((answer, index) => {
      if (answer) {
        const questionWeight = questions[index].weight;
        const optionWeight = optionWeights[answer] || 0;
        totalScore += questionWeight * optionWeight;
      }
    });
    return totalScore;
  };

  const handleAnswer = (answer: string): void => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = (): void => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitAnswers();
    }
  };

  const handlePrev = (): void => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitAnswers = async (): Promise<void> => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    if (answers.includes(null)) {
      Alert.alert("Incomplete Test", "Please answer all questions before submitting.");
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log("No authenticated user.");
        return;
      }

      const db = getFirestore();
      const name = "Maladaptive Daydreaming Detection and Severity Test";

      const q = query(collection(db, "tests"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (docSnapshot) => {
        await deleteDoc(doc(db, "tests", docSnapshot.id));
      });

      const finalScore = calculateScore();
      const passedThreshold = finalScore >= threshold;

      await addDoc(collection(db, "tests"), {
        userId: user.uid,
        name: name,
        answers: answers,
        finalScore: finalScore,
        passedThreshold: passedThreshold,
        createdAt: new Date()
      });

      setAnswers(Array(questions.length).fill(null));
      navigation.navigate("TestSummaryScreen", { passedThreshold })
    } catch (error) {
      console.error("Error submitting test:", error);
    }
  };

  const renderQuestion = (): JSX.Element => {

    return (
      <>
        <View style={styles.graphicContainer}>
          <BackGr screenwidth={screenWidth} />
          <TouchableOpacity style={styles.navigateHomeArrow} onPress={() => { navigation.goBack() }}>
            <Arrow color='#FFFFFF' />
          </TouchableOpacity>
        </View>
        <View style={styles.questionContainer}>
          <Text style={styles.questionHeader}>Question {currentQuestionIndex + 1}/{questions.length}</Text>
          <Text style={styles.questionText}>{questions[currentQuestionIndex].question}</Text>
        </View>
        <View style={styles.optionContainer}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                answers[currentQuestionIndex] === option && styles.selectedOption,
              ]}
              onPress={() => handleAnswer(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.navigationContainer}>
          {currentQuestionIndex > 0 && (
            <TouchableOpacity style={styles.navButton} onPress={handlePrev}>
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          {currentQuestionIndex < questions.length - 1 ? (
            <TouchableOpacity style={styles.navButton} onPress={handleNext}>
              <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.navButton} onPress={submitAnswers}>
              <Text style={styles.navButtonText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      {renderQuestion()}
    </View>
  );
}

const styles = StyleSheet.create({
  graphicContainer: {
    height: 100,
    width: '95%',
    borderRadius: 25,
    position: 'relative',
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionContainer: {
    backgroundColor: '#1F1F1F',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    marginTop: 30,
  },
  questionHeader: {
    fontSize: 14,
    color: '#5D6277',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color:"#ccc"
  },
  optionButton: {
    backgroundColor: '#2E456F',
    padding: 15,
    borderRadius: 25,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#5A81A7',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  navButton: {
    backgroundColor: '#2E456F',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '27%',
    alignItems: 'center',
    marginLeft: 50,
    marginRight: 50,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionContainer: {
    alignItems: 'center',
    marginTop: 40,
    width: 200,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navigateHomeArrow: {
    position: 'absolute',
    top: 0, 
    left: 0, 
    padding: 20, 
  },
});
