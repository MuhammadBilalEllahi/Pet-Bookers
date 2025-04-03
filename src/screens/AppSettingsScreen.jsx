import {useState} from 'react';
import {Divider, Layout} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {ScrollView} from 'react-native';
import {LanguageSwitcher} from '../components/modals';
import {ProfileActionButton} from '../components/profile';
import {spacingStyles} from '../utils/globalStyles';

export const AppSettingsScreen = ({navigation}) => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const {t, i18n} = useTranslation();

  const toggleLanguageModal = show => {
    setShowLanguageModal(show);
  };

  return (
    <Layout
      level="3"
      style={[
        spacingStyles.px16,
        {
          flex: 1,
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
        <Layout level="1" style={[spacingStyles.p16, {marginVertical: 4}]}>
          <ProfileActionButton
            title={t('changeLanguage')}
            rightTitle={i18n.language === 'en' ? 'English' : 'اردو'}
            iconName="globe-outline"
            rightIconName="edit-outline"
            onPress={() => toggleLanguageModal(true)}
          />
        </Layout>
        <Layout level="1" style={[spacingStyles.p16, {marginVertical: 4}]}>
          <ProfileActionButton
            title={t('pagesTitles.AboutUs')}
            iconName="info-outline"
            onPress={() => {}}
          />
          <Divider />
          <ProfileActionButton
            title={t('pagesTitles.TermsConditions')}
            iconName="file-text-outline"
            onPress={() => {}}
          />
          <Divider />
          <ProfileActionButton
            title={t('pagesTitles.PrivacyPolicy')}
            iconName="shield-outline"
            onPress={() => {}}
          />
          <Divider />
          <ProfileActionButton
            title={t('pagesTitles.FAQ')}
            iconName="info-outline"
            onPress={() => {}}
          />
          <Divider />
          <ProfileActionButton
            title={t('pagesTitles.HelpSupport')}
            iconName="question-mark-circle-outline"
            onPress={() => {}}
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
