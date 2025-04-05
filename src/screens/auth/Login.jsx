import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import { Layout, Text, Input, RadioGroup, Radio, CheckBox, Icon } from '@ui-kitten/components';
import { Formik } from 'formik';
import { InputError, SubmitButton } from '../../components/form';
import { AuthContainer } from '../../components/auth/AuthContainer';
import { flexeStyles } from '../../utils/globalStyles';
const { width } = Dimensions.get('window');
import { TouchableOpacity } from 'react-native';
import TextButton from '../../components/form/TextButton';

export const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const [isBtnDisable, setIsBtnDisable] = useState(false);
  const [selectedTab, setSelectedTab] = useState('email');

  const navigateToPage = pageName => {
    navigation.navigate(pageName);
  };

  const submitForm = async values => {
    try {
      setIsBtnDisable(true);
    } catch (error) {
      setIsBtnDisable(false);
    }
  };

  return (
    <AuthContainer >

<Image
          source={require('../../../assets/latest/splash_above_icon.png')}
          style={styles.aboveLogo }
          resizeMode="cover"
        />



      <View style={styles.topSection}>

      
        <Image
          source={require('../../../assets/latest/petbooker_icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>Your Pet, Our Security!</Text>
          <Text style={styles.subtitleText}>
            The best marketplace for {'\n'} exotic pets
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
          onSubmit={submitForm}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <Layout >

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


                  textContentType="emailAddress"
                  textStyle={{ fontSize: 14, paddingVertical: 4 }}
                  style={styles.input}

                  onBlur={handleBlur('phone')}

                  caption={touched.phone && <InputError errorText={errors.phone} />}
                  status={errors.phone && touched.phone ? 'danger' : 'basic'}
                  accessoryLeft={<Icon name="phone" fill="#8F9BB3" style={{ width: 20, height: 20 }} />}

                />
              )}




              <Input

                placeholder={t('password')}
                label={(evaProps) => (
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
                  <CheckBox style={styles.remembercheckBox} />
                  <Text style={styles.rememberMeText}>{t('Remember me')}</Text>
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
                disabled={isBtnDisable}
                onPress={handleSubmit}
              />
              <Text style={styles.noAccountText}> {t('No Account? Sign Up Now')}</Text>
            </Layout>
          )}
        </Formik>


        <TextButton
          iconName={"person"}
          title={t('signup')}
          style={styles.signupButton}
          onPress={() => navigateToPage('Register')}>

        </TextButton>


      </View>

      <Image
          source={require('../../../assets/latest/auth_left_icon.png')}
          style={styles.leftBottomLogo }
          resizeMode="cover"
        />

<Image
          source={require('../../../assets/latest/auth_right_icon.png')}
          style={styles.rightBottomLogo }
          resizeMode="cover"
        />

    </AuthContainer>
  );
};

const styles = StyleSheet.create({

  aboveLogo:{
    position: 'absolute',
    top: 0,
    // width: '100%',
    // height: '100%',
  },
  leftBottomLogo:{
    position: 'absolute',
    bottom: -10,
    left: -20,
    
  },
  rightBottomLogo:{
    position: 'absolute',
    bottom: -10,
    right: 0,
  },


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
    flex: 1
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
    marginLeft: 5
  },
  forgotPasswordLinkText: {
    color: '#121212'
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
