import {Button, Input, Layout, Text} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import {flexeStyles, spacingStyles} from '../../utils/globalStyles';
import {ThemedIcon} from '../Icon';

export const MainScreensHeader = ({navigation, title, hideSearch}) => {
  const {t, i18n} = useTranslation();
  const state = navigation.getState();
  const activeLocationName = state.routeNames[state.index];

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
        ]}>
        <Text category="h6" status="primary">
          PetBookie
        </Text>
        <Text category="h6" style={{textTransform: 'uppercase'}}>
          {t(`pagesTitles.${title || activeLocationName}`)}
        </Text>
        <Layout
          style={[
            flexeStyles.row,
            flexeStyles.itemsCenter,
            flexeStyles.contentBetween,
          ]}>
          <Button
            style={{width: 20, height: 20}}
            appearance="ghost"
            accessoryLeft={NotifIcon}
            onPress={navigateToNotifications}
          />
          <Button
            style={{width: 20, height: 20}}
            appearance="ghost"
            accessoryLeft={renderSettingsIcon}
            onPress={navigateToAppSettings}
          />
        </Layout>
      </Layout>
      {!hideSearch && (
        <Input
          value={''}
          placeholder={t('search')}
          accessoryRight={renderIcon}
          style={{marginTop: 8, direction: i18n.dir()}}
        />
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
