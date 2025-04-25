import React, { useEffect } from 'react';
import {
  StyleSheet,
  Image,
  Dimensions,
  View,
  Text,
  SafeAreaView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { loadAppConfigs } from '../store/configs';

const { width, height } = Dimensions.get('window');

export const SplashScreen = ({ navigation }) => {
  
  // const navigation= useNavigation();
  // const dispatch = useDispatch();

  // useEffect(() => {
  //   const initializeApp = async () => {
  //     try {
  //       await dispatch(loadAppConfigs());
  //       setTimeout(() => {
  //         navigation.replace('AuthLoader');
  //       }, 200);
  //     } catch (error) {
  //       navigation.replace('AuthLoader');
  //     }
  //   };

  //   initializeApp();
  // }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../../assets/new/welcome_screen_bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.contentContainer}>
        <Image
          source={require('../../assets/new/main_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>Your Pet, Our Security!</Text>
          <Text style={styles.subtitleText}>
            The best marketplace for {'\n'} exotic pets
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    // justifyContent: 'center',
    justifyContent: 'flex-start',
    paddingTop: height * 0.25,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 10,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 1,
  },
  titleText: {
    color: '#000',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitleText: {
    color: '#121212',
    fontWeight: '400',
    fontSize: 16,
    letterSpacing: 0.5,
    marginTop: 5,
    textAlign: 'center',
  },
});
