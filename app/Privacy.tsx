import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Arrow from './components/leftArrow';


const openURL = (url:string):void => {
    const formattedURL = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    Linking.openURL(formattedURL).catch((err) => console.error("Failed to open URL:", err));
};

function PrivacyPolicy() {
  const navigation = useNavigation();

  return (
    <View style={{backgroundColor:'black',height:'100%'}}>
    <View style={styles.content}>
        <TouchableOpacity style={styles.icon} onPress={() => navigation.goBack()}>
          <Arrow color="#ccc"/>
        </TouchableOpacity>
        <Text style={styles.textHeader}>Privacy Policy</Text>
        <Text style={styles.text}>
          At Reverie Facade, we prioritize your privacy and are committed to protecting your personal information. Our privacy policy outlines how we collect, use, and safeguard your data while you use our app. We ensure that your information is handled with the utmost care and in compliance with all relevant regulations. To learn more about our practices, please visit our full Privacy Policy page.
          {'\n'}
          Read our full Privacy Policy at {'\n'}
          <TouchableOpacity onPress={() => openURL('https://reveriefacade.netlify.app')}>
            <Text  style={styles.link}>reveriefacade.netlify.app</Text>
          </TouchableOpacity>
        </Text>
    </View>
    </View>
  );
}

export default PrivacyPolicy;

const styles = StyleSheet.create({
  textHeader: {
    color: '#5D6277',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5
  },
  content: {
    margin: 28,
    
    backgroundColor: '#1F1F1F',
    borderRadius: 15,
    height: '80%',
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
