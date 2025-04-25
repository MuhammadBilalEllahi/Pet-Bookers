import React from 'react';
import {ScrollView, StyleSheet, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {Button, Layout, Text} from '@ui-kitten/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ThemedIcon} from '../Icon';
import {selectCompanyLogo} from '../../store/configs';
import {flexeStyles} from '../../utils/globalStyles';
import { I18nManager } from 'react-native';


export const AuthContainer = ({title, subTitle, children}) => {
  const {t, i18n} = useTranslation();
  const navigation = useNavigation();
  const companyLogo = useSelector(selectCompanyLogo);

  const onLanguageChange = lang => {
    if (i18n.language === lang) {
      return;
    }
    i18n.changeLanguage(lang);
    AsyncStorage.setItem('user-language', lang);
  };

  const onNavigateToHome = () => {
    navigation.navigate('BuyerHomeMain');
  };

  return (
    <Layout style={{height: '100%'}} level="1">

      
<Image
          source={require('../../../assets/latest/splash_above_icon.png')}
          style={styles.aboveLogo }
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
          
            
            {/* <Image
              source={require('../../../assets/latest/petbooker_icon.png')}
              style={styles.image}
            />
           */}
          <Text category="h4" style={styles.title}>
            {t(title)}
          </Text>
          {subTitle && (
            <Text category="p1" style={styles.subTitle}>
              {t(subTitle)}
            </Text>
          )}
          {children}
            <Layout style={{ justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 16, fontWeight: 'bold'}}>
              Language
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
          
          {/* <Layout style={{alignItems: 'flex-end'}}>
            <Button
              appearance="ghost"
              accessoryRight={
                <ThemedIcon
                  name={
                    i18n.language === 'ur'
                      ? 'arrow-back-outline'
                      : 'arrow-forward-outline'
                  }
                  status="primary"
                />
              }
              onPress={onNavigateToHome}>
              {t('buttons.skip')}
            </Button>
          </Layout> */}
        </Layout>
        <Image
          source={require('../../../assets/latest/auth_left_icon.png')}
          style={styles.leftBottomLogo }
          resizeMode="cover"
        />

<Image
          source={require('../../../assets/latest/auth_right_icon.png')}
          style={styles.rightBottomLogo }
          resizeMode="cover"
        />
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({


  aboveLogo:{
    position: 'absolute',
    top: 0,
    // width: '100%',
    // height: '100%',
  },
  leftBottomLogo:{
    position: 'absolute',
    bottom: -10,
    left: -20,
    zIndex: -1,
  transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
    
  },
  rightBottomLogo:{
    position: 'absolute',
    bottom: -10,
    right: 0,
    zIndex: -1,
    
  transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
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
  subTitle: {marginVertical: 8, textAlign: 'center'},
  languageChanger: {
    marginHorizontal: 10,
    
    textDecorationLine: 'none',
    lineHeight: 20,
  },
});
