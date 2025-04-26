import React, { useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Layout, Text, Input, Radio, RadioGroup } from '@ui-kitten/components';
import { Formik } from 'formik';
import { InputError, SubmitButton, ImagePicker } from '../../components/form';
import { AuthContainer } from '../../components/auth/AuthContainer';
import { flexeStyles } from '../../utils/globalStyles';
import { Select, SelectItem, IndexPath } from '@ui-kitten/components';
import TextButton from '../../components/form/TextButton';
import i18next from 'i18next';

export const RegisterScreen = ({ navigation }) => {
  // Use translation keys for states and cities
  const stateKeys = [
    'Punjab', 'Sindh', 'KPK', 'Balochistan', 'GilgitBaltistan', 'AzadKashmir'
  ];

  // For translation, use keys for states and cities, and display t(key) in UI
  const citiesByState = {
    Punjab: ['Lahore', 'Rawalpindi', 'Faisalabad', 'Multan', 'Sialkot', 'Bahawalpur'],
    Sindh: ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana'],
    KPK: ['Peshawar', 'Abbottabad', 'Mardan', 'Swat'],
    Balochistan: ['Quetta', 'Gwadar', 'Turbat', 'Khuzdar'],
    GilgitBaltistan: ['Gilgit', 'Skardu', 'Hunza'],
    AzadKashmir: ['Muzaffarabad', 'Mirpur', 'Bagh'],
    Islamabad: ['Islamabad']
  };

  const { t } = useTranslation();
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
    <AuthContainer>
      <Image source={require('../../../assets/latest/petbooker_icon.png')} style={styles.topLeftLogo} />

      <Text style={styles.title}>{t('createaccount')}</Text>
      <Text style={styles.subtitle}>{t('fillUpTheFormToCreateAnAccount')}</Text>

      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          state: '',
          city: '',
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
              label={(evaProps) => (
                <Text {...evaProps} style={styles.label}>
                  {t('firstname')}
                </Text>
              )}
              placeholderTextColor={styles.placeholderTextColor}
              placeholder="John"
              style={styles.input}
              textStyle={styles.textStyle}
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
              label={(evaProps) => (
                <Text {...evaProps} style={styles.label}>
                  {t('lastname')}
                </Text>
              )}
              placeholderTextColor={styles.placeholderTextColor}
              placeholder="Doe"
              style={styles.input}
              textStyle={styles.textStyle}
              onChangeText={handleChange('lastName')}
              onBlur={handleBlur('lastName')}
              value={values.lastName}
              caption={
                touched.lastName && <InputError errorText={errors.lastName} />
              }
              status={errors.lastName && touched.lastName ? 'danger' : 'basic'}
            />
            <Input
              label={(evaProps) => (
                <Text {...evaProps} style={styles.label}>
                  {t('email')}
                </Text>
              )}
              placeholderTextColor={styles.placeholderTextColor}
              placeholder="abc@gmail.com"
              textContentType="emailAddress"
              keyboardType="email-address"
              style={styles.input}
              textStyle={styles.textStyle}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              caption={touched.email && <InputError errorText={errors.email} />}
              status={errors.email && touched.email ? 'danger' : 'basic'}
            />
            <Input
              label={(evaProps) => (
                <Text {...evaProps} style={styles.label}>
                  {t('phone')}
                  <Text style={{ color: 'red', fontSize: 12 }}> {t('countryCodeNote')}</Text>
                </Text>
              )}
              placeholderTextColor={styles.placeholderTextColor}
              placeholder="07060000000"
              style={styles.input}
              textStyle={styles.textStyle}
              onChangeText={handleChange('phone')}
              onBlur={handleBlur('phone')}
              value={values.phone}
              caption={touched.phone && <InputError errorText={errors.phone} />}
              status={errors.phone && touched.phone ? 'danger' : 'basic'}
            />

            {/* State Dropdown Select */}
            <Select
              placeholder={t('selectOption')}
              placeholderTextColor={styles.placeholderTextColor}
              textStyle={styles.textStyle}
              style={styles.select}
              selectedIndex={
                values.state
                  ? new IndexPath(stateKeys.findIndex(key => key === values.state))
                  : null
              }
              label={(evaProps) => (
                <Text {...evaProps} style={styles.label}>
                  {t('state')}
                </Text>
              )}
              value={values.state ? t(values.state) : ''}
              onSelect={(index) => {
                const selectedStateKey = stateKeys[index.row];
                handleChange('state')(selectedStateKey);
                handleChange('city')(''); // Reset city when state changes
              }}
            >
              {stateKeys.map((stateKey, i) => (
                <SelectItem
                  title={t(stateKey)}
                  key={i}
                  placeholderTextColor={styles.placeholderTextColor}
                  textStyle={styles.selectItem}
                />
              ))}
            </Select>
            {touched.state && <InputError errorText={errors.state} />}

            {/* City Dropdown Select */}
            <Select
              disabled={!values.state}
              placeholder={t('selectOption')}
              placeholderTextColor={styles.placeholderTextColor}
              textStyle={styles.textStyle}
              style={styles.select}
              label={(evaProps) => (
                <Text {...evaProps} style={styles.label}>
                  {t('city')}
                </Text>
              )}
              value={values.city ? t(values.city) : ''}
              selectedIndex={
                values.city && values.state
                  ? new IndexPath(
                      (citiesByState[values.state] || []).findIndex(cityKey => cityKey === values.city)
                    )
                  : null
              }
              onSelect={(index) => {
                const selectedCityKey = citiesByState[values.state][index.row];
                handleChange('city')(selectedCityKey);
              }}
            >
              {(citiesByState[values.state] || []).map((cityKey, i) => (
                <SelectItem
                  title={t(cityKey)}
                  key={i}
                  placeholderTextColor={styles.placeholderTextColor}
                  textStyle={styles.selectItem}
                />
              ))}
            </Select>
            {touched.city && <InputError errorText={errors.city} />}

            <Input
              label={(evaProps) => (
                <Text {...evaProps} style={styles.label}>
                  {t('password')}
                </Text>
              )}
              secureTextEntry={true}
              placeholderTextColor={styles.placeholderTextColor}
              style={styles.input}
              textStyle={styles.textStyle}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              caption={
                touched.password && <InputError errorText={errors.password} />
              }
              status={errors.password && touched.password ? 'danger' : 'basic'}
            />
            <Input
              label={(evaProps) => (
                <Text {...evaProps} style={styles.label}>
                  {t('confirmpassword')}
                </Text>
              )}
              secureTextEntry={true}
              placeholderTextColor={styles.placeholderTextColor}
              style={styles.input}
              textStyle={styles.textStyle}
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
            <View style={styles.buttonContainer}>
              <SubmitButton
                btnText={t('signup')}
                disabled={isBtnDisable}
                onPress={handleSubmit}
              />
              <TextButton
                iconName={"arrow-right"}
                title={t('alreadyHaveAnAccount')}
                style={styles.alreadyHaveAnAccount}
                onPress={() => navigateToPage('Login')}
              />
            </View>
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
    marginVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    borderColor: 'rgb(170, 170, 170)',
    borderWidth: 1,
  },
  selectItem: {
    color: 'black',
    backgroundColor: 'rgba(41, 255, 3, 0) !important',
    borderColor: 'rgba(24, 29, 180, 0)',
    borderWidth: 1,
  },
  select: {
    marginVertical: 10,
    backgroundColor: 'rgba(130, 130, 130, 0) !important',
    borderColor: 'rgba(24, 29, 180, 0)',
    borderWidth: 1,
  },  
  textStyle: { fontSize: 14, paddingVertical: 4 },
  label: {
    color: 'black',
    fontSize: 16,
  },
  externalLink: {
    marginLeft: 5,
  },
  placeholderTextColor: 'rgb(136, 136, 136)',
  alreadyHaveAnAccount: {
    borderColor: '#27AE60',
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 9,
    marginTop: 16,
    alignSelf: i18next.isRTL ? 'flex-end' : 'flex-start',
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: i18next.isRTL ? 'flex-end' : 'flex-start',
  },
  topLeftLogo: {
    width: 40,
    height: 40,
    position: 'absolute',
    top: 5,
    left: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: { 
    fontSize: 16,
    textAlign: 'center',
  },
});
