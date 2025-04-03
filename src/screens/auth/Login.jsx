import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import {Layout, Text, Input, RadioGroup, Radio} from '@ui-kitten/components';
import {Formik} from 'formik';
import {InputError, SubmitButton} from '../../components/form';
import {AuthContainer} from '../../components/auth/AuthContainer';
import {flexeStyles} from '../../utils/globalStyles';

export const LoginScreen = ({navigation}) => {
  const {t} = useTranslation();

  const [isBtnDisable, setIsBtnDisable] = useState(false);

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
    <AuthContainer title="welcome">
      <Formik
        initialValues={{
          email: '',
          password: '',
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
          <Layout style={styles.inputContainer}>
            <Input
              label={t('email')}
              placeholder="abc@gmail.com"
              textContentType="emailAddress"
              keyboardType="email-address"
              style={styles.input}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              caption={touched.email && <InputError errorText={errors.email} />}
              status={errors.email && touched.email ? 'danger' : 'basic'}
            />
            <Input
              label={t('password')}
              placeholder="Password"
              secureTextEntry={true}
              style={styles.input}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              caption={
                touched.password && <InputError errorText={errors.password} />
              }
              status={errors.password && touched.password ? 'danger' : 'basic'}
            />
            <RadioGroup
              selectedIndex={0}
              style={[
                flexeStyles.row,
                {
                  marginVertical: 10,
                  flexWrap: 'wrap',
                },
              ]}>
              <Radio>{t('seller')}</Radio>
              <Radio>{t('buyer')}</Radio>
            </RadioGroup>
            <Text
              category="p2"
              status="primary"
              style={styles.forgotLink}
              onPress={() => navigateToPage('ForgotPassword')}>
              {t('forgotpassword')}
            </Text>
            <SubmitButton
              btnText={t('signin')}
              disabled={isBtnDisable}
              onPress={handleSubmit}
            />
          </Layout>
        )}
      </Formik>
      <Layout style={[flexeStyles.row, flexeStyles.contentBetween]}>
        <Text category="p1">{t('notmember')}</Text>
        <Text
          category="p1"
          status="primary"
          style={styles.externalLink}
          onPress={() => navigateToPage('Register')}>
          {t('signup')}
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
  externalLink: {
    marginLeft: 5,
  },
});
