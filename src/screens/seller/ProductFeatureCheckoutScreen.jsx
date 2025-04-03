import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {Layout, Text, useTheme} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {flexeStyles, spacingStyles} from '../../utils/globalStyles';
import {ThemedIcon} from '../../components/Icon';
import {Price} from '../../components/Price';
import {SubmitButton} from '../../components/form';

export const ProductFeatureCheckoutScreen = ({navigation}) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const onPayment = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'ProductFeatureSuccess'}],
    });
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
        <Layout
          level="1"
          style={[
            styles.featureCard,
            spacingStyles.p16,
            {
              borderColor: theme['text-disabled-color'],
            },
          ]}>
          <Text category="h6">Feature Package Name</Text>
          <Layout style={{marginVertical: 8}}>
            {[1, 2, 3, 4].map((item, itemIndex) => (
              <Layout
                key={itemIndex}
                style={[flexeStyles.row, flexeStyles.itemsCenter]}>
                <ThemedIcon
                  name="checkmark-outline"
                  status="color-success-600"
                />
                <Text>Feature plus points line.</Text>
              </Layout>
            ))}
          </Layout>
          <Price amount={120} />
        </Layout>
        <Layout
          level="1"
          style={[
            flexeStyles.row,
            flexeStyles.itemsCenter,
            flexeStyles.contentBetween,
            spacingStyles.p16,
          ]}>
          <Text category="h6">Total:</Text>
          <Price amount={120} />
        </Layout>
      </ScrollView>
      <Layout level="1" style={[spacingStyles.px16]}>
        <SubmitButton btnText="Pay Now" onPress={onPayment} />
      </Layout>
    </Layout>
  );
};

const styles = StyleSheet.create({
  featureCard: {
    borderRadius: 4,
    padding: 8,
    marginVertical: 8,
  },
  recomededCardHeader: {
    textAlign: 'center',
    padding: 6,
    color: '#fff',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: -8,
    marginHorizontal: -8,
  },
});
