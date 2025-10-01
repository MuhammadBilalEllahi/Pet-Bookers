import * as Yup from 'yup';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, Image, Dimensions, TouchableOpacity, Modal } from 'react-native';
import { Layout, Text, Input, CheckBox, Icon } from '@ui-kitten/components';
import { Formik } from 'formik';
import { InputError, SubmitButton } from '../../components/form';
import { AuthContainer } from '../../components/auth/AuthContainer';
const { width } = Dimensions.get('window');
import TextButton from '../../components/form/TextButton';
import { axiosBuyerClient, axiosSellerClient, } from '../../utils/axiosClient';
import { 
  setAuthToken, 
  setUserType, 
  UserType, 
  handleUserLogin,
  handleBuyerLogin,
  handleSellerLogin
} from '../../store/user';
import { getAuthToken } from '../../utils/localstorage';
import { useDispatch } from 'react-redux';
import { AppScreens } from '../../navigators/AppNavigator';
import { useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../theme/ThemeContext';
// import axios from 'axios';

// const SELLER_LOGIN_URL = 'https://petbookers.com.pk/api/v3/seller/auth/login';


const createLoginSchema = (t) => Yup.object().shape({
  email: Yup.string()
    .email(t('validation.invalidEmail')),
  phone: Yup.string()
    .matches(/^\d+$/, t('validation.phoneNumeric'))
    .min(10, t('validation.phoneMinLength')),
  password: Yup.string()
    .required(t('validation.passwordRequired'))
    .min(6, t('validation.passwordMinLength')),
}).test(
  'emailOrPhoneRequired',
  t('validation.emailOrPhoneRequired'),
  function (value) {
    const { email, phone } = value;
    return !!(email || phone);
  }
);



export const LoginScreen = ({ navigation  }) => {
  const route = useRoute()
  const { isItSeller: initialIsSeller = true, email = '', password = '' } = route.params || {};
  console.debug("THIS IS ", initialIsSeller, email, password)
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isDark, theme } = useTheme();

  const [isBtnDisabled, setIsBtnDisabled] = useState(false);
  const [selectedTab, setSelectedTab] = useState('email');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSeller, setIsSeller] = useState(initialIsSeller);
  const [userTypeModalVisible, setUserTypeModalVisible] = useState(false);

  const navigateToPage = pageName => {
    navigation.navigate(pageName);
  };

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
      }
      let response;
      isSeller ?
        response = await axiosSellerClient.post('auth/login', formData, {
          headers: headers,
        })
        : response = await axiosBuyerClient.post('auth/login', formData, {
          headers: headers,
        });


      // TODO: handle login success (e.g., navigation, token storage, etc.)
      console.debug("Login Success Response", response.data);

      if (response?.data?.token) {
        // console.log("IN TOKEN")
        const userType = isSeller ? UserType.SELLER : UserType.BUYER;
        
        // Use new dual auth system
        if (isSeller) {
          dispatch(handleSellerLogin(response.data.token));
        } else {
          dispatch(handleBuyerLogin(response.data.token));
        }
        
        // Also maintain legacy auth for backward compatibility
        dispatch(handleUserLogin(response.data.token, userType));
        
        navigateToPage( isSeller ?  AppScreens.SELLER_HOME_MAIN: AppScreens.BUYER_HOME_MAIN)
      }

      // const v = await getAuthToken();
      // // console.log("MEOW", v)

    } catch (error) {
      // TODO: handle error (e.g., show error message)
      if (error.response) {
        console.error("Login Error Response", error.response.data);
        Toast.show({
        type: 'error',
        text1: error.response.data.errors[0].message,
        text2: t('registration.loginFailed'),
        position: 'top',
      });
      } else {
        console.error("Login Error", error);
        Toast.show({
        type: 'error',
        text1: t('registration.somethingWentWrong'),
        text2: t('registration.loginFailed'),
        position: 'top',
      });
      }
    } finally {
      setIsBtnDisabled(false);
      setSubmitting(false);
    }
  };

  return (
    <AuthContainer>
      <View style={styles.topSection}>
        <Image
          source={require('../../../assets/new/main_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={[styles.titleText, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>{t('yourPetOurSecurity')}</Text>
          <Text style={[styles.subtitleText, { 
            color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-700']
          }]}>
            {t('theBestMarketplaceFor')}
            {'\n'}
            {t('exoticPets')}
          </Text>
        </View>
      </View>

      <View style={styles.middleSection}>
        <View style={styles.toggleRow}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            onPress={() => setSelectedTab('email')}
            style={[styles.toggleButton, selectedTab === 'email' && styles.toggleActive]}>
              <Text style={[selectedTab === 'email' ? styles.toggleTextActive : styles.toggleTextInactive, { 
                color: selectedTab === 'email' ? theme['color-basic-100'] : theme['color-shadcn-primary']
              }]}>{t('email')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedTab('phone')}
            style={[styles.toggleButton, selectedTab === 'phone' && styles.toggleActive]}>
              <Text style={[selectedTab === 'phone' ? styles.toggleTextActive : styles.toggleTextInactive, { 
                color: selectedTab === 'phone' ? theme['color-basic-100'] : theme['color-shadcn-primary']
              }]}>{t('phone')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.userTypeButton, { 
              backgroundColor: isDark ? theme['color-shadcn-secondary'] : 'rgba(39, 174, 96, 0.1)',
              borderColor: theme['color-shadcn-primary']
            }]}
            onPress={() => setUserTypeModalVisible(true)}
          >
            <View style={styles.userTypeButtonContent}>
              <Icon
                name={isSeller ? "shopping-bag" : "person"}
                fill={theme['color-shadcn-primary']}
                style={{ width: 16, height: 16, marginRight: 8 }}
              />
              <Text style={[styles.userTypeButtonText, { 
                color: theme['color-shadcn-primary']
              }]}>
                {isSeller ? t('seller') : t('buyer')}
              </Text>
            </View>
            <Icon
              name="chevron-down"
              fill={theme['color-shadcn-primary']}
              style={{ width: 16, height: 16 }}
            />
          </TouchableOpacity>
        </View>

        <Modal
          visible={userTypeModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setUserTypeModalVisible(false)}
        >
          <TouchableOpacity
            style={[styles.modalOverlay, { 
              backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)'
            }]}
            activeOpacity={1}
            onPressOut={() => setUserTypeModalVisible(false)}
          >
            <View style={[styles.userTypeModal, { 
              backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
            }]}>
              <TouchableOpacity
                style={[
                  styles.userTypeOption,
                  isSeller && styles.userTypeOptionSelected
                ]}
                onPress={() => {
                  setIsSeller(true);
                  setUserTypeModalVisible(false);
                }}
              >
                <Icon
                  name="shopping-bag"
                  fill={isSeller ? theme['color-basic-100'] : theme['color-shadcn-primary']}
                  style={{ width: 16, height: 16, marginRight: 8 }}
                />
                <Text style={[
                  styles.userTypeOptionText,
                  { color: isSeller ? theme['color-basic-100'] : theme['color-shadcn-primary'] }
                ]}>
                  {t('seller')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.userTypeOption,
                  !isSeller && styles.userTypeOptionSelected
                ]}
                onPress={() => {
                  setIsSeller(false);
                  setUserTypeModalVisible(false);
                }}
              >
                <Icon
                  name="person"
                  fill={!isSeller ? theme['color-basic-100'] : theme['color-shadcn-primary']}
                  style={{ width: 16, height: 16, marginRight: 8 }}
                />
                <Text style={[
                  styles.userTypeOptionText,
                  { color: !isSeller ? theme['color-basic-100'] : theme['color-shadcn-primary'] }
                ]}>
                  {t('buyer')}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <Formik
          initialValues={{
            email: route.params?.email || '',
            password: route.params?.password || '',
            phone: '',
          }}
          enableReinitialize={true}
          onSubmit={submitForm}
          validationSchema={createLoginSchema(t)}

        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isSubmitting,
          }) => (
            <Layout>
              {selectedTab === 'email' ? (
                <Input
                  placeholder={t('email')}
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  style={[styles.input, { 
                    backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
                    borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
                  }]}
                  textStyle={[styles.textStyle, { 
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                  }]}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  caption={touched.email && errors.email ? errors.email : ''}
                  status={errors.email && touched.email ? 'danger' : 'basic'}
                  accessoryLeft={<Icon name="email" fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']} style={{ width: 20, height: 20 }} />}
                />
              ) : (
                <Input
                  placeholder={t('phone')}
                  keyboardType="phone-pad"
                  value={values.phone}
                  onChangeText={handleChange('phone')}
                  textContentType="telephoneNumber"
                  textStyle={[styles.textStyle, { 
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                  }]}
                  style={[styles.input, { 
                    backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
                    borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
                  }]}
                  onBlur={handleBlur('phone')}
                  caption={touched.phone && errors.phone ? errors.phone : ''}
                  status={errors.phone && touched.phone ? 'danger' : 'basic'}
                  accessoryLeft={<Icon name="phone" fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']} style={{ width: 20, height: 20 }} />}
                  // Note: phone login is not supported by the seller endpoint, but UI is kept for consistency
                />
              )}

              {/*
                Add show/hide password feature.
                We'll use a local state for showPassword.
              */}
              {(() => {
                const [showPassword, setShowPassword] = React.useState(false);
                return (
                  <Input
                    placeholder={t('password')}
                    label={evaProps => (
                      <Text {...evaProps} style={[styles.label, { 
                        color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                      }]}>
                        {t('password')}
                      </Text>
                    )}
                    textStyle={[styles.textStyle, { 
                      color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                    }]}
                    secureTextEntry={!showPassword}
                    style={[styles.input, { 
                      backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
                      borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
                    }]}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                    caption={
                      touched.password && <InputError errorText={errors.password} />
                    }
                    status={errors.password && touched.password ? 'danger' : 'basic'}
                    accessoryLeft={<Icon name="lock" fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']} style={{ width: 20, height: 20 }} />}
                    accessoryRight={props => (
                      <Icon
                        {...props}
                        name={showPassword ? "eye-off" : "eye"}
                        fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']}
                        style={{ width: 26, height: 26, marginRight: 5 }}
                        onPress={() => setShowPassword(v => !v)}
                      />
                    )}
                  />
                );
              })()}

              <View style={styles.forgotRememberContainer}>
                <View style={styles.rememberMeContainer}>
                  <CheckBox
                    style={styles.remembercheckBox}
                    checked={rememberMe}
                    onChange={setRememberMe}
                  />
                  <Text style={[styles.rememberMeText, { 
                    color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                  }]}>{t('rememberMe')}</Text>
                </View>
                <Text
                  category="p2"
                  status="primary"
                  style={[styles.forgotPasswordLinkText, { 
                    color: theme['color-shadcn-primary']
                  }]}
                  onPress={() => navigateToPage(isSeller ? 'SellerForgotPassword' : 'ForgotPassword')}>
                  {t('forgotpassword')}
                </Text>
              </View>
              <SubmitButton
                btnText={t('signin')}
                disabled={isBtnDisabled || isSubmitting}
                onPress={handleSubmit}
              />
              <Text style={[styles.noAccountText, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}> {t('noAccountSignUpNow')}</Text>
            </Layout>
          )}
        </Formik>

        <TextButton
          iconName={"person"}
          title={t('signup')}
          style={[styles.signupButton, { 
            borderColor: theme['color-shadcn-primary']
          }]}
          onPress={() => navigateToPage('Register')}
        />
      </View>
    </AuthContainer>
  );
};

const styles = StyleSheet.create({
  topSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    width: width * 0.25,
    height: width * 0.25,
  },
  textContainer: {
    alignItems: 'center',
  },
  titleText: {
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitleText: {
    fontWeight: '400',
    fontSize: 13,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  middleSection: {
    marginTop: 20,
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 8,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.7,
    marginRight: 10,
  },
  toggleActive: {
    backgroundColor: '#27AE60',
  },
  toggleTextActive: {
    fontWeight: '600',
    fontSize: 11,
  },
  toggleTextInactive: {
    fontWeight: '600',
    fontSize: 11,
  },
  input: {
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 7,
  },
  forgotRememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remembercheckBox: {
    fontSize: 5,
  },
  rememberMeText: {
    marginLeft: 5,
  },
  forgotPasswordLinkText: {
    fontWeight: '600',
  },
  noAccountText: {
    fontWeight: '600',
    marginVertical: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  signupButton: {
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 9,
    marginTop: 16,
    alignSelf: 'center',
  },
  userTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    minWidth: 120,
  },
  userTypeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userTypeModal: {
    borderRadius: 12,
    width: 200,
    paddingVertical: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  userTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userTypeOptionSelected: {
    backgroundColor: '#27AE60',
  },
  userTypeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  userTypeOptionTextSelected: {
    color: '#fff',
  },
});
