import React, {useState} from 'react';
import {Image, ScrollView, StyleSheet} from 'react-native';
import {Card, Layout, Text} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {flexeStyles, spacingStyles} from '../../utils/globalStyles';
import {ThemedIcon} from '../../components/Icon';

export const PaymentMethodScreen = ({navigation}) => {
  const {t} = useTranslation();

  const onFeaturedPlanSelection = () => {
    navigation.navigate('ProductFeatureCheckout');
  };

  return (
    <Layout level="3" style={{flex: 1}}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
        contentContainerStyle={[
          spacingStyles.px16,
          spacingStyles.py8,
          {
            flexGrow: 1,
            justifyContent: 'center',
          },
        ]}>
        <Card
          level="1"
          style={[styles.paymentCard, spacingStyles.p8]}
          onPress={onFeaturedPlanSelection}>
          <Layout
            style={[
              flexeStyles.row,
              flexeStyles.itemsCenter,
              flexeStyles.contentBetween,
            ]}>
            <Image
              source={require('../../../assets/easypaisa-logo.png')}
              style={styles.paymentTypeLogo}
            />
            <Text category="s1" style={flexeStyles.grow1}>
              {t('easypaisa')}
            </Text>
            <ThemedIcon name="arrow-ios-forward-outline" />
          </Layout>
        </Card>
        <Card
          level="1"
          style={[styles.featureCard, spacingStyles.p8]}
          onPress={onFeaturedPlanSelection}>
          <Layout
            style={[
              flexeStyles.row,
              flexeStyles.itemsCenter,
              flexeStyles.contentBetween,
            ]}>
            <Image
              source={require('../../../assets/jazzcash-logo.png')}
              style={styles.paymentTypeLogo}
            />
            <Text category="s1" style={flexeStyles.grow1}>
              {t('jazzcash')}
            </Text>
            <ThemedIcon name="arrow-ios-forward-outline" />
          </Layout>
        </Card>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  paymentCard: {borderRadius: 4, marginVertical: 4},
  paymentTypeLogo: {width: 50, height: 50, marginRight: 8, borderRadius: 4},
});
