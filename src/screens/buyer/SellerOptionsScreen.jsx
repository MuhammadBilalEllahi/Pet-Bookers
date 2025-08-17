import React from 'react';
import { ScrollView } from 'react-native';
import { Layout, Divider } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { AppScreens } from '../../navigators/AppNavigator';
import { ProfileActionButton } from '../../components/profile';

export const SellerOptionsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { isDark, theme } = useTheme();

  const navigateToMyAds = () => {
    navigation.navigate(AppScreens.MY_POSTED_ADS);
  };

  const navigateToFarmManagement = () => {
    navigation.navigate(AppScreens.FARM_MANAGEMENT);
  };

  

  const navigateToFarmDetails = () => {
    navigation.navigate(AppScreens.FARM_DETAILS_EDIT);
  };


  const navigateToAddProduct = () => {
    navigation.navigate(AppScreens.SELLER_ADD_PRODUCT);
  };

  return (
    <Layout 
      style={{ 
        flex: 1, 
        backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] 
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 20,
          paddingBottom: 20,
        }}
      >
        <Layout 
          style={{ 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
            marginHorizontal: 16,
            borderRadius: 12,
            overflow: 'hidden',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          <ProfileActionButton
            title={t('profile.myAds')}
            subtitle={t('profile.myAdsSubtitle')}
            iconName="list-outline"
            onPress={navigateToMyAds}
          />
          
          <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
          
          <ProfileActionButton
            title={t('addProduct.submitAd')}
            subtitle={t('auth.signInAsSellerToAddProducts')}
            iconName="plus-circle-outline"
            onPress={navigateToAddProduct}
          />
          
          <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
          
          <ProfileActionButton
            title={t('profile.farmManagement')}
            subtitle={t('profile.farmManagementSubtitle')}
            iconName="settings-outline"
            onPress={navigateToFarmManagement}
          />
          
          <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
          
          <ProfileActionButton
            title={t('profile.farmDetails')}
            subtitle={t('profile.farmDetailsSubtitle')}
            iconName="edit-outline"
            onPress={navigateToFarmDetails}
          />
        </Layout>
      </ScrollView>
    </Layout>
  );
};
