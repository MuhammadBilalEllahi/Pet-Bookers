import React from 'react';
import {
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Layout,
  Text,
  Divider,
} from '@ui-kitten/components';
import { useTheme } from '../../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ProfileActionButton } from '../../../../components/profile';
import { AppScreens } from '../../../../navigators/AppNavigator';






export const FarmManagement = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

 
 





  // Management navigation functions
  const navigateToDeliveryManagement = () => {
    navigation.navigate(AppScreens.DELIVERY);
  };

  const navigateToEarnings = (deliveryMan = null) => {
    navigation.navigate(AppScreens.EARNINGS_STATS, { deliveryMan });
  };

  const navigateToOrders = (deliveryMan = null) => {
    navigation.navigate(AppScreens.ORDERS_STATS, { deliveryMan });
  };

  const navigateToReviews = (deliveryMan = null) => {
    navigation.navigate(AppScreens.REVIEWS_STATS, { deliveryMan });
  };

  const navigateToTransactions = () => {
    navigation.navigate(AppScreens.TRANSACTIONS_STATS);
  };

  const navigateToShopSettings = () => {
    navigation.navigate(AppScreens.SHOP_SETTINGS);
  };

  const navigateToRefundHandle = () => {
    navigation.navigate(AppScreens.REFUND_HANDLE);
  };

  const navigateToCouponHandling = () => {
    navigation.navigate(AppScreens.COUPON_HANDLING);
  };

  const navigateToPOS = () => {
    Alert.alert(
      t('farmManagement.pos.lockedTitle', 'Access Restricted'),
      t('farmManagement.pos.lockedMessage', 'You are not eligible yet for this access. This feature will be available soon.'),
      [
        {
          text: t('common.ok', 'OK'),
          style: 'default'
        }
      ]
    );
  };

  const navigateToOrder = () => {
    navigation.navigate(AppScreens.ORDER);
  };

  const navigateToShipping = () => {
    navigation.navigate(AppScreens.SHIPPING);
  };

  const navigateToShippingMethod = () => {
    navigation.navigate(AppScreens.SHIPPING_METHOD);
  };

  return (
    <Layout style={[styles.container, { 
      backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']
    }]}>
      <ScrollView style={styles.scrollView}>
        {/* Financial Management */}
        <Layout style={[styles.section, { 
          backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)',
          borderRadius: 12 
        }]}>
          <Text style={[styles.sectionTitle, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>Financial Management</Text>

          <ProfileActionButton
            title={t('farmManagement.actions.refundHandle.title')}
            subtitle={t('farmManagement.actions.refundHandle.subtitle')}
            iconName="undo-outline"
            onPress={navigateToRefundHandle}
          />
          <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
          <ProfileActionButton
            title={t('farmManagement.actions.couponHandling.title')}
            subtitle={t('farmManagement.actions.couponHandling.subtitle')}
            iconName="gift-outline"
            onPress={navigateToCouponHandling}
          />
        </Layout>

        {/* Statistics & Analytics */}
        <Layout style={[styles.section, { 
          backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)',
          borderRadius: 12 
        }]}>
          <Text style={[styles.sectionTitle, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>Statistics & Analytics</Text>

          <ProfileActionButton
            title={t('farmDetailsEditScreen.managementButtons.earnings.title')}
            subtitle={t('farmDetailsEditScreen.managementButtons.earnings.subtitle')}
            iconName="trending-up-outline"
            onPress={() => navigateToEarnings()}
          />
          {/* <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} /> */}
          {/* <ProfileActionButton
            title={t('farmDetailsEditScreen.managementButtons.orders.title')}
            subtitle={t('farmDetailsEditScreen.managementButtons.orders.subtitle')}
            iconName="list-outline"
            onPress={() => navigateToOrders()}
          /> */}
          <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
          <ProfileActionButton
            title={t('farmDetailsEditScreen.managementButtons.reviews.title')}
            subtitle={t('farmDetailsEditScreen.managementButtons.reviews.subtitle')}
            iconName="star-outline"
            onPress={() => navigateToReviews()}
          />
          <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
          <ProfileActionButton
            title={t('farmDetailsEditScreen.managementButtons.transactions.title')}
            subtitle={t('farmDetailsEditScreen.managementButtons.transactions.subtitle')}
            iconName="credit-card-outline"
            onPress={() => navigateToTransactions()}
          />
        </Layout>
        {/* Settings */}
        <Layout style={[styles.section, { 
          backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)',
          borderRadius: 12 
        }]}>
          <Text style={[styles.sectionTitle, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>Settings</Text>

          <ProfileActionButton
            title={t('farmDetailsEditScreen.managementButtons.shopSettings.title')}
            subtitle={t('farmDetailsEditScreen.managementButtons.shopSettings.subtitle')}
            iconName="settings-outline"
            onPress={() => navigateToShopSettings()}
          />
        </Layout>

        {/* Delivery Management */}
        <Layout style={[styles.section, { 
          backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)',
          borderRadius: 12 
        }]}>
          <Text style={[styles.sectionTitle, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>Delivery Management</Text>

          <ProfileActionButton
            title={t('farmDetailsEditScreen.managementButtons.deliveryManagement.title')}
            subtitle={t('farmDetailsEditScreen.managementButtons.deliveryManagement.subtitle')}
            iconName="car-outline"
            onPress={navigateToDeliveryManagement}
            disabled
          />
        </Layout>

        {/* Sales Management */}
        <Layout style={[styles.section, { 
          backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)',
          borderRadius: 12 
        }]}>
          <Text style={[styles.sectionTitle, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>Sales Management</Text>
          <ProfileActionButton
            title={t('farmManagement.actions.order.title')}
            subtitle={t('farmManagement.actions.order.subtitle')}
            iconName="shopping-cart-outline"
            onPress={navigateToOrder}
          />
            <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />

          <ProfileActionButton
            title={t('farmManagement.actions.pos.title')}
            subtitle={t('farmManagement.actions.pos.subtitle')}
            iconName="lock-outline"
            onPress={navigateToPOS}
            disabled={true}
            style={{ opacity: 0.6 }}
          />
        
        </Layout>


        {/* Shippings */}
        <Layout style={[styles.section, { 
          backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)',
          borderRadius: 12 
        }]}>
          <Text style={[styles.sectionTitle, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>Shippings</Text>
<ProfileActionButton
            title={t('farmManagement.actions.shippingMethod.title')}
            subtitle={t('farmManagement.actions.shippingMethod.subtitle')}
            iconName="options-outline"
            onPress={navigateToShippingMethod}
          />
                    <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />

          <ProfileActionButton
            title={t('farmManagement.actions.shipping.title')}
            subtitle={t('farmManagement.actions.shipping.subtitle')}
            iconName="paper-plane-outline"
            onPress={navigateToShipping}
          />
          
        </Layout>

        
        
        

      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
}); 