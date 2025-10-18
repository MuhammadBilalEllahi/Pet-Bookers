import React from 'react';
import {View} from 'react-native';
import {Divider} from '@ui-kitten/components';

import {useTranslation} from 'react-i18next';
import {AppScreens} from '../../../navigators/AppNavigator';
import {ProfileActionButton} from '../../../components/profile';
import {useTheme} from '../../../theme/ThemeContext';

const SellerOptionsInBuyerProfile = ({navigation}) => {
  const {t} = useTranslation();
  const {isDark, theme} = useTheme();

  const navigateToMyAds = () => {
    navigation.navigate(AppScreens.MY_POSTED_ADS);
  };

  const navigateToFarmManagement = () => {
    navigation.navigate(AppScreens.FARM_MANAGEMENT);
  };

  const navigateToFarmDetails = () => {
    navigation.navigate(AppScreens.FARM_DETAILS);
  };

  const navigateToAddProduct = () => {
    navigation.navigate(AppScreens.SELLER_ADD_PRODUCT);
  };

  return (
    <View
      style={{
        backgroundColor: isDark
          ? theme['color-shadcn-background']
          : theme['color-basic-100'],
        flex: 1,
        overflow: 'scroll',
      }}>
      <ProfileActionButton
        title={t('profile.myAds')}
        subtitle={t('profile.myAdsSubtitle')}
        iconName="list-outline"
        onPress={navigateToMyAds}
      />

      <ProfileActionButton
        title={t('addProduct.submitAd')}
        subtitle={t('auth.signInAsSellerToAddProducts')}
        iconName="plus-circle-outline"
        onPress={navigateToAddProduct}
      />

      <Divider
        style={{
          backgroundColor: isDark
            ? theme['color-shadcn-border']
            : theme['color-basic-400'],
        }}
      />

      <ProfileActionButton
        title={t('profile.farmManagement')}
        subtitle={t('profile.farmManagementSubtitle')}
        iconName="settings-outline"
        onPress={navigateToFarmManagement}
      />

      <ProfileActionButton
        title={t('profile.farmDetails')}
        subtitle={t('profile.farmDetailsSubtitle')}
        iconName="edit-outline"
        onPress={navigateToFarmDetails}
      />
    </View>
  );
};

export default SellerOptionsInBuyerProfile;
