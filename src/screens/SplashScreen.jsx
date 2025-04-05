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
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await dispatch(loadAppConfigs());
        setTimeout(() => {
          navigation.replace('AuthLoader');
        }, 200);
      } catch (error) {
        navigation.replace('AuthLoader');
      }
    };

    initializeApp();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Section (Abstract Background) */}
      <View style={styles.topSection}>
        <Image
          source={require('../../assets/latest/splash_above_icon.png')}
          style={styles.topImage}
          resizeMode="cover"
        />
      </View>

      {/* Middle Section (Logo & Text) */}
      <View style={styles.middleSection}>
        <Image
          source={require('../../assets/latest/petbooker_icon.png')}
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

      {/* Bottom Section (Abstract Background) */}
      <View style={styles.bottomSection}>
        <Image
          source={require('../../assets/latest/splash_bottom_icon.png')}
          style={styles.bottomImage}
          resizeMode='contain'
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  topSection: {
    flex: 1, // ✅ More dynamic
    width: '100%',
    height: height * 0.5,
    top: 0,
    position: 'absolute'
  },
  middleSection: {
    flex: 4, // ✅ Ensures spacing
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    flex: 1, // ✅ Dynamic bottom spacing
    width: '100%',
  },
  topImage: {
    width: '100%',
    height: '100%',
  },
  logo: {
    width: width * 0.5, // ✅ Slightly smaller for better balance
    height: width * 0.5,
    marginBottom: 10, // ✅ Adjusted spacing
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  titleText: {
    color: '#000',
    fontSize: 24, // ✅ Slightly smaller for balance
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
  bottomImage: {
    width: '100%',
    height: '130%',
    left: -10,
    bottom: -10,
  },
});

