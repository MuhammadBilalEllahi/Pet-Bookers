import React from 'react';
import {StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {Button, Layout, Text} from '@ui-kitten/components';
import {ThemedIcon} from '../Icon';
import {flexeStyles} from '../../utils/globalStyles';
import {AppScreens} from '../../navigators/AppNavigator';

export const AuthRestrictedError = ({subTitle, isItSeller = false}) => {
  const route = useRoute();

  const isitSeller = route.params?.isItSeller || isItSeller || false;
  const subtitle =
    route.params?.subTitle || subTitle || 'messages.sellerLoginRequired';
  const {t, i18n} = useTranslation();
  const navigation = useNavigation();

  const onNavigateToAuth = () => {
    // const { isItSeller= false} = route.params || {};
    navigation.navigate(AppScreens.AUTH, {isItSeller: isitSeller});
  };

  return (
    <Layout
      level="3"
      style={[
        flexeStyles.grow1,
        flexeStyles.itemsCenter,
        flexeStyles.contentCenter,
        {
          padding: 32,
        },
      ]}>
      <ThemedIcon
        name="lock-outline"
        status="primary"
        iconStyle={styles.icon}
      />
      <Text category="h4" style={styles.title}>
        {t('signin')}
      </Text>
      <Text category="p1" style={styles.subTitle}>
        {t(subtitle)}
      </Text>
      <Layout
        style={{
          alignItems: 'flex-end',
        }}>
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
          onPress={onNavigateToAuth}>
          {t('signin')}
        </Button>
      </Layout>
    </Layout>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  subTitle: {
    marginVertical: 8,
    textAlign: 'center',
    maxWidth: 240,
  },
  languageChanger: {
    marginHorizontal: 5,
    textDecorationLine: 'underline',
    lineHeight: 20,
  },
});
