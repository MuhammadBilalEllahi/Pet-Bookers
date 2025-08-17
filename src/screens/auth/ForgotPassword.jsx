import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Layout, Text, Input, RadioGroup, Radio} from '@ui-kitten/components';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {InputError, SubmitButton} from '../../components/form';
import {AuthContainer} from '../../components/auth/AuthContainer';
import {flexeStyles} from '../../utils/globalStyles';
import {axiosBuyerClient} from '../../utils/axiosClient';
import Toast from 'react-native-toast-message';

const ForgotPasswordSchema = Yup.object().shape({
  identity: Yup.string()
    .required('Email or phone is required')
    .test('valid-identity', 'Enter a valid email or phone number', function(value) {
      if (!value) return false;
      
      // Check if it's a valid email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(value)) return true;
      
      // Check if it's a valid phone (Pakistani format)
      const phoneRegex = /^(\+92|0)?[0-9]{10,11}$/;
      if (phoneRegex.test(value.replace(/\s+/g, ''))) return true;
      
      return false;
    })
});

export const ForgotPasswordScreen = ({navigation}) => {
  const {t} = useTranslation();
  const [isBtnDisable, setIsBtnDisable] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState(0); // 0 for email, 1 for phone

  const navigateToPage = pageName => {
    navigation.navigate(pageName);
  };

  const submitForm = async values => {
    try {
      setIsBtnDisable(true);
      
      const formData = new FormData();
      formData.append('identity', values.identity.trim());
      
      const response = await axiosBuyerClient.post('auth/forgot-password', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        Toast.show({
          type: 'success',
          text1: 'Reset request sent',
          text2: response.data.message || 'Please check your email/phone for reset instructions',
          position: 'top',
        });

        // Navigate to OTP verification screen
        navigation.navigate('VerifyOTP', {
          identity: values.identity.trim(),
          verificationMethod: verificationMethod === 0 ? 'email' : 'phone'
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      
      let errorMessage = 'Something went wrong';
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors[0].message || errorMessage;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Toast.show({
        type: 'error',
        text1: 'Reset failed',
        text2: errorMessage,
        position: 'top',
      });
    } finally {
      setIsBtnDisable(false);
    }
  };

  return (
    <AuthContainer title="forgotpassword" subTitle="forgotpasswordubtitle">
      <Formik
        initialValues={{
          identity: '',
        }}
        validationSchema={ForgotPasswordSchema}
        onSubmit={submitForm}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <Layout style={styles.inputContainer}>
            <Text category="p2" style={styles.description}>
              {t('auth.enterEmailOrPhoneToReset')}
            </Text>
            
            <Input
              label={t('auth.emailOrPhone')}
              placeholder="abc@gmail.com or 03001234567"
              textContentType="emailAddress"
              keyboardType="default"
              style={styles.input}
              onChangeText={handleChange('identity')}
              onBlur={handleBlur('identity')}
              value={values.identity}
              caption={touched.identity && <InputError errorText={errors.identity} />}
              status={errors.identity && touched.identity ? 'danger' : 'basic'}
            />
            
            <Text category="p2" style={styles.methodLabel}>
              {t('auth.preferredVerificationMethod')}
            </Text>
            <RadioGroup
              selectedIndex={verificationMethod}
              onChange={setVerificationMethod}
              style={[
                flexeStyles.row,
                {
                  marginVertical: 10,
                  flexWrap: 'wrap',
                },
              ]}>
              <Radio>{t('auth.email')}</Radio>
              <Radio>{t('auth.phone')}</Radio>
            </RadioGroup>
            
            <SubmitButton
              btnText={t('auth.sendResetCode')}
              disabled={isBtnDisable}
              onPress={handleSubmit}
            />
          </Layout>
        )}
      </Formik>
      <Layout style={[flexeStyles.row, flexeStyles.contentBetween]}>
        <Text category="p1">{t('backtologin')}</Text>
        <Text
          category="p1"
          status="primary"
          style={styles.externalLink}
          onPress={() => navigateToPage('Login')}>
          {t('signin')}
        </Text>
      </Layout>
    </AuthContainer>
  );
};

const styles = StyleSheet.create({
  subTitle: {
    marginVertical: 8,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'column',
    paddingVertical: 16,
  },
  input: {
    marginVertical: 8,
  },
  description: {
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  methodLabel: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  externalLink: {
    marginLeft: 5,
  },
});
