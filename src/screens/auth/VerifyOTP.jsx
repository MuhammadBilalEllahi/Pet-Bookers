import React, {useState, useRef, useEffect} from 'react';
import {StyleSheet, View, TextInput} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Layout, Text, Button} from '@ui-kitten/components';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {InputError, SubmitButton} from '../../components/form';
import {AuthContainer} from '../../components/auth/AuthContainer';
import {flexeStyles, spacingStyles} from '../../utils/globalStyles';
import {axiosBuyerClient} from '../../utils/axiosClient';
import Toast from 'react-native-toast-message';
import {useRoute} from '@react-navigation/native';

const createOTPSchema = (t) => Yup.object().shape({
  otp: Yup.string()
    .required(t('validation.otpRequired'))
    .length(4, t('validation.otpLength'))
    .matches(/^[0-9]+$/, t('validation.otpNumeric')),
});

export const VerifyOTPScreen = ({navigation}) => {
  const {t} = useTranslation();
  const route = useRoute();
  const {identity, verificationMethod} = route.params || {};

  const [isBtnDisable, setIsBtnDisable] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const otpRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOTPChange = (text, index, setFieldValue, values) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '');
    
    // Update the current field
    const newOTP = values.otp.split('');
    newOTP[index] = numericText;
    setFieldValue('otp', newOTP.join(''));

    // Move to next field if number entered
    if (numericText && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Move to previous field on backspace
    if (e.nativeEvent.key === 'Backspace' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const submitForm = async values => {
    try {
      setIsBtnDisable(true);
      
      const formData = new FormData();
      formData.append('identity', identity);
      formData.append('otp', values.otp);
      
      const response = await axiosBuyerClient.post('auth/verify-otp', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        Toast.show({
          type: 'success',
          text1: t('otp.otpVerified'),
          text2: response.data.message || t('otp.otpVerifiedSuccess'),
          position: 'top',
        });

        // Navigate to reset password screen
        navigation.navigate('ResetPassword', {
          identity,
          otp: values.otp,
        });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      
      let errorMessage = t('otp.invalidOTP');
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors[0].message || errorMessage;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Toast.show({
        type: 'error',
        text1: t('otp.verificationFailed'),
        text2: errorMessage,
        position: 'top',
      });
    } finally {
      setIsBtnDisable(false);
    }
  };

  const resendOTP = async () => {
    try {
      setIsResending(true);
      
      const formData = new FormData();
      formData.append('identity', identity);
      
      const response = await axiosBuyerClient.post('auth/forgot-password', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        Toast.show({
          type: 'success',
          text1: t('otp.otpResent'),
          text2: t('otp.newOTPSent'),
          position: 'top',
        });

        setCountdown(60);
        setCanResend(false);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      Toast.show({
        type: 'error',
        text1: t('otp.resendFailed'),
        text2: t('otp.failedToResend'),
        position: 'top',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthContainer title="verifyOTP" subTitle="enterOTPSentTo">
      <Formik
        initialValues={{
          otp: '',
        }}
        validationSchema={createOTPSchema(t)}
        onSubmit={submitForm}>
        {({
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
        }) => (
          <Layout style={styles.inputContainer}>
            <Text category="p2" style={styles.description}>
              {t('otp.verificationCodeSentTo')} {verificationMethod === 'email' ? t('email') : t('phone')}
            </Text>
            <Text category="h6" style={styles.identityText}>
              {identity}
            </Text>
            
            <View style={styles.otpContainer}>
              {[0, 1, 2, 3].map((index) => (
                <TextInput
                  key={index}
                  ref={ref => otpRefs.current[index] = ref}
                  style={[
                    styles.otpInput,
                    (errors.otp && touched.otp) && styles.otpInputError
                  ]}
                  maxLength={1}
                  keyboardType="numeric"
                  textAlign="center"
                  value={values.otp[index] || ''}
                  onChangeText={(text) => handleOTPChange(text, index, setFieldValue, values)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                />
              ))}
            </View>

            {touched.otp && <InputError errorText={errors.otp} />}

            <View style={styles.resendContainer}>
              {canResend ? (
                <Button
                  appearance="ghost"
                  status="primary"
                  disabled={isResending}
                  onPress={resendOTP}>
                  {isResending ? t('otp.resending') : t('otp.resendOTP')}
                </Button>
              ) : (
                <Text category="p2" style={styles.countdownText}>
                  {t('otp.resendOTPIn')} {countdown}s
                </Text>
              )}
            </View>
            
            <SubmitButton
              btnText={t('otp.verifyAndContinue')}
              disabled={isBtnDisable || values.otp.length !== 4}
              onPress={handleSubmit}
            />
          </Layout>
        )}
      </Formik>
      
      <Layout style={[flexeStyles.row, flexeStyles.contentBetween]}>
        <Text category="p1">{t('otp.backToForgotPassword')}</Text>
        <Text
          category="p1"
          status="primary"
          style={styles.externalLink}
          onPress={() => navigation.goBack()}>
          {t('product.back')}
        </Text>
      </Layout>
    </AuthContainer>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'column',
    paddingVertical: 16,
  },
  description: {
    marginBottom: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
  identityText: {
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#E4E9F2',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: '600',
    backgroundColor: '#FFFFFF',
  },
  otpInputError: {
    borderColor: '#FF3D71',
  },
  resendContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  countdownText: {
    opacity: 0.6,
  },
  externalLink: {
    marginLeft: 5,
  },
}); 