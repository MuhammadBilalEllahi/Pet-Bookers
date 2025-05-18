import React, { useState } from 'react';
import { Button, Input, Layout } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View } from 'react-native';
import { flexeStyles, spacingStyles } from '../../utils/globalStyles';
import { ThemedIcon } from '../Icon';
import { BackButton } from '../BackButton';

export const MainScreensHeader = ({ navigation, title, hideSearch, activateGoBack=false, hideNotification=true,
hideSettings=true }) => {
  const { t, i18n } = useTranslation();
  const state = navigation.getState();
  const activeLocationName = state.routeNames[state.index];

  // Senior-level: use state for search input
  const [searchValue, setSearchValue] = useState('');

  const renderIcon = props => <ThemedIcon {...props} name="search-outline" />;
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
    <Layout style={[styles.container, spacingStyles.px16, spacingStyles.py8]}>
      <Layout
        style={[
          flexeStyles.row,
          flexeStyles.itemsCenter,
          flexeStyles.contentBetween,
        ]}
      >
        <View style={styles.logoTitleWrapper}>
  {activateGoBack ? (
    <BackButton fill="#121212" onPress={onGoBack} />
  ) : (
    <Image
      source={require('../../../assets/new/main_logo.png')}
      style={styles.logo}
      resizeMode="contain"
    />
  )}
  {title && (
    <Text style={styles.titleText}>{title}</Text>
  )}
</View>

        <Layout
          style={[
            flexeStyles.row,
            flexeStyles.itemsCenter,
            flexeStyles.contentBetween,
          ]}
        >
          {/* Language Dropdown */}
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
                  <Text style={{ fontSize: 14, color: '#121212' }}>
                    {i18n.language === 'ur' ? 'Urdu' : 'English'}
                  </Text>
                </View>
              )}
              onPress={() => {
                // Toggle between English and Urdu
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
          {!hideSettings &&<Button
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
              { direction: i18n.dir() }
            ]}
            textStyle={styles.searchBarText}
            placeholderTextColor="#888"
            size="medium"
            // Add any additional Input props as needed
          />
        </View>
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
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
    // Optionally add horizontal padding if needed
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 12, // md: 12px
    borderWidth: 1,
    borderColor: '#E5E7EB', // subtle gray border
    paddingLeft: 4,
    paddingRight: 4,
    minHeight: 32,
    elevation: 1,
    shadowColor: '#000',
  },
  searchBarText: {
    fontSize: 15,
    color: '#222',
    paddingVertical: 1,
  },
  logoTitleWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
},
titleText: {
  fontSize: 20,
  color: '#121212',
  marginLeft: 8, // Space between logo and title
  flexShrink: 1, // Prevents text overflow
},

});
