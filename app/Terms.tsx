import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity,Linking,ScrollView} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Arrow from './components/leftArrow';


const openURL = (url: string): void  => {
    const formattedURL = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    Linking.openURL(formattedURL).catch((err) => console.error("Failed to open URL:", err));
};


function About() {
    const navigation = useNavigation();
  return (
    <ScrollView contentContainerStyle={{backgroundColor:'black',flexGrow:1}}>
    <View style={styles.content}>
        <TouchableOpacity style={styles.icon} onPress={() => navigation.goBack()}>
        <Arrow color="#ccc"/>
        </TouchableOpacity>
        <Text style={styles.textHeader}>About Us</Text>
        <Text style={styles.text}>
        
        Welcome to Reverie Facade, an app designed to aid self-awareness and recovery from maladaptive daydreaming. By using the App, you agree to these terms, our Privacy Policy, and applicable laws. If you disagree, refrain from using the App.

        {'\n\n'}Purpose:{'\t'} The App helps users explore daydreams, fostering mindfulness and personal growth. It does not provide medical or psychological advice, nor is it intended to diagnose, treat, cure, or prevent any disease.

        {'\n\n'}User Responsibilities:{'\t'} You are responsible for your use of the App and its consequences. Do not use the App in ways that violate laws or infringe on others' rights.

        {'\n\n'}Disclaimer:{'\t'} The App is provided "as-is" without warranties of accuracy, reliability, or suitability. Use at your own risk.

        {'\n\n'}Liability:{'\t'} We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the App, including lost profits or data.

        {'\n\n'}Changes to Terms:{'\t'} We may modify these terms at any time. Continued use after changes constitutes acceptance.

{'\n\n'}
Learn more at <TouchableOpacity onPress={() => openURL('reveriefacade.netlify.app')}>
          <Text style={styles.link}>reveriefacade.netlify.app</Text>
        </TouchableOpacity></Text>
    </View>
    </ScrollView>
  )
}

export default About;

const styles = StyleSheet.create({
    textHeader: {
      color: '#5D6277',
      fontSize: 25,
      fontWeight: 'bold',
      marginBottom: 5
    },
    content: {
      margin: 28,
      
      backgroundColor: '#1F1F1F',
      borderRadius: 15,
      height: '95%',
      padding: 15,
      marginTop:50
    },
    text: {
      fontSize: 20,
      color: '#ccc',
      fontWeight: 'bold',
      
    },
    link: {
      fontSize: 22,
      color: 'yellow',
      fontWeight: 'bold',
      textDecorationLine: 'underline',
      
    },
    icon: {
      marginBottom: 40,
    }
  });
  