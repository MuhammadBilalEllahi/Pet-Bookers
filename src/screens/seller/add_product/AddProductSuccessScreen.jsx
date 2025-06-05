import React, {useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {
  Button,
  Divider,
  Icon,
  Layout,
  Text,
  useTheme,
} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {flexeStyles, spacingStyles} from '../../../utils/globalStyles';
import {ThemedIcon} from '../../../components/Icon';
import {Price} from '../../../components/Price';

export const AddProductSuccessScreen = ({navigation}) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const onSkip = () => {
    navigation.goBack();
  };

  const ArrowNextIcon = props => (
    <Icon {...props} name="arrow-forward-outline" />
  );

  const onFeaturedPlanSelection = () => {
    navigation.navigate('PaymentMethodSelection');
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
            spacingStyles.p16,
            flexeStyles.itemsCenter,
            {marginBottom: 8},
          ]}>
          <ThemedIcon
            name="checkmark-circle-2"
            iconStyle={{width: 50, height: 50, marginBottom: 8}}
            fill={theme['color-success-600']}
          />
          <Text category="s1">Posted Successfully</Text>
        </Layout>
        <Layout level="1" style={[spacingStyles.p16]}>
          <Text
            category="s1"
            style={{
              textAlign: 'center',
            }}>
            Select Package to make feature.
          </Text>
          {[1, 2, 3].map((item, index) => (
            <Layout
              key={index}
              style={[
                styles.featureCard,
                index === 0
                  ? {
                      borderColor: theme['color-primary-default'],
                      borderWidth: 2,
                    }
                  : {
                      borderColor: theme['text-disabled-color'],
                    },
              ]}>
              {index === 0 && (
                <Text
                  category="s1"
                  style={[
                    styles.recomededCardHeader,
                    {
                      backgroundColor: theme['color-primary-default'],
                    },
                  ]}>
                  Recommended
                </Text>
              )}
              <Text category="s1">Feature Package - {index + 1}</Text>
              <Layout>
                <Layout style={{marginVertical: 8}}>
                  {[1, 2, 3, 4].map((item, itemIndex) => (
                    <Layout
                      key={`${index}${itemIndex}`}
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
              <Divider />
              <Button
                appearance={index === 0 ? 'filled' : 'outline'}
                accessoryRight={ArrowNextIcon}
                style={{marginTop: 8, borderRadius: 30, paddingVertical: 0}}
                onPress={onFeaturedPlanSelection}>
                Upgrade
              </Button>
            </Layout>
          ))}
        </Layout>
        <Layout
          style={[flexeStyles.row, {marginTop: 8, justifyContent: 'flex-end'}]}>
          <Button
            appearance="ghost"
            accessoryRight={ArrowNextIcon}
            onPress={onSkip}>
            Skip
          </Button>
        </Layout>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  featureCard: {
    borderWidth: 1,
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
