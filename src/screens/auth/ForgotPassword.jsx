import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Layout, Text, Input, RadioGroup, Radio} from '@ui-kitten/components';
import {Formik} from 'formik';
import {InputError, SubmitButton} from '../../components/form';
import {AuthContainer} from '../../components/auth/AuthContainer';
import {flexeStyles} from '../../utils/globalStyles';

export const ForgotPasswordScreen = ({navigation}) => {
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
    <AuthContainer title="forgotpassword" subTitle="forgotpasswordubtitle">
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
            <SubmitButton
              btnText={t('submit')}
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
  externalLink: {
    marginLeft: 5,
  },
});
