import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  Layout,
  Text,
  Input,
  Button,
  Spinner,
  Divider,
} from '@ui-kitten/components';
import { useTheme } from '../../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ProfileActionButton } from '../../../../components/profile';
import { AppScreens } from '../../../../navigators/AppNavigator';




export const FarmManagement = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

 
 



  const navigateToSellerForgotPassword = () => {
    navigation.navigate('SellerForgotPassword');
  };

  const navigateToSellerResetPassword = () => {
    navigation.navigate('SellerResetPassword');
  };

  const navigateToRefundHandle = () => {
    navigation.navigate(AppScreens.REFUND_HANDLE);
  };

  const navigateToCouponHandling = () => {
    navigation.navigate(AppScreens.COUPON_HANDLING);
  };

  const navigateToPOS = () => {
    navigation.navigate(AppScreens.POS);
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
        {/* Password Management Section */}
        <Layout style={[styles.section, { 
          backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)',
          borderRadius: 12 
        }]}>
          <ProfileActionButton
            title="Forgot Password"
            subtitle="Reset your password via email/SMS"
            iconName="info-outline"
            onPress={navigateToSellerForgotPassword}
          />
          <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
          <ProfileActionButton
            title="Change Password"
            subtitle="Update your current password"
            iconName="info-outline"
            onPress={navigateToSellerResetPassword}
          />
          <ProfileActionButton
            title="Refund Handle"
            subtitle="Handle refund requests"
            iconName="info-outline"
            onPress={navigateToRefundHandle}
          />
          <ProfileActionButton
            title="Coupon Handling"
            subtitle="Handle coupon requests"
            iconName="info-outline"
            onPress={navigateToCouponHandling}
          />
          <ProfileActionButton
            title="POS"
            subtitle="Handle POS requests"
            iconName="info-outline"
            onPress={navigateToPOS}
          />
          <ProfileActionButton
            title="Order"
            subtitle="Handle order requests"
            iconName="info-outline"
            onPress={navigateToOrder}
          />
          <ProfileActionButton
            title="Shipping"
            subtitle="Handle shipping requests"
            iconName="info-outline"
            onPress={navigateToShipping}
          />
          <ProfileActionButton
            title="Shipping Method"
            subtitle="Handle shipping method requests"
            iconName="info-outline"
            onPress={navigateToShippingMethod}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    marginLeft: 8,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  staticImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 8,
  },
  staticImage: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  staticInfo: {
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 80,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
}); 