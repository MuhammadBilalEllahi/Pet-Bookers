import React, {useState, useEffect, useRef} from 'react';
import {Button, Input, Layout} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {Image, StyleSheet, Text, View, Animated} from 'react-native';
import {flexeStyles, spacingStyles} from '../../utils/globalStyles';
import {ThemedIcon} from '../Icon';
import {BackButton} from '../BackButton';
import {BuyerMainRoutes} from '../../navigators/buyer/BuyerMainNavigator';
import {AppScreens} from '../../navigators/AppNavigator';
import {useTheme} from '../../theme/ThemeContext';
import {SearchDropdown} from '../search/SearchDropdown';

export const MainScreensHeader = ({
  navigation,
  title,
  hideSearch,
  activateGoBack = false,
  hideNotification = true,
  hideSettings = true,
  hideCart = true,
  hideWishlist = false,
}) => {
  const {t, i18n} = useTranslation();
  const state = navigation.getState();
  const activeLocationName = state.routeNames[state.index];
  const {theme, isDark} = useTheme();

  // Animated placeholder text
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const placeholderAnim = useRef(new Animated.Value(0)).current;
  const placeholderTexts = [
    t('search.searchProducts', 'Search for products'),
    t('search.searchPets', 'Search for pets'),
    t('search.searchDoctors', 'Search for doctors'),
    t('search.searchServices', 'Search for services'),
    t('search.searchItems', 'Search for items'),
  ];

  const cartIcon = props => (
    <ThemedIcon {...props} name="shopping-bag-outline" />
  );
  const wishlistIcon = props => <ThemedIcon {...props} name="heart-outline" />;
  const NotifIcon = props => <ThemedIcon {...props} name="bell-outline" />;
  const renderSettingsIcon = props => (
    <ThemedIcon {...props} name="settings-2-outline" />
  );

  const navigateToNotifications = () => {
    navigation.navigate('Notifications');
  };
  const navigateToAppSettings = () => {
    navigation.navigate('AppSettings');
  };
  const navigateToWishlist = () => {
    navigation.navigate(BuyerMainRoutes.BUYER_WISHLIST);
  };

  const onGoBack = () => {
    navigation.goBack();
  };

  // Animated placeholder effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % placeholderTexts.length;

        // Animate out current text
        Animated.timing(placeholderAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          // Animate in next text
          Animated.timing(placeholderAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        });

        return nextIndex;
      });
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, [placeholderAnim, placeholderTexts.length]);

  // Render animated placeholder
  const renderAnimatedPlaceholder = () => {
    return (
      <View style={styles.placeholderContainer}>
        <Animated.Text
          style={[
            styles.animatedPlaceholder,
            {
              opacity: placeholderAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
              transform: [
                {
                  translateY: placeholderAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -8],
                  }),
                },
              ],
              color: isDark
                ? theme['color-shadcn-muted-foreground']
                : theme['color-basic-600'],
            },
          ]}>
          {placeholderTexts[currentPlaceholderIndex]}
        </Animated.Text>
      </View>
    );
  };

  return (
    <Layout
      style={[
        styles.container,
        spacingStyles.px16,
        spacingStyles.py8,
        {
          backgroundColor: isDark ? '#121212' : '#ffffff',
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#27272a' : '#e4e4e7',
        },
      ]}>
      <Layout
        style={[
          flexeStyles.row,
          flexeStyles.itemsCenter,
          flexeStyles.contentBetween,
        ]}>
        <View style={styles.logoTitleWrapper}>
          {activateGoBack ? (
            <BackButton
              fill={isDark ? '#ffffff' : '#09090b'}
              onPress={onGoBack}
            />
          ) : (
            <Image
              source={require('../../../assets/new/main_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          )}
          {title && false && (
            <Text
              style={[
                styles.titleText,
                {color: isDark ? '#ffffff' : '#09090b'},
              ]}>
              {title}
            </Text>
          )}
        </View>

        <Layout
          style={[
            flexeStyles.row,
            flexeStyles.itemsCenter,
            flexeStyles.contentBetween,
          ]}>
          <View style={{marginRight: 8}}>
            <Button
              appearance="ghost"
              accessoryLeft={() => (
                <Image
                  source={
                    i18n.language === 'ur'
                      ? require('../../../assets/pakistan-flag.png')
                      : require('../../../assets/us-flag.png')
                  }
                  style={{width: 24, height: 16, marginRight: 4}}
                  resizeMode="contain"
                />
              )}
              accessoryRight={() => (
                <View style={{marginLeft: 4}}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: isDark ? '#ffffff' : '#09090b',
                    }}>
                    {i18n.language === 'ur' ? 'Urdu' : 'English'}
                  </Text>
                </View>
              )}
              onPress={() => {
                const newLang = i18n.language === 'ur' ? 'en' : 'ur';
                i18n.changeLanguage(newLang);
              }}
              size="small"
              style={{paddingHorizontal: 0, minWidth: 36}}
            />
          </View>

          {!hideNotification && (
            <Button
              style={{width: 20, height: 20}}
              appearance="ghost"
              accessoryLeft={NotifIcon}
              onPress={navigateToNotifications}
            />
          )}
          {!hideSettings && (
            <Button
              style={{width: 20, height: 20}}
              appearance="ghost"
              accessoryLeft={renderSettingsIcon}
              onPress={navigateToAppSettings}
            />
          )}
        </Layout>
      </Layout>
      {!hideSearch && (
        <View style={styles.searchBarWrapper}>
          <View style={styles.searchInputWrapper}>
            <Input
              placeholder=""
              onFocus={() => navigation.navigate(AppScreens.PRODUCTS_SEARCH)}
              style={[
                styles.searchInput,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-card']
                    : theme['color-basic-100'],
                  borderColor: isDark
                    ? theme['color-shadcn-border']
                    : theme['color-basic-300'],
                },
              ]}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              }}
              placeholderTextColor="transparent"
              accessoryRight={() => <ThemedIcon name="search-outline" />}
              editable={false}
            />
            {renderAnimatedPlaceholder()}
          </View>
          {!hideWishlist && (
            <Button
              appearance="ghost"
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: isDark ? '#3f3f46' : '#e4e4e7',
                backgroundColor: isDark ? '#27272a' : '#ffffff',
                marginRight: 8,
              }}
              accessoryLeft={wishlistIcon}
              onPress={navigateToWishlist}
            />
          )}
          {!hideCart && (
            <Button
              appearance="ghost"
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: isDark ? '#3f3f46' : '#e4e4e7',
                backgroundColor: isDark ? '#27272a' : '#ffffff',
              }}
              accessoryLeft={cartIcon}
              onPress={() => navigation.navigate(AppScreens.CART)}
            />
          )}
        </View>
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  logo: {
    width: 35,
    height: 35,
  },
  searchBarWrapper: {
    marginTop: 10,
    marginBottom: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchInputWrapper: {
    flex: 1,
    position: 'relative',
    marginRight: 2,
  },
  searchInput: {
    borderRadius: 12,
    borderWidth: 1,
  },
  placeholderContainer: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  animatedPlaceholder: {
    fontSize: 15,
    fontWeight: '400',
  },
  logoTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleText: {
    fontSize: 20,
    marginLeft: 8,
    flexShrink: 1,
  },
});
