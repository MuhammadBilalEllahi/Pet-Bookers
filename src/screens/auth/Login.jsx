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
import { setAuthToken, setUserType, UserType } from '../../store/user';
import { getAuthToken } from '../../utils/localstorage';
import { useDispatch } from 'react-redux';
import { AppScreens } from '../../navigators/AppNavigator';
import { useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
// import axios from 'axios';

// const SELLER_LOGIN_URL = 'https://petbookers.com.pk/api/v3/seller/auth/login';


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



export const LoginScreen = ({ navigation  }) => {
  const route = useRoute()
  const { isItSeller: initialIsSeller = true, email = '', password = '' } = route.params || {};
  console.debug("THIS IS ", initialIsSeller, email, password)
  const { t } = useTranslation();
  const dispatch = useDispatch();

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
        console.log("IN TOKEN")
        dispatch(setUserType(isSeller ? UserType.SELLER : UserType.BUYER))
        dispatch(setAuthToken(response.data.token))
        navigateToPage( isSeller ?  AppScreens.SELLER_HOME_MAIN: AppScreens.BUYER_HOME_MAIN)
      }

      // const v = await getAuthToken();
      // console.log("MEOW", v)

    } catch (error) {
      // TODO: handle error (e.g., show error message)
      if (error.response) {
        console.error("Login Error Response", error.response.data);
        Toast.show({
        type: 'error',
        text1: error.response.data.errors[0].message,
        text2: 'Login Failed',
        position: 'top',
      });
      } else {
        console.error("Login Error", error);
        Toast.show({
        type: 'error',
        text1: error,
        text2: 'Login Failed',
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
          <Text style={styles.titleText}>{t('yourPetOurSecurity')}</Text>
          <Text style={styles.subtitleText}>
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
              <Text style={selectedTab === 'email' ? styles.toggleTextActive : styles.toggleTextInactive}>{t('email')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedTab('phone')}
              style={[styles.toggleButton, selectedTab === 'phone' && styles.toggleActive]}>
              <Text style={selectedTab === 'phone' ? styles.toggleTextActive : styles.toggleTextInactive}>{t('phone')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.userTypeButton}
            onPress={() => setUserTypeModalVisible(true)}
          >
            <View style={styles.userTypeButtonContent}>
              <Icon
                name={isSeller ? "shopping-bag" : "person"}
                fill="#27AE60"
                style={{ width: 16, height: 16, marginRight: 8 }}
              />
              <Text style={styles.userTypeButtonText}>
                {isSeller ? t('seller') : t('buyer')}
              </Text>
            </View>
            <Icon
              name="chevron-down"
              fill="#27AE60"
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
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setUserTypeModalVisible(false)}
          >
            <View style={styles.userTypeModal}>
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
                  fill={isSeller ? "#fff" : "#27AE60"}
                  style={{ width: 16, height: 16, marginRight: 8 }}
                />
                <Text style={[
                  styles.userTypeOptionText,
                  isSeller && styles.userTypeOptionTextSelected
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
                  fill={!isSeller ? "#fff" : "#27AE60"}
                  style={{ width: 16, height: 16, marginRight: 8 }}
                />
                <Text style={[
                  styles.userTypeOptionText,
                  !isSeller && styles.userTypeOptionTextSelected
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
            validationSchema={LoginSchema}

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
                  style={styles.input}
                  textStyle={{ fontSize: 14, paddingVertical: 4 }}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  caption={touched.email && errors.email? errors.email: ''}
                  status={errors.email && touched.email ? 'danger' : 'basic'}
                  accessoryLeft={<Icon name="email" fill="#8F9BB3" style={{ width: 20, height: 20 }} />}
                />
              ) : (
                <Input
                  placeholder={t('phone')}
                  keyboardType="phone-pad"
                  value={values.phone}
                  onChangeText={handleChange('phone')}
                  textContentType="telephoneNumber"
                  textStyle={{ fontSize: 14, paddingVertical: 4 }}
                  style={styles.input}
                  onBlur={handleBlur('phone')}
                  caption={touched.phone && errors.phone ? errors.phone : ''}
                  status={errors.phone && touched.phone ? 'danger' : 'basic'}
                  accessoryLeft={<Icon name="phone" fill="#8F9BB3" style={{ width: 20, height: 20 }} />}
                  // Note: phone login is not supported by the seller endpoint, but UI is kept for consistency
                  editable={false}
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
                      <Text {...evaProps} style={styles.label}>
                        {t('password')}
                      </Text>
                    )}
                    textStyle={{ fontSize: 14, paddingVertical: 4 }}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                    caption={
                      touched.password && <InputError errorText={errors.password} />
                    }
                    status={errors.password && touched.password ? 'danger' : 'basic'}
                    accessoryLeft={<Icon name="lock" fill="#8F9BB3" style={{ width: 20, height: 20 }} />}
                    accessoryRight={props => (
                      <Icon
                        {...props}
                        name={showPassword ? "eye-off" : "eye"}
                        fill="#8F9BB3"
                        style={{ width: 26, height: 26 , marginRight: 5}}
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
                  <Text style={styles.rememberMeText}>{t('rememberMe')}</Text>
                </View>
                <Text
                  category="p2"
                  status="primary"
                  style={styles.forgotPasswordLinkText}
                  onPress={() => navigateToPage('ForgotPassword')}>
                  {t('forgotpassword')}
                </Text>
              </View>
              <SubmitButton
                btnText={t('signin')}
                disabled={isBtnDisabled || isSubmitting}
                onPress={handleSubmit}
              />
              <Text style={styles.noAccountText}> {t('noAccountSignUpNow')}</Text>
            </Layout>
          )}
        </Formik>

        <TextButton
          iconName={"person"}
          title={t('signup')}
          style={styles.signupButton}
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
    color: '#000',
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitleText: {
    color: '#121212',
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
    borderColor: '#27AE60',
    borderWidth: 0.7,
    marginRight: 10,
  },
  toggleActive: {
    backgroundColor: '#27AE60',
  },
  toggleTextActive: {
    color: 'white',
    fontWeight: '600',
    fontSize: 11,
  },
  toggleTextInactive: {
    color: '#27AE60',
    fontWeight: '600',
    fontSize: 11,
  },
  input: {
    marginVertical: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    borderColor: '#C1C1C1',
    borderWidth: 1,
  },
  label: {
    color: '#121212',
    fontSize: 16,
    marginBottom: 7,
  },
  forgotRememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    // marginVertical: 10,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remembercheckBox: {
    fontSize: 5,
  },
  rememberMeText: {
    color: 'gray',
    marginLeft: 5,
  },
  forgotPasswordLinkText: {
    color: '#121212',
  },
  noAccountText: {
    color: '#121212',
    fontWeight: '600',
    marginVertical: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  languageContainer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    textDecorationLine: 'none',
  },
  languageText: {
    fontWeight: 'bold',
    marginHorizontal: 10,
    textDecorationLine: 'none',
    color: '#121212',
  },
  signupButton: {
    borderColor: '#27AE60',
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 9,
    marginTop: 16,
    alignSelf: 'center',
  },
  signupText: {
    color: '#27AE60',
    fontWeight: '600',
  },
  userTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    borderWidth: 1,
    borderColor: '#27AE60',
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
    color: '#27AE60',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userTypeModal: {
    backgroundColor: '#fff',
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
    color: '#27AE60',
    fontWeight: '500',
  },
  userTypeOptionTextSelected: {
    color: '#fff',
  },
});
