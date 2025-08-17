import {useState} from 'react';
import {Divider, Layout} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {ScrollView} from 'react-native';
import {LanguageSwitcher} from '../components/modals';
import {ProfileActionButton} from '../components/profile';
import {spacingStyles} from '../utils/globalStyles';
import { useTheme } from '../theme/ThemeContext';
import { Linking } from 'react-native';
import { BASE_URL } from '../utils/constants';
import { AuthRoutes } from '../navigators/AuthNavigator';
import { AppScreens } from '../navigators/AppNavigator';

export const AppSettingsScreen = ({navigation}) => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const {t, i18n} = useTranslation();
  const {theme, isDark}  = useTheme();

  const toggleLanguageModal = show => {
    setShowLanguageModal(show);
  };

  const navigateToForgotPassword = () => {
    navigation.navigate(AuthRoutes.FORGOT_PASSWORD.name);
  };
  const navigateToChangePassword = () => {
    navigation.navigate(AuthRoutes.RESET_PASSWORD.name);
  };

  return (
    <Layout
      level="3"
      style={[
        // spacingStyles.px16,
        {
          backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'],          flex: 1,
          overflow: 'scroll',
        },
      ]}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 10,
          paddingBottom: 90,
        }}>
        <Layout level="1" style={[ {marginVertical: 4}]}>
          <ProfileActionButton
            title={t('changeLanguage')}
            rightTitle={i18n.language === 'en' ? 'English' : 'اردو'}
            iconName="globe-outline"
            rightIconName="edit-outline"
            onPress={() => toggleLanguageModal(true)}
          />
        </Layout>

        {/* Password Management Section */}
        <Layout level="1" style={[ {marginVertical: 4}]}>
          <ProfileActionButton
            title={t('farmManagement.actions.forgotPassword.title')}
            subtitle={t('farmManagement.actions.forgotPassword.subtitle')}
            iconName="person-outline"
            onPress={() => navigation.navigate(AppScreens.FORGOT_PASSWORD)}
          />
          <Divider />
          <ProfileActionButton
            title={t('farmManagement.actions.changePassword.title')}
            subtitle={t('farmManagement.actions.changePassword.subtitle')}
            iconName="lock-outline"
            onPress={() => navigation.navigate(AppScreens.RESET_PASSWORD)}
          />
        </Layout>

        <Layout level="1" style={[ {marginVertical: 4}]}>
          <ProfileActionButton
            title={t('pagesTitles.AboutUs')}
            iconName="info-outline"
            onPress={() => {
              Linking.openURL(`${BASE_URL}about-us`);
            }}
          />
          <Divider />
          <ProfileActionButton
            title={t('pagesTitles.TermsConditions')}
            iconName="file-text-outline"
            onPress={() => {
              Linking.openURL(`${BASE_URL}terms`);
            }}
          />
          <Divider />
          <ProfileActionButton
            title={t('pagesTitles.PrivacyPolicy')}
            iconName="shield-outline"
            onPress={() => {
              Linking.openURL(`${BASE_URL}privacy-policy`);
            }}
          />
          <Divider />
          <ProfileActionButton
            title={t('pagesTitles.FAQ')}
            iconName="info-outline"
            onPress={() => {
              Linking.openURL(`${BASE_URL}helpTopic`);
            }}
          />
          <Divider />
          <ProfileActionButton
            title={t('pagesTitles.HelpSupport')}
            iconName="question-mark-circle-outline"
            onPress={() => {
              Linking.openURL(`${BASE_URL}account-tickets`);
            }}
          />
        </Layout>
        <LanguageSwitcher
          visible={showLanguageModal}
          selectedLanguage={i18n.language}
          onCloseModal={() => toggleLanguageModal(false)}
        />
      </ScrollView>
    </Layout>
  );
};
