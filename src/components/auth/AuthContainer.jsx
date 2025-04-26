import React from 'react';
import { ScrollView, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
// import { useSelector } from 'react-redux';
import { Button, Layout, Text } from '@ui-kitten/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { ThemedIcon } from '../Icon';
// import { selectCompanyLogo } from '../../store/configs';
import { flexeStyles } from '../../utils/globalStyles';
// import { I18nManager } from 'react-native';


export const AuthContainer = ({ title, subTitle, children }) => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  // const companyLogo = useSelector(selectCompanyLogo);

  const onLanguageChange = lang => {
    if (i18n.language === lang) {
      return;
    }
    i18n.changeLanguage(lang);
    AsyncStorage.setItem('user-language', lang);
  };

  // const onNavigateToHome = () => {
  //   navigation.navigate('BuyerHomeMain');
  // };

  return (
    <Layout style={styles.container} level="1">

{/* https://petbookers.com.pk/customer/auth/login */}
      {/* https://petbookers.com.pk/customer/auth/sign-up */}
      <Image
        source={require('../../../assets/new/login_page_bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
        contentContainerStyle={[flexeStyles.grow1, flexeStyles.contentCenter]}>
        <Layout
          style={[
            flexeStyles.contentCenter,
            {
              flex: 1,
              paddingHorizontal: 32,
              paddingVertical: 8,
            },
          ]}>



          <Text category="h4" style={styles.title}>
            {t(title)}
          </Text>
          {subTitle && (
            <Text category="p1" style={styles.subTitle}>
              {t(subTitle)}
            </Text>
          )}
          {children}
          <Layout style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
               {t('language')}
            </Text>

            <Layout
              style={[
                flexeStyles.row,
                flexeStyles.contentCenter,
                {
                  marginBottom: 40,
                },
              ]}>
              <Text
                category="p2"
                status="basic"
                style={styles.languageChanger}
                onPress={() => onLanguageChange('en')}>
                English
              </Text>
              <Text
                category="p2"
                status="basic"
                style={styles.languageChanger}
                onPress={() => onLanguageChange('ur')}>
                اردو
              </Text>
            </Layout>
          </Layout>

        </Layout>
      </ScrollView>
    </Layout>
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




  image: {
    width: '100%',
    resizeMode: 'contain',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 20,
    height: 100,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  subTitle: { marginVertical: 8, textAlign: 'center' },
  languageChanger: {
    marginHorizontal: 10,

    textDecorationLine: 'none',
    lineHeight: 20,
  },
});
