import React, { useState } from 'react';
import { StyleSheet, View, Dimensions, Modal, TouchableOpacity } from 'react-native';
import { Layout, Text, Input, Button, Icon } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';

import { axiosSellerClient } from '../../utils/axiosClient';
import { handleSellerLogin } from '../../store/user';
import { InputError, SubmitButton } from '../form';
import { useTheme } from '../../theme/ThemeContext';

const { width } = Dimensions.get('window');

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address'),
  phone: Yup.string()
    .matches(/^\d+$/, 'Phone must be numeric')
    .min(10, 'Phone must be at least 10 digits'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
}).test(
  'emailOrPhoneRequired',
  'Either email or phone is required',
  function (value) {
    const { email, phone } = value;
    return !!(email || phone);
  }
);

export const SellerAuthModal = ({ visible, onClose, onSuccess, title = 'Sign in as Seller' }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isDark, theme } = useTheme();

  const [isBtnDisabled, setIsBtnDisabled] = useState(false);
  const [selectedTab, setSelectedTab] = useState('email');

  const submitForm = async (values, { setSubmitting }) => {
    try {
      setIsBtnDisabled(true);

      const formData = new FormData();
      if (selectedTab === 'email' && values.email.trim() !== '') {
        formData.append('email', values.email.trim());
      } else if (selectedTab === 'phone' && values.phone.trim() !== '') {
        formData.append('phone', values.phone.trim());
      }

      formData.append('password', values.password);

      const headers = {
        'Content-Type': 'multipart/form-data',
      };

      const response = await axiosSellerClient.post('auth/login', formData, {
        headers: headers,
      });

      console.debug("Seller Login Success Response", response.data);

      if (response?.data?.token) {
        dispatch(handleSellerLogin(response.data.token));
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Successfully signed in as seller!'
        });
        onSuccess && onSuccess();
        onClose();
      }

    } catch (error) {
      console.error('Seller login error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Login failed';
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMessage
      });
    } finally {
      setIsBtnDisabled(false);
      setSubmitting(false);
    }
  };

  const renderTabButton = (tab, label) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        selectedTab === tab && styles.activeTab,
        {
          backgroundColor: selectedTab === tab 
            ? theme['color-primary-500'] 
            : theme['color-basic-200']
        }
      ]}
      onPress={() => setSelectedTab(tab)}
    >
      <Text
        style={[
          styles.tabText,
          {
            color: selectedTab === tab 
              ? theme['color-basic-100'] 
              : theme['color-basic-600']
          }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Layout style={[styles.modalContainer, { 
          backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']
        }]}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text category="h5" style={[styles.title, { 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>
              {t(title)}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon
                name="close-outline"
                width={24}
                height={24}
                fill={isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']}
              />
            </TouchableOpacity>
          </View>

          <Text category="p2" style={[styles.subtitle, { 
            color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-700']
          }]}>
            {t('Please sign in as a seller to manage your products and view customer messages.')}
          </Text>

          {/* Login Form */}
          <Formik
            initialValues={{ email: '', phone: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={submitForm}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <View style={styles.form}>
                
                {/* Tab Buttons */}
                <View style={styles.tabContainer}>
                  {renderTabButton('email', t('auth.email'))}
                  {renderTabButton('phone', t('auth.phone'))}
                </View>

                {/* Input Fields */}
                {selectedTab === 'email' ? (
                  <View style={styles.inputContainer}>
                    <Input
                      placeholder={t('auth.enterYourEmail')}
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
                ) : (
                  <View style={styles.inputContainer}>
                    <Input
                      placeholder={t('auth.enterYourPhone')}
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
                )}

                <View style={styles.inputContainer}>
                  <Input
                    placeholder={t('auth.enterYourPassword')}
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    secureTextEntry={true}
                    style={styles.input}
                  />
                  {touched.password && errors.password && (
                    <InputError error={errors.password} />
                  )}
                </View>

                {/* Submit Button */}
                <SubmitButton
                  onPress={handleSubmit}
                  disabled={isBtnDisabled || isSubmitting}
                  btnText={t('auth.signInAsSeller')}
                />

              </View>
            )}
          </Formik>

        </Layout>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    // Styling handled by backgroundColor in component
  },
  tabText: {
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderRadius: 8,
  },

}); 