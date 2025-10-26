import React from 'react';
import {ScrollView, StyleSheet, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
// import { useSelector } from 'react-redux';
import {Button, Layout, Text} from '@ui-kitten/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { ThemedIcon } from '../Icon';
// import { selectCompanyLogo } from '../../store/configs';
import {flexeStyles} from '../../utils/globalStyles';
// import { I18nManager } from 'react-native';
import {useTheme} from '../../theme/ThemeContext';
import FastImage from '@d11/react-native-fast-image';
import FastImageWithFallback from '../common/FastImageWithFallback';

export const AuthContainer = ({title, subTitle, children}) => {
  const {t, i18n} = useTranslation();
  const navigation = useNavigation();
  const {isDark, theme} = useTheme();
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
    <Layout
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
        },
      ]}
      level="1">
      {/* https://petbookers.com.pk/customer/auth/login */}
      {/* https://petbookers.com.pk/customer/auth/sign-up */}
      <FastImage
        source={
          isDark
            ? require('../../../assets/new/login_page_bg_dark.png')
            : require('../../../assets/new/login_page_bg.png')
        }
        priority={FastImage.priority.high}
        style={styles.backgroundImage}
        resizeMode={FastImage.resizeMode.cover}
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
          <Text
            category="h4"
            style={[
              styles.title,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            {t(title)}
          </Text>
          {subTitle && (
            <Text
              category="p1"
              style={[
                styles.subTitle,
                {
                  color: isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-700'],
                },
              ]}>
              {t(subTitle)}
            </Text>
          )}
          {children}
          <Layout style={{justifyContent: 'center', alignItems: 'center'}}>
            <Text
              style={[
                {
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
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
                style={[
                  styles.languageChanger,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}
                onPress={() => onLanguageChange('en')}>
                English
              </Text>
              <Text
                category="p2"
                status="basic"
                style={[
                  styles.languageChanger,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}
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
  subTitle: {
    marginVertical: 8,
    textAlign: 'center',
  },
  languageChanger: {
    marginHorizontal: 10,
    textDecorationLine: 'none',
    lineHeight: 20,
  },
});
