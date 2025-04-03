import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Layout, Text, Input, Radio, RadioGroup} from '@ui-kitten/components';
import {Formik} from 'formik';
import {InputError, SubmitButton, ImagePicker} from '../../components/form';
import {AuthContainer} from '../../components/auth/AuthContainer';
import {flexeStyles} from '../../utils/globalStyles';

export const RegisterScreen = ({navigation}) => {
  const {t} = useTranslation();
  const [isBtnDisable, setIsBtnDisable] = useState(false);

  const navigateToPage = pageName => {
    navigation.navigate(pageName);
  };

  const submitForm = async values => {
    try {
      setIsBtnDisable(true);
    } catch (error) {
      console.log('SUBMISSION ERR:::', error);
      setIsBtnDisable(false);
    }
  };

  return (
    <AuthContainer title="createaccount" subTitle="createaccountsubtitle">
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
              label={t('firstname')}
              placeholder="John"
              style={styles.input}
              onChangeText={handleChange('firstName')}
              onBlur={handleBlur('firstName')}
              value={values.firstName}
              caption={
                touched.firstName && <InputError errorText={errors.firstName} />
              }
              status={
                errors.firstName && touched.firstName ? 'danger' : 'basic'
              }
            />
            <Input
              label={t('lastname')}
              placeholder="Doe"
              style={styles.input}
              onChangeText={handleChange('lastName')}
              onBlur={handleBlur('lastName')}
              value={values.lastName}
              caption={
                touched.lastName && <InputError errorText={errors.lastName} />
              }
              status={errors.lastName && touched.lastName ? 'danger' : 'basic'}
            />
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
            <Input
              label={t('confirmpassword')}
              secureTextEntry={true}
              style={styles.input}
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              value={values.confirmPassword}
              caption={
                touched.confirmPassword && (
                  <InputError errorText={errors.confirmPassword} />
                )
              }
              status={
                errors.confirmPassword && touched.confirmPassword
                  ? 'danger'
                  : 'basic'
              }
            />
            <RadioGroup
              selectedIndex={0}
              style={[
                flexeStyles.row,
                {
                  marginTop: 10,
                  flexWrap: 'wrap',
                },
              ]}>
              <Radio>{t('seller')}</Radio>
              <Radio>{t('buyer')}</Radio>
            </RadioGroup>
            <ImagePicker title={t('uploadProfileLabel')} />
            <Input
              label={t('shopName')}
              style={styles.input}
              onChangeText={handleChange('shopName')}
              onBlur={handleBlur('shopName')}
              value={values.shopName}
              caption={
                touched.shopName && <InputError errorText={errors.shopName} />
              }
              status={errors.shopName && touched.shopName ? 'danger' : 'basic'}
            />
            <Input
              label={t('shopAddress')}
              style={styles.input}
              onChangeText={handleChange('shopAddress')}
              onBlur={handleBlur('shopAddress')}
              value={values.shopAddress}
              caption={
                touched.shopAddress && (
                  <InputError errorText={errors.shopAddress} />
                )
              }
              status={
                errors.shopAddress && touched.shopAddress ? 'danger' : 'basic'
              }
            />
            <ImagePicker title={t('uploadShopLogoLabel')} />
            <ImagePicker title={t('uploadShopCoverLabel')} />
            <SubmitButton
              btnText={t('signup')}
              disabled={isBtnDisable}
              onPress={handleSubmit}
            />
          </Layout>
        )}
      </Formik>
      <Layout style={[flexeStyles.row, flexeStyles.contentBetween]}>
        <Text category="c1">{t('alreadymember')}</Text>
        <Text
          category="p2"
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
