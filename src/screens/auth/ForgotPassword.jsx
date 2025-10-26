import React, {useState} from 'react';
import {StyleSheet, Modal, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {
  Layout,
  Text,
  Input,
  RadioGroup,
  Radio,
  Icon,
} from '@ui-kitten/components';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {InputError, SubmitButton} from '../../components/form';
import {AuthContainer} from '../../components/auth/AuthContainer';
import {flexeStyles} from '../../utils/globalStyles';
import {axiosBuyerClient} from '../../utils/axiosClient';
import Toast from 'react-native-toast-message';

const createForgotPasswordSchema = t =>
  Yup.object().shape({
    identity: Yup.string()
      .required(t('validation.emailOrPhoneRequired'))
      .test(
        'valid-identity',
        t('validation.validEmailOrPhone'),
        function (value) {
          if (!value) return false;

          // Check if it's a valid email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailRegex.test(value)) return true;

          // Check if it's a valid phone (Pakistani format)
          const phoneRegex = /^(\+92|0)?[0-9]{10,11}$/;
          if (phoneRegex.test(value.replace(/\s+/g, ''))) return true;

          return false;
        },
      ),
  });

export const ForgotPasswordScreen = ({navigation}) => {
  const {t} = useTranslation();
  const [isBtnDisable, setIsBtnDisable] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState(0); // 0 for email, 1 for phone
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const navigateToPage = pageName => {
    navigation.navigate(pageName);
  };

  const submitForm = async values => {
    try {
      setIsBtnDisable(true);

      const formData = new FormData();
      formData.append('identity', values.identity.trim());

      const response = await axiosBuyerClient.post(
        'auth/forgot-password',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.data) {
        // Show success dialog instead of navigating to VerifyOTP
        setShowSuccessDialog(true);
      }
    } catch (error) {
      console.error('Forgot password error:', error);

      let errorMessage = t('registration.somethingWentWrong');
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors[0].message || errorMessage;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Toast.show({
        type: 'error',
        text1: t('registration.resetFailed'),
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
        validationSchema={createForgotPasswordSchema(t)}
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
              caption={
                touched.identity && <InputError errorText={errors.identity} />
              }
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

      {/* Success Dialog */}
      <Modal
        visible={showSuccessDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessDialog(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowSuccessDialog(false)}>
          <View style={styles.dialogContainer}>
            <View style={styles.dialogContent}>
              <Icon
                name="checkmark-circle"
                fill="#27AE60"
                style={{width: 64, height: 64, marginBottom: 20}}
              />
              <Text style={styles.dialogTitle}>
                {t('registration.resetRequestSent')}
              </Text>
              <Text style={styles.dialogMessage}>
                {t('auth.emailSentMessage')}
              </Text>
              <TouchableOpacity
                style={styles.dialogButton}
                onPress={() => {
                  setShowSuccessDialog(false);
                  navigateToPage('Login');
                }}>
                <Text style={styles.dialogButtonText}>
                  {t('registration.okay')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    borderRadius: 16,
    backgroundColor: '#fff',
    width: 320,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dialogContent: {
    alignItems: 'center',
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#27AE60',
  },
  dialogMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 22,
  },
  dialogButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 120,
  },
  dialogButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff',
  },
});
