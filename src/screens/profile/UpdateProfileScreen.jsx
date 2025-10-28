import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {Layout, Text, Input, Button, Icon} from '@ui-kitten/components';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useSelector, useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../../theme/ThemeContext';
import Toast from 'react-native-toast-message';
import {COUNTRY_CODES} from '../../utils/constants';

import {
  smartBuyerClient,
  handleAuthError,
  setAuthModalHandlers,
} from '../../utils/authAxiosClient';
import {axiosBuyerClient} from '../../utils/axiosClient';
import {AppScreens} from '../../navigators/AppNavigator';
import {
  selectCustomerInfo,
  selectIsBuyerAuthenticated,
  selectIsSellerAuthenticated,
  fetchCustomerInfo,
  logoutBuyer,
} from '../../store/user';
import {InputError, SubmitButton} from '../../components/form';

const createProfileSchema = t =>
  Yup.object().shape({
    f_name: Yup.string()
      .min(2, t('profile.updateProfile.validation.firstNameMin'))
      .required(t('profile.updateProfile.validation.firstNameRequired')),
    l_name: Yup.string()
      .min(2, t('profile.updateProfile.validation.lastNameMin'))
      .required(t('profile.updateProfile.validation.lastNameRequired')),
    email: Yup.string()
      .email(t('profile.updateProfile.validation.emailInvalid'))
      .required(t('profile.updateProfile.validation.emailRequired')),
    phone: Yup.string()
      .matches(/^\d+$/, t('profile.updateProfile.validation.phoneNumeric'))
      .min(10, t('profile.updateProfile.validation.phoneMin'))
      .required(t('profile.updateProfile.validation.phoneRequired')),
  });

export const UpdateProfileScreen = ({navigation}) => {
  const {t} = useTranslation();
  const {theme, isDark} = useTheme();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('+92');
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [parsedPhone, setParsedPhone] = useState('');

  // Get state from Redux
  const customerInfo = useSelector(selectCustomerInfo);
  const isBuyerAuthenticated = useSelector(selectIsBuyerAuthenticated);
  const isSellerAuthenticated = useSelector(selectIsSellerAuthenticated);

  // Set up auth modal handlers
  useEffect(() => {
    setAuthModalHandlers({
      showBuyerAuthModal: () =>
        navigation.navigate(AppScreens.LOGIN, {isItSeller: false}),
    });
  }, [navigation]);

  // Parse phone number to extract country code when customer info is loaded
  useEffect(() => {
    if (customerInfo?.phone) {
      const userPhone = customerInfo.phone;
      // Try to find matching country code
      const foundCountry = COUNTRY_CODES.find(code =>
        userPhone.startsWith(code.code),
      );
      if (foundCountry) {
        setCountryCode(foundCountry.code);
        // Extract phone number without country code
        setParsedPhone(userPhone.substring(foundCountry.code.length));
      } else {
        // Default to Pakistan code if no match
        setCountryCode('+92');
        setParsedPhone(userPhone);
      }
    }
  }, [customerInfo]);

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
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => navigation.goBack(),
            },
            {
              text: 'Sign in as Buyer',
              onPress: () =>
                navigation.navigate(AppScreens.LOGIN, {isItSeller: false}),
            },
          ],
        );
      } else {
        navigation.navigate(AppScreens.LOGIN, {isItSeller: false});
      }
    }
  }, [isBuyerAuthenticated, isSellerAuthenticated, customerInfo, dispatch]);

  const handleUpdateProfile = async (values, {setSubmitting}) => {
    // console.log('🚀 FORM SUBMITTED - Profile update started with values:', values);

    // Validate required fields before submission
    if (!values.f_name || !values.l_name || !values.email || !values.phone) {
      Toast.show({
        type: 'error',
        text1: t('profile.updateProfile.validationError'),
        text2: t('profile.updateProfile.fillAllFields'),
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      Toast.show({
        type: 'error',
        text1: t('profile.updateProfile.validationError'),
        text2: t('profile.updateProfile.validEmail'),
      });
      return;
    }

    // Validate phone format
    if (!/^\d+$/.test(values.phone) || values.phone.length < 10) {
      Toast.show({
        type: 'error',
        text1: t('profile.updateProfile.validationError'),
        text2: t('profile.updateProfile.validPhone'),
      });
      return;
    }

    try {
      // console.log('⏳ Setting loading state to true');
      setLoading(true);

      const formData = new FormData();
      formData.append('f_name', values.f_name);
      formData.append('l_name', values.l_name);
      formData.append('email', values.email);
      const fullPhoneNumber = `${countryCode}${values.phone}`;
      formData.append('phone', fullPhoneNumber);
      // formData.append('_method', 'PUT');

      // console.log('Sending profile update data:', {
      //   f_name: values.f_name,
      //   l_name: values.l_name,
      //   email: values.email,
      //   phone: values.phone,
      // });

      const response = await smartBuyerClient.post(
        'customer/update-profile',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      // console.log('Profile updated successfully:', response.data);

      // Set submitted state
      setSubmitted(true);
      // console.log('✅ FORM SUBMITTED SUCCESSFULLY - Profile updated!');

      // Refresh customer info after successful update
      dispatch(fetchCustomerInfo());

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('profile.updateProfile.updateSuccess'),
      });

      // Navigate back after a short delay to show success state
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      handleAuthError(error, err => {
        const errorMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to update profile';
        Toast.show({
          type: 'error',
          text1: t('profile.updateProfile.updateFailed'),
          text2: errorMessage,
        });
      });
    } finally {
      // console.log('⏳ Setting loading state to false');
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!customerInfo?.id) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('profile.updateProfile.customerIdNotFound'),
      });
      return;
    }

    if (!customerInfo?.email) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('profile.updateProfile.emailNotFound'),
      });
      return;
    }

    Alert.alert(
      t('profile.updateProfile.deleteAccount'),
      t('profile.updateProfile.deleteAccountMessage'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('common.continue'),
          style: 'destructive',
          onPress: () => {
            // Show authentication modal to verify password
            setShowAuthModal(true);
          },
        },
      ],
    );
  };

  const handleVerifyAndDelete = async () => {
    if (!authPassword) {
      Toast.show({
        type: 'error',
        text1: t('profile.updateProfile.passwordRequired'),
        text2: t('profile.updateProfile.passwordRequiredMessage'),
      });
      return;
    }

    try {
      setAuthLoading(true);

      // Step 1: Verify credentials by logging in
      const formData = new FormData();
      formData.append('email', customerInfo.email);
      formData.append('password', authPassword);

      const loginResponse = await axiosBuyerClient.post(
        'auth/login',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (!loginResponse?.data?.token) {
        throw new Error('Invalid credentials');
      }

      // Step 2: If credentials are valid, proceed with account deletion
      await smartBuyerClient.get(`customer/account-delete/${customerInfo.id}`);

      // Close auth modal
      setShowAuthModal(false);
      setAuthPassword('');

      // Logout buyer after account deletion
      dispatch(logoutBuyer());

      Toast.show({
        type: 'success',
        text1: 'Account Deleted',
        text2: 'Your account has been successfully deleted',
      });

      navigation.navigate('Login');
    } catch (error) {
      console.error('Error verifying/delete account:', error);

      if (error?.response?.status === 401 || error?.response?.status === 403) {
        Toast.show({
          type: 'error',
          text1: 'Authentication Failed',
          text2: 'Incorrect password. Please try again.',
        });
      } else {
        handleAuthError(error, err => {
          const errorMessage =
            err?.response?.data?.message ||
            err?.message ||
            'Failed to delete account';
          Toast.show({
            type: 'error',
            text1: 'Deletion Failed',
            text2: errorMessage,
          });
        });
      }
    } finally {
      setAuthLoading(false);
    }
  };

  if (!isBuyerAuthenticated) {
    return (
      <>
        <Layout
          style={[
            styles.authContainer,
            {
              backgroundColor: isDark
                ? theme['color-shadcn-background']
                : theme['color-basic-100'],
            },
          ]}>
          <Text
            style={[
              styles.authMessage,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            {isSellerAuthenticated
              ? 'Please sign in as a buyer to update your profile'
              : 'Please sign in to update your profile'}
          </Text>
          <Button
            onPress={() =>
              navigation.navigate(AppScreens.LOGIN, {isItSeller: false})
            }
            style={styles.authButton}>
            Sign in as Buyer
          </Button>
        </Layout>
      </>
    );
  }

  if (!customerInfo) {
    return (
      <Layout
        style={[
          styles.loadingContainer,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          },
        ]}>
        <Text
          style={[
            styles.loadingText,
            {
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            },
          ]}>
          Loading profile...
        </Text>
      </Layout>
    );
  }

  return (
    <Layout
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
        },
      ]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <Text
          style={[
            styles.title,
            {
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            },
          ]}>
          Update Profile
        </Text>

        <Formik
          initialValues={{
            f_name: customerInfo.f_name || '',
            l_name: customerInfo.l_name || '',
            email: customerInfo.email || '',
            phone: parsedPhone || '',
          }}
          validationSchema={createProfileSchema(t)}
          onSubmit={handleUpdateProfile}
          enableReinitialize={true}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isSubmitting,
            isValid,
          }) => {
            return (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text
                    style={[
                      styles.label,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    First Name
                  </Text>
                  <Input
                    placeholder={t(
                      'profile.updateProfile.firstNamePlaceholder',
                    )}
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
                  <Text
                    style={[
                      styles.label,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    Last Name
                  </Text>
                  <Input
                    placeholder={t('profile.updateProfile.lastNamePlaceholder')}
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
                  <Text
                    style={[
                      styles.label,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    Email
                  </Text>
                  <Input
                    placeholder={t('profile.updateProfile.emailPlaceholder')}
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
                  <Text
                    style={[
                      styles.label,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    Phone
                  </Text>
                  <View
                    style={[
                      styles.phoneRowImproved,
                      {
                        backgroundColor: isDark
                          ? theme['color-shadcn-card']
                          : theme['color-basic-100'],
                        borderColor: isDark
                          ? theme['color-shadcn-border']
                          : theme['color-basic-400'],
                      },
                    ]}>
                    <TouchableOpacity
                      style={[
                        styles.countryCodeTouchable,
                        {
                          backgroundColor: isDark
                            ? theme['color-shadcn-secondary']
                            : theme['color-basic-200'],
                          borderRightColor: isDark
                            ? theme['color-shadcn-border']
                            : theme['color-basic-400'],
                        },
                      ]}
                      onPress={() => setCountryModalVisible(true)}
                      activeOpacity={0.7}>
                      <Text
                        style={[
                          styles.countryCodeText,
                          {
                            color: isDark
                              ? theme['color-shadcn-foreground']
                              : theme['color-basic-900'],
                          },
                        ]}>
                        {COUNTRY_CODES.find(c => c.code === countryCode)
                          ?.label || '+92'}
                      </Text>
                      <Text
                        style={[
                          styles.countryCodeDropdownIcon,
                          {
                            color: isDark
                              ? theme['color-shadcn-muted-foreground']
                              : theme['color-basic-600'],
                          },
                        ]}>
                        ▼
                      </Text>
                    </TouchableOpacity>
                    <View style={{flex: 1}}>
                      <Input
                        placeholder={t(
                          'profile.updateProfile.phonePlaceholder',
                        )}
                        value={values.phone}
                        onChangeText={handleChange('phone')}
                        onBlur={handleBlur('phone')}
                        keyboardType="phone-pad"
                        style={[
                          styles.phoneInputImproved,
                          {
                            backgroundColor: isDark
                              ? theme['color-shadcn-card']
                              : theme['color-basic-100'],
                          },
                        ]}
                        textStyle={[
                          {
                            color: isDark
                              ? theme['color-shadcn-foreground']
                              : theme['color-basic-900'],
                          },
                        ]}
                      />
                    </View>
                  </View>
                  {touched.phone && errors.phone && (
                    <InputError error={errors.phone} />
                  )}
                </View>

                {submitted ? (
                  <View
                    style={[
                      styles.successContainer,
                      {backgroundColor: theme['color-success-100']},
                    ]}>
                    <Text
                      style={[
                        styles.successText,
                        {color: theme['color-success-600']},
                      ]}>
                      ✅ Profile updated successfully!
                    </Text>
                  </View>
                ) : (
                  <SubmitButton
                    btnText={isSubmitting ? 'Updating...' : 'Update Profile'}
                    onPress={handleSubmit}
                    disabled={loading || isSubmitting}
                    style={styles.updateButton}
                  />
                )}
              </View>
            );
          }}
        </Formik>

        <View style={styles.dangerZone}>
          <Text
            style={[styles.dangerTitle, {color: theme['color-danger-500']}]}>
            Danger Zone
          </Text>
          <Button
            onPress={handleDeleteAccount}
            disabled={loading}
            style={[
              styles.deleteButton,
              {backgroundColor: theme['color-danger-500']},
            ]}
            appearance="filled">
            {t('profile.updateProfile.deleteAccount')}
          </Button>
        </View>
      </ScrollView>

      {/* Account Deletion Authentication Modal */}
      <Modal
        visible={showAuthModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowAuthModal(false);
          setAuthPassword('');
        }}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowAuthModal(false);
            setAuthPassword('');
          }}>
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: isDark
                  ? theme['color-shadcn-card']
                  : theme['color-basic-100'],
              },
            ]}>
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                Verify Your Identity
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAuthModal(false);
                  setAuthPassword('');
                }}>
                <Icon
                  name="close"
                  fill={
                    isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600']
                  }
                  style={{width: 24, height: 24}}
                />
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.modalDescription,
                {
                  color: isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600'],
                },
              ]}>
              For security, please enter your password to confirm account
              deletion. This action cannot be undone.
            </Text>

            <View style={styles.modalInputContainer}>
              <Text
                style={[
                  styles.modalLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                Email
              </Text>
              <Input
                value={customerInfo?.email || ''}
                disabled={true}
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: isDark
                      ? theme['color-shadcn-secondary']
                      : theme['color-basic-200'],
                  },
                ]}
                textStyle={[
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-500'],
                  },
                ]}
              />
            </View>

            <View style={styles.modalInputContainer}>
              <Text
                style={[
                  styles.modalLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                Password
              </Text>
              <Input
                placeholder={t('profile.updateProfile.passwordPlaceholder')}
                value={authPassword}
                onChangeText={setAuthPassword}
                secureTextEntry={true}
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: isDark
                      ? theme['color-shadcn-card']
                      : theme['color-basic-100'],
                    borderColor: isDark
                      ? theme['color-shadcn-border']
                      : theme['color-basic-400'],
                  },
                ]}
                textStyle={[
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}
                accessoryLeft={
                  <Icon
                    name="lock"
                    fill={
                      isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600']
                    }
                    style={{width: 20, height: 20}}
                  />
                }
              />
            </View>

            <View style={styles.modalButtons}>
              <Button
                onPress={() => {
                  setShowAuthModal(false);
                  setAuthPassword('');
                }}
                disabled={authLoading}
                style={[
                  styles.modalCancelButton,
                  {
                    backgroundColor: isDark
                      ? theme['color-shadcn-secondary']
                      : theme['color-basic-200'],
                    borderColor: isDark
                      ? theme['color-shadcn-border']
                      : theme['color-basic-400'],
                  },
                ]}
                appearance="ghost">
                Cancel
              </Button>
              <Button
                onPress={handleVerifyAndDelete}
                disabled={authLoading || !authPassword}
                style={[
                  styles.modalDeleteButton,
                  {
                    backgroundColor: theme['color-danger-500'],
                  },
                ]}
                appearance="filled">
                {authLoading
                  ? t('profile.updateProfile.verifying')
                  : t('profile.updateProfile.deleteAccount')}
              </Button>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Country Code Selection Modal */}
      <Modal
        visible={countryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCountryModalVisible(false)}>
        <TouchableOpacity
          style={[
            styles.countryModalOverlay,
            {
              backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)',
            },
          ]}
          activeOpacity={1}
          onPressOut={() => setCountryModalVisible(false)}>
          <View
            style={[
              styles.countryModal,
              {
                backgroundColor: isDark
                  ? theme['color-shadcn-card']
                  : theme['color-basic-100'],
              },
            ]}>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={item => item.code}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.countryModalItem,
                    {
                      borderBottomColor: isDark
                        ? theme['color-shadcn-border']
                        : theme['color-basic-400'],
                    },
                  ]}
                  onPress={() => {
                    setCountryCode(item.code);
                    setCountryModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.countryModalItemText,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  successContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  modalInputContainer: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInput: {
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    borderRadius: 8,
  },
  modalDeleteButton: {
    flex: 1,
    borderRadius: 8,
  },
  phoneRowImproved: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  countryCodeTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    minWidth: 90,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    marginRight: 4,
  },
  countryCodeDropdownIcon: {
    fontSize: 12,
    marginLeft: 2,
  },
  phoneInputImproved: {
    flex: 1,
    marginVertical: 0,
    marginLeft: 0,
    borderWidth: 0,
    paddingLeft: 2,
  },
  countryModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryModal: {
    borderRadius: 10,
    width: 280,
    maxHeight: 350,
    paddingVertical: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  countryModalItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
  },
  countryModalItemText: {
    fontSize: 16,
  },
});
