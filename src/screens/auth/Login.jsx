import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import { Layout, Text, Input, CheckBox, Icon } from '@ui-kitten/components';
import { Formik } from 'formik';
import { InputError, SubmitButton } from '../../components/form';
import { AuthContainer } from '../../components/auth/AuthContainer';
const { width } = Dimensions.get('window');
import { TouchableOpacity } from 'react-native';
import TextButton from '../../components/form/TextButton';
import { axiosBuyerClient, axiosSellerClient, } from '../../utils/axiosClient';
import { setAuthToken, setUserType, UserType } from '../../store/user';
import { getAuthToken } from '../../utils/localstorage';
import { useDispatch } from 'react-redux';
import { AppScreens } from '../../navigators/AppNavigator';
import { useRoute } from '@react-navigation/native';
// import axios from 'axios';

// const SELLER_LOGIN_URL = 'https://petbookers.com.pk/api/v3/seller/auth/login';

export const LoginScreen = ({ navigation  }) => {
  const route = useRoute()
  const { isItSeller= false} = route.params || {};
  console.debug("THIS IS ", isItSeller)
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isBtnDisabled, setIsBtnDisabled] = useState(false);
  const [selectedTab, setSelectedTab] = useState('email');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSeller, setIsSeller] = useState(isItSeller || false);

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
      } else {
        console.error("Login Error", error);
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

        <Formik
          initialValues={{
            email: '',
            password: '',
            phone: '',
          }}
          onSubmit={submitForm}
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
                  caption={touched.email && <InputError errorText={errors.email} />}
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
                  caption={touched.phone && <InputError errorText={errors.phone} />}
                  status={errors.phone && touched.phone ? 'danger' : 'basic'}
                  accessoryLeft={<Icon name="phone" fill="#8F9BB3" style={{ width: 20, height: 20 }} />}
                  // Note: phone login is not supported by the seller endpoint, but UI is kept for consistency
                  editable={false}
                />
              )}

              <Input
                placeholder={t('password')}
                label={evaProps => (
                  <Text {...evaProps} style={styles.label}>
                    {t('password')}
                  </Text>
                )}
                textStyle={{ fontSize: 14, paddingVertical: 4 }}
                secureTextEntry={true}
                style={styles.input}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                caption={
                  touched.password && <InputError errorText={errors.password} />
                }
                status={errors.password && touched.password ? 'danger' : 'basic'}
                accessoryLeft={<Icon name="lock" fill="#8F9BB3" style={{ width: 20, height: 20 }} />}
              />

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
});
