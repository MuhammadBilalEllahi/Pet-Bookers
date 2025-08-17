import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Layout, Text, Input, Button } from '@ui-kitten/components';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import Toast from 'react-native-toast-message';

import { smartBuyerClient, handleAuthError, setAuthModalHandlers } from '../../utils/authAxiosClient';
import { BuyerAuthModal } from '../../components/modals';
import { 
  selectCustomerInfo, 
  selectIsBuyerAuthenticated, 
  selectIsSellerAuthenticated,
  fetchCustomerInfo,
  logoutBuyer
} from '../../store/user';
import { InputError, SubmitButton } from '../../components/form';

const ProfileSchema = Yup.object().shape({
  f_name: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  l_name: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^\d+$/, 'Phone must be numeric')
    .min(10, 'Phone must be at least 10 digits')
    .required('Phone is required'),
});

export const UpdateProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(false);
  const [showBuyerAuthModal, setShowBuyerAuthModal] = useState(false);
  
  // Get state from Redux
  const customerInfo = useSelector(selectCustomerInfo);
  const isBuyerAuthenticated = useSelector(selectIsBuyerAuthenticated);
  const isSellerAuthenticated = useSelector(selectIsSellerAuthenticated);

  // Set up auth modal handlers
  useEffect(() => {
    setAuthModalHandlers({
      showBuyerAuthModal: () => setShowBuyerAuthModal(true),
    });
  }, []);

  // Check authentication and load profile on component mount
  useEffect(() => {
    if (isBuyerAuthenticated) {
      // Fetch latest customer info if not available
    if (!customerInfo) {
      dispatch(fetchCustomerInfo());
    }
    } else {
      // Show different message based on auth state
      if (isSellerAuthenticated) {
        Alert.alert(
          'Buyer Authentication Required',
          'You are currently signed in as a seller. To update your buyer profile, please also sign in as a buyer.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
            { text: 'Sign in as Buyer', onPress: () => setShowBuyerAuthModal(true) }
          ]
        );
      } else {
        setShowBuyerAuthModal(true);
      }
    }
  }, [isBuyerAuthenticated, isSellerAuthenticated, customerInfo, dispatch]);

  const handleUpdateProfile = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('f_name', values.f_name);
      formData.append('l_name', values.l_name);
      formData.append('email', values.email);
      formData.append('phone', values.phone);
      formData.append('_method', 'PUT');

      const response = await smartBuyerClient.put('customer/update-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // console.log('Profile updated:', response.data);
      
      // Refresh customer info after successful update
      dispatch(fetchCustomerInfo());
      
        Toast.show({
          type: 'success',
        text1: 'Success',
        text2: 'Profile updated successfully!'
        });

        navigation.goBack();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      handleAuthError(error, (err) => {
        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update profile';
      Toast.show({
        type: 'error',
          text1: 'Update Failed',
          text2: errorMessage
        });
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!customerInfo?.id) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Customer ID not found'
      });
        return;
      }

    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
    try {
              setLoading(true);
      
              const response = await smartBuyerClient.get(`customer/account-delete/${customerInfo.id}`);
              // console.log('Account deletion response:', response.data);
              
              // Logout buyer after account deletion
              dispatch(logoutBuyer());
              
        Toast.show({
          type: 'success',
          text1: 'Account Deleted',
                text2: 'Your account has been successfully deleted'
        });

              navigation.navigate('Login');
              
    } catch (error) {
              console.error('Error deleting account:', error);
              handleAuthError(error, (err) => {
                const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete account';
      Toast.show({
        type: 'error',
                  text1: 'Deletion Failed',
                  text2: errorMessage
                });
      });
    } finally {
              setLoading(false);
    }
          }
        }
      ]
    );
  };

  const handleAuthSuccess = () => {
    setShowBuyerAuthModal(false);
    // Fetch customer info after successful authentication
    dispatch(fetchCustomerInfo());
  };

  if (!isBuyerAuthenticated) {
    return (
      <>
        <Layout style={[styles.authContainer, { backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }]}>
          <Text style={[styles.authMessage, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
            {isSellerAuthenticated 
              ? 'Please sign in as a buyer to update your profile'
              : 'Please sign in to update your profile'
            }
          </Text>
          <Button
            onPress={() => setShowBuyerAuthModal(true)}
            style={styles.authButton}
          >
            Sign in as Buyer
          </Button>
      </Layout>
        
        <BuyerAuthModal
          visible={showBuyerAuthModal}
          onClose={() => {
            setShowBuyerAuthModal(false);
            navigation.goBack();
          }}
          onSuccess={handleAuthSuccess}
          title="Sign in as Buyer"
        />
      </>
    );
  }

  if (!customerInfo) {
    return (
      <Layout style={[styles.loadingContainer, { backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }]}>
        <Text style={[styles.loadingText, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
          Loading profile...
        </Text>
      </Layout>
    );
  }

  return (
    <Layout style={[styles.container, { backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.title, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
          Update Profile
            </Text>

          <Formik
            initialValues={{
            f_name: customerInfo.f_name || '',
            l_name: customerInfo.l_name || '',
            email: customerInfo.email || '',
            phone: customerInfo.phone || '',
            }}
          validationSchema={ProfileSchema}
          onSubmit={handleUpdateProfile}
            enableReinitialize={true}
          >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
                  First Name
                </Text>
                <Input
                  placeholder="Enter your first name"
                  value={values.f_name}
                  onChangeText={handleChange('f_name')}
                  onBlur={handleBlur('f_name')}
                  style={styles.input}
                />
                {touched.f_name && errors.f_name && (
                  <InputError error={errors.f_name} />
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
                  Last Name
                </Text>
                <Input
                  placeholder="Enter your last name"
                  value={values.l_name}
                  onChangeText={handleChange('l_name')}
                  onBlur={handleBlur('l_name')}
                  style={styles.input}
                />
                {touched.l_name && errors.l_name && (
                  <InputError error={errors.l_name} />
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
                  Email
                </Text>
                <Input
                  placeholder="Enter your email"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
                {touched.email && errors.email && (
                  <InputError error={errors.email} />
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
                  Phone
                </Text>
                <Input
                  placeholder="Enter your phone number"
                  value={values.phone}
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
                {touched.phone && errors.phone && (
                  <InputError error={errors.phone} />
                )}
              </View>

              <SubmitButton
                  onPress={handleSubmit}
                disabled={loading || isSubmitting}
                title="Update Profile"
                style={styles.updateButton}
              />
            </View>
            )}
          </Formik>

        <View style={styles.dangerZone}>
          <Text style={[styles.dangerTitle, { color: theme['color-danger-500'] }]}>
            Danger Zone
          </Text>
            <Button
              onPress={handleDeleteAccount}
            disabled={loading}
            style={[styles.deleteButton, { backgroundColor: theme['color-danger-500'] }]}
            appearance="filled"
            >
              Delete Account
            </Button>
          </View>
      </ScrollView>

      {/* Buyer Authentication Modal */}
      <BuyerAuthModal
        visible={showBuyerAuthModal}
        onClose={() => {
          setShowBuyerAuthModal(false);
          navigation.goBack();
        }}
        onSuccess={handleAuthSuccess}
        title="Sign in as Buyer"
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
  },
  updateButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  authMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    minWidth: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  dangerZone: {
    borderTopWidth: 1,
    borderTopColor: '#ff4757',
    paddingTop: 24,
    marginTop: 16,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  deleteButton: {
    borderRadius: 8,
  },
});
