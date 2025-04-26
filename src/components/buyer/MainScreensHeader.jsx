import React, { useState } from 'react';
import { Button, Input, Layout } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';
import { flexeStyles, spacingStyles } from '../../utils/globalStyles';
import { ThemedIcon } from '../Icon';

export const MainScreensHeader = ({ navigation, title, hideSearch }) => {
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

  return (
    <Layout style={[styles.container, spacingStyles.px16, spacingStyles.py8]}>
      <Layout
        style={[
          flexeStyles.row,
          flexeStyles.itemsCenter,
          flexeStyles.contentBetween,
        ]}
      >
        <Image
          source={require('../../../assets/new/main_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Layout
          style={[
            flexeStyles.row,
            flexeStyles.itemsCenter,
            flexeStyles.contentBetween,
          ]}
        >
          <Button
            style={{ width: 20, height: 20 }}
            appearance="ghost"
            accessoryLeft={NotifIcon}
            onPress={navigateToNotifications}
          />
          <Button
            style={{ width: 20, height: 20 }}
            appearance="ghost"
            accessoryLeft={renderSettingsIcon}
            onPress={navigateToAppSettings}
          />
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
});
