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
import {flexeStyles, spacingStyles} from '../../utils/globalStyles';
import {ThemedIcon} from '../../components/Icon';

export const ProductFeatureSuccessScreen = ({navigation}) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const onSkip = () => {
    navigation.goBack();
  };

  const ArrowNextIcon = props => (
    <Icon {...props} name="arrow-forward-outline" />
  );

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
            iconStyle={{width: 70, height: 70, marginBottom: 8}}
            fill={theme['color-success-600']}
          />
          <Text category="h6">Featured Successfully</Text>
          <Text style={{textAlign: 'center', marginTop: 8}}>
            Your product has been upgraded to be displayed as featured.
          </Text>
        </Layout>
        <Layout
          style={[flexeStyles.row, {marginTop: 8, justifyContent: 'flex-end'}]}>
          <Button
            appearance="ghost"
            accessoryRight={ArrowNextIcon}
            onPress={onSkip}>
            Home
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
