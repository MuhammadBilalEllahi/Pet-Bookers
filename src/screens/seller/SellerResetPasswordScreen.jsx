import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Layout, Text, Input, Icon} from '@ui-kitten/components';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {InputError, SubmitButton} from '../../components/form';
import {AuthContainer} from '../../components/auth/AuthContainer';
import {flexeStyles} from '../../utils/globalStyles';
import {axiosSellerClient} from '../../utils/axiosClient';
import Toast from 'react-native-toast-message';
import {useRoute} from '@react-navigation/native';

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirm_password: Yup.string()
    .required('Confirm password is required')
    .oneOf([Yup.ref('password'), null], 'Passwords must match'),
});

export const SellerResetPasswordScreen = ({navigation}) => {
  const {t} = useTranslation();
  const route = useRoute();
  const {identity, otp} = route.params || {};

  const [isBtnDisable, setIsBtnDisable] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const submitForm = async values => {
    try {
      setIsBtnDisable(true);
      
      const formData = new FormData();
      formData.append('identity', identity);
      formData.append('otp', otp);
      formData.append('password', values.password);
      formData.append('confirm_password', values.confirm_password);
      
      const response = await axiosSellerClient.put('auth/reset-password', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        Toast.show({
          type: 'success',
          text1: 'Password Reset Successful',
          text2: response.data.message || 'Your password has been changed successfully',
          position: 'top',
        });

        // Navigate back to login
        navigation.navigate('Login', {
          email: identity.includes('@') ? identity : '',
          password: '',
          isItSeller: true
        });
      }
    } catch (error) {
      console.error('Seller reset password error:', error);
      
      let errorMessage = 'Password reset failed';
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

  const renderPasswordIcon = (isVisible, setVisible) => (props) => (
    <Icon
      {...props}
      name={isVisible ? 'eye-off' : 'eye'}
      onPress={() => setVisible(!isVisible)}
    />
  );

  return (
    <AuthContainer title="resetPassword" subTitle="enterNewPassword">
      <Formik
        initialValues={{
          password: '',
          confirm_password: '',
        }}
        validationSchema={ResetPasswordSchema}
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
              {t('enterNewPasswordFor')} {identity}
            </Text>
            
            <Input
              label={t('newPassword')}
              placeholder={t('enterNewPassword')}
              secureTextEntry={!showPassword}
              style={styles.input}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              caption={touched.password && <InputError errorText={errors.password} />}
              status={errors.password && touched.password ? 'danger' : 'basic'}
              accessoryRight={renderPasswordIcon(showPassword, setShowPassword)}
            />
            
            <Input
              label={t('confirmNewPassword')}
              placeholder={t('confirmNewPassword')}
              secureTextEntry={!showConfirmPassword}
              style={styles.input}
              onChangeText={handleChange('confirm_password')}
              onBlur={handleBlur('confirm_password')}
              value={values.confirm_password}
              caption={touched.confirm_password && <InputError errorText={errors.confirm_password} />}
              status={errors.confirm_password && touched.confirm_password ? 'danger' : 'basic'}
              accessoryRight={renderPasswordIcon(showConfirmPassword, setShowConfirmPassword)}
            />

            <Text category="p2" style={styles.requirements}>
              {t('passwordRequirements')}:
            </Text>
            <Text category="c1" style={styles.requirementsList}>
              • {t('atLeast8Characters')}{'\n'}
              • {t('oneUppercaseLetter')}{'\n'}
              • {t('oneLowercaseLetter')}{'\n'}
              • {t('oneNumber')}
            </Text>
            
            <SubmitButton
              btnText={t('resetPassword')}
              disabled={isBtnDisable}
              onPress={handleSubmit}
            />
          </Layout>
        )}
      </Formik>
      
      <Layout style={[flexeStyles.row, flexeStyles.contentBetween]}>
        <Text category="p1">{t('backToLogin')}</Text>
        <Text
          category="p1"
          status="primary"
          style={styles.externalLink}
          onPress={() => navigation.navigate('Login')}>
          {t('signin')}
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
  input: {
    marginVertical: 8,
  },
  description: {
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  requirements: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  requirementsList: {
    marginBottom: 20,
    opacity: 0.7,
    lineHeight: 18,
  },
  externalLink: {
    marginLeft: 5,
  },
}); 