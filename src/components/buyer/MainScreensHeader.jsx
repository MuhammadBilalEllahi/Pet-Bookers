import React, { useState } from 'react';
import { Button, Input, Layout } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View } from 'react-native';
import { flexeStyles, spacingStyles } from '../../utils/globalStyles';
import { ThemedIcon } from '../Icon';
import { BackButton } from '../BackButton';
import { BuyerMainRoutes } from '../../navigators/buyer/BuyerMainNavigator';
import { AppScreens } from '../../navigators/AppNavigator';
import { useTheme } from '../../theme/ThemeContext';

export const MainScreensHeader = ({ navigation, title, hideSearch, activateGoBack = false, hideNotification = true,
  hideSettings = true, hideCart = true }) => {
  const { t, i18n } = useTranslation();
  const state = navigation.getState();
  const activeLocationName = state.routeNames[state.index];
  const { theme, isDark } = useTheme();
  const [searchValue, setSearchValue] = useState('');

  const renderIcon = props => <ThemedIcon {...props} name="search-outline" />;
  const cartIcon = props => <ThemedIcon {...props} name="shopping-bag-outline" />;
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

  const onGoBack = () => {
    navigation.goBack();
  };

  return (
    <Layout style={[styles.container, spacingStyles.px16, spacingStyles.py8, { 
      backgroundColor: isDark ? '#121212' : '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#27272a' : '#e4e4e7'
    }]}>
      <Layout
        style={[
          flexeStyles.row,
          flexeStyles.itemsCenter,
          flexeStyles.contentBetween,
        ]}
      >
        <View style={styles.logoTitleWrapper}>
          {activateGoBack ? (
            <BackButton fill={isDark ? '#ffffff' : '#09090b'} onPress={onGoBack} />
          ) : (
            <Image
              source={require('../../../assets/new/main_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          )}
          {title && (
            <Text style={[styles.titleText, { color: isDark ? '#ffffff' : '#09090b' }]}>{title}</Text>
          )}
        </View>

        <Layout
          style={[
            flexeStyles.row,
            flexeStyles.itemsCenter,
            flexeStyles.contentBetween,
          ]}
        >
          <View style={{ marginRight: 8 }}>
            <Button
              appearance="ghost"
              accessoryLeft={() => (
                <Image
                  source={
                    i18n.language === 'ur'
                      ? require('../../../assets/pakistan-flag.png')
                      : require('../../../assets/us-flag.png')
                  }
                  style={{ width: 24, height: 16, marginRight: 4 }}
                  resizeMode="contain"
                />
              )}
              accessoryRight={() => (
                <View style={{ marginLeft: 4 }}>
                  <Text style={{ fontSize: 14, color: isDark ? '#ffffff' : '#09090b' }}>
                    {i18n.language === 'ur' ? 'Urdu' : 'English'}
                  </Text>
                </View>
              )}
              onPress={() => {
                const newLang = i18n.language === 'ur' ? 'en' : 'ur';
                i18n.changeLanguage(newLang);
              }}
              size="small"
              style={{ paddingHorizontal: 0, minWidth: 36 }}
            />
          </View>

          {!hideNotification && <Button
            style={{ width: 20, height: 20 }}
            appearance="ghost"
            accessoryLeft={NotifIcon}
            onPress={navigateToNotifications}
          />}
          {!hideSettings && <Button
            style={{ width: 20, height: 20 }}
            appearance="ghost"
            accessoryLeft={renderSettingsIcon}
            onPress={navigateToAppSettings}
          />}
        </Layout>
      </Layout>
      {!hideSearch && (
        <View style={styles.searchBarWrapper}>
          <Input
            value={searchValue}
            onChangeText={setSearchValue}
            placeholder={t('search')}
            accessoryRight={renderIcon}
            style={[
              styles.searchBar,
              { 
                direction: i18n.dir(),
                backgroundColor: isDark ? '#27272a' : '#ffffff',
                borderColor: isDark ? '#3f3f46' : '#e4e4e7'
              }
            ]}
            textStyle={[styles.searchBarText, { color: isDark ? '#ffffff' : '#09090b' }]}
            placeholderTextColor={isDark ? '#a1a1aa' : '#71717a'}
            size="medium"
          />
          {!hideCart && <Button 
            appearance="ghost" 
            style={{ 
              width: 20, 
              height: 20, 
              borderRadius: 10, 
              borderWidth: 1, 
              borderColor: isDark ? '#3f3f46' : '#e4e4e7',
              backgroundColor: isDark ? '#27272a' : '#ffffff'
            }} 
            accessoryLeft={cartIcon} 
            onPress={() => navigation.navigate(AppScreens.CART)}
          />}
        </View>
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowOffset: { width: -2, height: 4 },
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
  searchBar: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingLeft: 4,
    paddingRight: 4,
    minHeight: 32,
    elevation: 1,
    shadowColor: '#000',
  },
  searchBarText: {
    fontSize: 15,
    paddingVertical: 1,
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
