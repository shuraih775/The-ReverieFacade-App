import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LeftArrow from './components/leftArrow';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  MaladaptiveDaydreaming: { passedThreshold?: boolean };
};

type Props = NativeStackScreenProps<RootStackParamList, 'MaladaptiveDaydreaming'>;

const MaladaptiveDaydreamingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { passedThreshold } = route.params || {}; // Get test result argument safely

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <LeftArrow />
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>
          {passedThreshold
            ? "Your test indicates that you might have Maladaptive Daydreaming. Consider consulting a Psychiatrist."
            : "Your test does not indicate significant Maladaptive Daydreaming tendencies."}
        </Text>
      </View>

      <View style={styles.helpContainer}>
        <Text style={styles.helpHeader}>Here's how we can help</Text>
        <Text style={styles.helpText}>• Log daydreams as and when they occur.</Text>
        <Text style={styles.helpText}>• The analytics will help set up timely reminders for you.</Text>
        <Text style={styles.helpText}>• Our goal is to guide you towards self-realization and improved productivity.</Text>
        <Text style={styles.helpText}>• Thank you, and we wish you the best!</Text>
      </View>

      <View style={styles.infoContainer}>
        <Ionicons name="information-circle-outline" size={18} color="gray" />
        <Text style={styles.infoText}>
          This information will be recorded and used for later analysis. Refer to the privacy policy for details.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#E5F0F2', marginTop: 30 },
  backButton: { position: 'absolute', top: 20, left: 10 },
  card: { backgroundColor: '#A8C8C8', borderRadius: 15, padding: 20, marginTop: 80, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#3D4C4C', textAlign: 'center' },
  helpContainer: { backgroundColor: '#A8C8C8', borderRadius: 15, padding: 20, marginTop: 20 },
  helpHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  helpText: { fontSize: 14, marginVertical: 5 },
  infoContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 30 },
  infoText: { fontSize: 12, color: 'gray', marginLeft: 5 },
});

export default MaladaptiveDaydreamingScreen;
