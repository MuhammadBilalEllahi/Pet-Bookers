import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  Image,
  Dimensions,
  View,
  Text,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import {useTheme} from '../theme/ThemeContext';
import {useTranslation} from 'react-i18next';

const {width, height} = Dimensions.get('window');

export const EnhancedSplashScreen = ({
  onAnimationComplete,
  showLoadingText = false,
  loadingText = 'Loading...',
  duration = 2000,
  isAuthLoaded = false,
}) => {
  const {isDark, theme} = useTheme();
  const {t} = useTranslation();

  // Animation values
  const logoScale = useRef(new Animated.Value(1)).current; // Start exactly same size as Splash
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const textTranslateY = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start the animation sequence
    startAnimationSequence();
  }, []);

  useEffect(() => {
    // When auth is loaded, complete the animation
    if (isAuthLoaded) {
      checkAndComplete();
    }
  }, [isAuthLoaded]);

  const checkAndComplete = () => {
    // Make sure animation has had time to run
    setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 100);
  };

  const startAnimationSequence = () => {
    // Start background fade immediately
    Animated.timing(backgroundOpacity, {
      toValue: 0, // Fade out background
      duration: 300,
      delay: 0,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();

    const animationSequence = Animated.sequence([
      // Show the logo briefly before zoom
      Animated.delay(200),

      // 💥 Fast zoom-out burst (complete in ~400ms)
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 7, // Big zoom to fill screen
          duration: 700,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 0, // Fade out completely
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]);

    animationSequence.start(() => {
      // Animation complete, but wait for auth if not loaded yet
      if (isAuthLoaded && onAnimationComplete) {
        onAnimationComplete();
      }
    });
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
        },
      ]}>
      <Animated.View
        style={[
          styles.backgroundContainer,
          {
            opacity: backgroundOpacity,
          },
        ]}>
        <FastImage
          source={
            isDark
              ? require('../../assets/new/welcome_screen_bg_dark.png')
              : require('../../assets/new/welcome_screen_bg.png')
          }
          style={styles.backgroundImage}
          resizeMode={FastImage.resizeMode.cover}
          priority={FastImage.priority.high}
        />
      </Animated.View>

      <View style={styles.contentContainer}>
        {/* Animated Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{scale: logoScale}],
              opacity: logoOpacity,
            },
          ]}>
          <FastImage
            source={require('../../assets/new/main_logo.png')}
            style={styles.logo}
            resizeMode={FastImage.resizeMode.contain}
            priority={FastImage.priority.high}
          />
        </Animated.View>

        {/* Animated Text Container */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{translateY: textTranslateY}],
            },
          ]}>
          <Text
            style={[
              styles.titleText,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            {t('enhancedSplashScreen.title')}
          </Text>
          <Text
            style={[
              styles.subtitleText,
              {
                color: isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-700'],
              },
            ]}>
            {t('enhancedSplashScreen.subtitle')}
          </Text>
        </Animated.View>

        {/* Loading Text */}
        {showLoadingText && (
          <Animated.View
            style={[
              styles.loadingContainer,
              {
                opacity: loadingOpacity,
              },
            ]}>
            <Text
              style={[
                styles.loadingText,
                {
                  color: isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600'],
                },
              ]}>
              {loadingText}
            </Text>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontWeight: '400',
    fontSize: 18,
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 12,
  },
});
