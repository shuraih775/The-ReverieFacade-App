
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ProfileLogo from './profile';
import HomeLogo from './homelogo';
import MenuLogo from './menulogo';
import { useNavigation } from '@react-navigation/native';

import { DrawerNavigationProp } from '@react-navigation/drawer';


type RootStackParamList = {
  Profile: undefined;
};

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const navigation =  useNavigation<DrawerNavigationProp<RootStackParamList>>();


  return (
    <View className='bg-gray-700' style={styles.headerContainer}>
      <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
        <MenuLogo />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      {title === 'Profile'?
      (<TouchableOpacity onPress={() => navigation.goBack()}>
        <HomeLogo />
      </TouchableOpacity>)
      :(<TouchableOpacity onPress={() => navigation.navigate('Profile')}>
      <ProfileLogo />
    </TouchableOpacity>)}
      
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    // marginTop: 30,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor: 'black',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Header;
