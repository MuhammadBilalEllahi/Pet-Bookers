import React, { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Modal, FlatList, PermissionsAndroid, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Layout, Text, Input, Icon } from '@ui-kitten/components';
import { Formik } from 'formik';
import { InputError, SubmitButton, ImagePicker } from '../../components/form';
import { AuthContainer } from '../../components/auth/AuthContainer';
import { flexeStyles } from '../../utils/globalStyles';
import { Select, SelectItem, IndexPath } from '@ui-kitten/components';
import TextButton from '../../components/form/TextButton';
import i18next from 'i18next';
import { useRoute } from '@react-navigation/native';
import { axiosBuyerClient, axiosSellerClient } from '../../utils/axiosClient';
import { useDispatch } from 'react-redux';
import { setAuthToken, setUserType, UserType } from '../../store/user';
import { AppScreens } from '../../navigators/AppNavigator';
import {launchImageLibrary} from 'react-native-image-picker';
import Toast from 'react-native-toast-message';

import * as Yup from 'yup';

// Shared validation schema
const baseSchema = {
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  countryCode: Yup.string().required('Country code is required'),
  phone: Yup.string().required('Phone number is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  state: Yup.string().required('State is required'),
  city: Yup.string().required('City is required'),
};

// Additional fields for seller
const sellerSchema = {
  image: Yup.object().nullable().required('Profile image is required'),
  shop_name: Yup.string().required('Shop name is required'),
  shop_address: Yup.string().required('Shop address is required'),
  logo: Yup.object().nullable().required('Shop logo is required'),
  banner: Yup.object().nullable().required('Shop banner is required'),
};

// Permission request helper for gallery access
const requestGalleryPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } else if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true; // iOS handles it via Info.plist
};

// Country code options for phone field
const COUNTRY_CODES = [
  { code: '+92', label: '🇵🇰 +92' },
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  // Add more as needed
];

export const RegisterScreen = ({ navigation }) => {
  const route = useRoute();
  const { isItSeller: initialIsSeller = true } = route.params || {};
  const [isItSeller, setIsItSeller] = useState(initialIsSeller);
  const [userTypeModalVisible, setUserTypeModalVisible] = useState(false);

  const validationSchema = Yup.object().shape(
    isItSeller ? { ...baseSchema, ...sellerSchema } : baseSchema
  );

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
  const dispatch= useDispatch();

  // For improved phone UI
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  const navigateToPage = (pageName, params={}) => {
    navigation.navigate(pageName, params);
  };

  // Helper to pick image and set in Formik, with permission check
  const handleImagePick = async (field, setFieldValue) => {
    console.log("IMAGE PICKING", field)
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      // Optionally show a message to the user
      return;
    }
    const result = await launchImageLibrary({mediaType: 'photo'});
    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      // asset.uri, asset.fileName, asset.type
      setFieldValue(field, {
        uri: asset.uri,
        name: asset.fileName || 'image.jpg',
        type: asset.type || 'image/jpeg',
      });
    }
  };

  const submitForm = async values => {
    try {
      setIsBtnDisable(true);
      // Prepare form data for registration
      const formData = new FormData();
      formData.append('f_name', values.firstName.trim());
      formData.append('l_name', values.lastName.trim());
      formData.append('email', values.email.trim());
      formData.append('countryCode', values.countryCode || '+92');
      formData.append('phone', values.phone.trim());
      formData.append('state', values.state);
      formData.append('city', values.city);
      formData.append('password', values.password);
      formData.append('con_password', values.confirmPassword);
      formData.append('remember', 'on');
      // Seller-specific fields
      if (isItSeller) {
        if (values.image && values.image.uri) formData.append('image', { uri: values.image.uri, name: values.image.name, type: values.image.type });
        formData.append('shop_name', values.shop_name);
        formData.append('shop_address', values.shop_address);
        if (values.logo && values.logo.uri) formData.append('logo', { uri: values.logo.uri, name: values.logo.name, type: values.logo.type });
        if (values.banner && values.banner.uri) formData.append('banner', { uri: values.banner.uri, name: values.banner.name, type: values.banner.type });
      }

      const headers = {
        'Content-Type': 'multipart/form-data',
      };
      console.log("DATA", formData)
      let response;
      if (isItSeller) {
        console.log("IN seller")
        response = await axiosSellerClient.post('registration', formData, { headers });
        if (response.status >= 200 && response.status < 300) {
          console.log("IN FORM")
          // const formData = new FormData();
          // formData.append('email', values.email.trim());
          // formData.append('password', values.password);
          // console.log("FORM NEW DATA ->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", formData)
          // try {
          //   const responseToLogin = await axiosSellerClient.post('auth/login', formData, {headers});
          //   console.debug("RESPONSE", responseToLogin)
          //   if(responseToLogin.status >= 200 && responseToLogin.status < 300){
          //     if (response?.data?.token) {
          //       console.log("IN TOKEN")
          //       dispatch(setUserType(UserType.SELLER))
          //       dispatch(setAuthToken(response.data.token))
          //       navigateToPage(AppScreens.SELLER_HOME_MAIN)
          //     }
          //     else{
                // navigateToPage(AppScreens.LOGIN, {isItSeller: true, email: values.email.trim(), password: values.password})
          //     }
          //   }
          // } catch (error) {
          //   console.error("THE ERROR", error)
          // }
        }
      } else {
        console.log("IN buyer")
        response = await axiosBuyerClient.post('auth/register', formData, { headers });
      }
      // TODO: handle registration success (e.g., navigation, token storage, etc.)
      console.debug('Register Success Response->', response);
      console.debug('\nRegister Success Response', response.data);

      if(response.data.token){
        console.log("IN TOKEN")
        dispatch(setUserType(isItSeller ? UserType.SELLER : UserType.BUYER))
        dispatch(setAuthToken(response.data.token))
        navigateToPage( isItSeller ?  AppScreens.SELLER_HOME_MAIN: AppScreens.BUYER_HOME_MAIN)
      
      }else{
        navigateToPage(AppScreens.LOGIN, {isItSeller: isItSeller, email: values.email.trim(), password: values.password})
      }
      // Optionally navigate to login or home after registration
      // navigation.navigate('Login');
    } catch (error) {
      console.error('True Error ', error);
      if (error.response) {
        console.error('Register Error Response', error.response.data.message);
      
  const messages = error.response.data.message;

  if (Array.isArray(messages)) {
    messages.forEach((err, idx) => {
      Toast.show({
        type: 'error',
        text1: err.message || 'Error',
        text2: 'Registration Failed',
        position: 'top',
      });
    });
  } else {
    Toast.show({
      type: 'error',
      text1: 'Something went wrong',
      text2: 'Registration Failed',
      position: 'top',
    });
  }}
      setIsBtnDisable(false);
    } finally {
      setIsBtnDisable(false);
    }
  };

  return (
    <AuthContainer>
      <Image source={require('../../../assets/latest/petbooker_icon.png')} style={styles.topLeftLogo} />

      <Text style={styles.title}>{t('createaccount')}</Text>
      <Text style={styles.subtitle}>{t('fillUpTheFormToCreateAnAccount')}</Text>

      {/* User Type Toggle */}
      <View style={styles.userTypeContainer}>
        <Text style={styles.label}>{t('accountType')}</Text>
        <TouchableOpacity
          style={styles.userTypeButton}
          onPress={() => setUserTypeModalVisible(true)}
        >
          <Text style={styles.userTypeButtonText}>
            {isItSeller ? t('seller') : t('buyer')}
          </Text>
          <Icon
            name="chevron-down"
            fill="#8F9BB3"
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={userTypeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUserTypeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setUserTypeModalVisible(false)}
        >
          <View style={styles.userTypeModal}>
            <TouchableOpacity
              style={[
                styles.userTypeOption,
                isItSeller && styles.userTypeOptionSelected
              ]}
              onPress={() => {
                setIsItSeller(true);
                setUserTypeModalVisible(false);
              }}
            >
              <Text style={[
                styles.userTypeOptionText,
                isItSeller && styles.userTypeOptionTextSelected
              ]}>
                {t('seller')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.userTypeOption,
                !isItSeller && styles.userTypeOptionSelected
              ]}
              onPress={() => {
                setIsItSeller(false);
                setUserTypeModalVisible(false);
              }}
            >
              <Text style={[
                styles.userTypeOptionText,
                !isItSeller && styles.userTypeOptionTextSelected
              ]}>
                {t('buyer')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          countryCode: COUNTRY_CODES[0].code,
          phone: '',
          password: '',
          confirmPassword: '',
          state: '',
          city: '',
          // Seller-specific fields
          image: null,
          shop_name: '',
          shop_address: '',
          logo: null,
          banner: null,
        }}
          validationSchema={validationSchema}

        onSubmit={submitForm}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          values,
          errors,
          touched,
        }) => (
          <Layout style={styles.inputContainer}>
            {/* Seller Personal Image Picker */}
            {isItSeller && (
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.label}>{t('profileImage') || 'Profile Image'}</Text>
                <ImagePicker
                  title={t('chooseProfileImage') || 'Choose Image'}
                  onPress={() => handleImagePick('image', setFieldValue)}
                  imageUri={values.image ? values.image.uri : null}

                />
                {values.image && values.image.uri && (
                  <Text style={{ color: 'green', fontSize: 12 }}>{t('imageSelected') || 'Image selected'}</Text>
                )}
              </View>
            )}
            {/* Shop Name */}
            {isItSeller && (
              <Input
                label={(evaProps) => (
                  <Text {...evaProps} style={styles.label}>
                    {t('shopName') || 'Shop Name'}
                  </Text>
                )}
                placeholderTextColor={styles.placeholderTextColor}
                placeholder={t('enterShopName') || 'Enter shop name'}
                style={styles.input}
                textStyle={styles.textStyle}
                onChangeText={handleChange('shop_name')}
                onBlur={handleBlur('shop_name')}
                value={values.shop_name}
                caption={touched.shop_name && errors.shop_name ? errors.shop_name :''}
                status={errors.shop_name && touched.shop_name ? 'danger' : 'basic'}
              />
            )}
            {/* Shop Address */}
            {isItSeller && (
              <Input
                label={(evaProps) => (
                  <Text {...evaProps} style={styles.label}>
                    {t('shopAddress') || 'Shop Address'}
                  </Text>
                )}
                placeholderTextColor={styles.placeholderTextColor}
                placeholder={t('enterShopAddress') || 'Enter shop address'}
                style={styles.input}
                textStyle={styles.textStyle}
                onChangeText={handleChange('shop_address')}
                onBlur={handleBlur('shop_address')}
                value={values.shop_address}
                caption={touched.shop_address && errors.shop_address ? errors.shop_address : ''}
                status={errors.shop_address && touched.shop_address ? 'danger' : 'basic'}
              />
            )}
            {/* Shop Logo Picker */}
            {isItSeller && (
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.label}>{t('farmLogo') || 'Shop Logo'}</Text>
                <ImagePicker
                  title={t('choosefarmLogo') || 'Choose Logo'}
                  onPress={() => handleImagePick('logo', setFieldValue)}
                  imageUri={values.logo ? values.logo.uri : null}
                />
                {values.logo && values.logo.uri && (
                  <Text style={{ color: 'green', fontSize: 12 }}>{t('logoSelected') || 'Logo selected'}</Text>
                )}
              </View>
            )}
            {/* Shop Banner Picker */}
            {isItSeller && (
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.label}>{t('farmBanner') || 'Shop Banner'}</Text>
                <ImagePicker
                  title={t('choosefarmBanner') || 'Choose Banner'}
                  onPress={() => handleImagePick('banner', setFieldValue)}
                  imageUri={values.banner ? values.banner.uri : null}
                />
                {values.banner && values.banner.uri && (
                  <Text style={{ color: 'green', fontSize: 12 }}>{t('bannerSelected') || 'Banner selected'}</Text>
                )}
              </View>
            )}
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
  status={touched.firstName && errors.firstName ? 'danger' : 'basic'}
  caption={touched.firstName && errors.firstName ? errors.firstName : ''}
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
                touched.lastName &&  errors.lastName  ? errors.lastName : ''
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
              caption={touched.email && errors.email ? errors.email : ''}
              status={errors.email && touched.email ? 'danger' : 'basic'}
            />


            {/* Improved Phone Field with Country Code */}
            <View  style={{flexDirection: 'row'}}>
            <Text  style={styles.label}>
                    {t('phone')}
                  </Text>
                  <Text style={styles.countryCodeNote}>
              {t('countryCodeNote')}
            </Text>
            </View>
            <View style={styles.phoneRowImproved}>
              
              <TouchableOpacity
                style={styles.countryCodeTouchable}
                onPress={() => setCountryModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.countryCodeText}>
                  {COUNTRY_CODES.find(c => c.code === values.countryCode)?.label || COUNTRY_CODES[0].label}
                </Text>
                <Text style={styles.countryCodeDropdownIcon}>▼</Text>
              </TouchableOpacity>
              <Input
                
                placeholderTextColor={styles.placeholderTextColor}
                placeholder="300 123 4567"
                style={styles.phoneInputImproved}
                textStyle={styles.textStyle}
                keyboardType="phone-pad"
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                value={values.phone}
                maxLength={15}
                // Remove border on left to blend with country code
                // UnderlayColor handled by style
              />
            </View>
            <Modal
              visible={countryModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setCountryModalVisible(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPressOut={() => setCountryModalVisible(false)}
              >
                <View style={styles.countryModal}>
                  <FlatList
                    data={COUNTRY_CODES}
                    keyExtractor={item => item.code}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.countryModalItem}
                        onPress={() => {
                          setFieldValue('countryCode', item.code);
                          setCountryModalVisible(false);
                        }}
                      >
                        <Text style={styles.countryModalItemText}>{item.label}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
            <Text style={{fontSize: 12}} status={errors.phone && touched.phone ? 'danger' : 'basic'}>
                {touched.phone && errors.phone ? errors.phone : ''}
                </Text>

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
            <Text style={{fontSize: 12}}
            status={touched.state && errors.state  ? 'danger' : 'basic'}
            >{touched.state && errors.state ? errors.state : ''}</Text>

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
            <Text
            style={{fontSize: 12}}
            status={ touched.city && errors.city? 'danger' : 'basic'}
            >{touched.city && errors.city? errors.city : ''}</Text>

            {(() => {
              const [showPassword, setShowPassword] = React.useState(false);
              return (
                <Input
                  label={(evaProps) => (
                    <Text {...evaProps} style={styles.label}>
                      {t('password')}
                    </Text>
                  )}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={styles.placeholderTextColor}
                  style={styles.input}
                  textStyle={styles.textStyle}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  caption={
                    touched.password && errors.password ? errors.password: ''
                  }
                  status={errors.password && touched.password ? 'danger' : 'basic'}
                  accessoryRight={props => (
                    <Icon
                      {...props}
                      name={showPassword ? "eye-off" : "eye"}
                      fill="#8F9BB3"
                      style={{ width: 26, height: 26 , marginRight: 5}}
                      onPress={() => setShowPassword(v => !v)}
                    />
                  )}
                />
              );
            })()}
            {(() => {
              const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
              return (
                <Input
                  label={(evaProps) => (
                    <Text {...evaProps} style={styles.label}>
                      {t('confirmpassword')}
                    </Text>
                  )}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor={styles.placeholderTextColor}
                  style={styles.input}
                  textStyle={styles.textStyle}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  value={values.confirmPassword}
                  caption={
                    touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : ''
                  }
                  status={
                    errors.confirmPassword && touched.confirmPassword
                      ? 'danger'
                      : 'basic'
                  }
                  accessoryRight={props => (
                    <Icon
                      {...props}
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      fill="#8F9BB3"
                      style={{ width: 26, height: 26 , marginRight: 5}}
                      onPress={() => setShowConfirmPassword(v => !v)}
                    />
                  )}
                />
              );
            })()}
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
    marginTop: 10,
    backgroundColor: 'rgba(130, 130, 130, 0) !important',
    borderColor: 'rgba(24, 29, 180, 0)',
    borderWidth: 1,
  },
  // Improved phone row styles
  phoneRowImproved: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgb(170, 170, 170)',
    backgroundColor: 'rgba(255,255,255,0.42)',
    overflow: 'hidden',
  },
  countryCodeTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(245,245,245,0.95)',
    borderRightWidth: 1,
    borderRightColor: 'rgb(170, 170, 170)',
    minWidth: 90,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#222',
    marginRight: 4,
  },
  countryCodeDropdownIcon: {
    fontSize: 12,
    color: '#888',
    marginLeft: 2,
  },
  phoneInputImproved: {
    flex: 1,
    marginVertical: 0,
    marginLeft: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingLeft: 10,
    // Remove border to blend with container
  },
  // Modal styles for country code picker
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryModal: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 280,
    maxHeight: 350,
    paddingVertical: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  countryModalItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  countryModalItemText: {
    fontSize: 16,
    color: '#222',
  },
  phoneRow: {
    // Deprecated, kept for backward compatibility
    display: 'none',
  },
  countryCodeSelect: {
    // Deprecated, kept for backward compatibility
    display: 'none',
  },
  countryCodeNote: {
    color: 'red',
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 2,
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
  userTypeContainer: {
    marginBottom: 10,
    width: '100%',
  },
  userTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    borderWidth: 1,
    borderColor: 'rgb(170, 170, 170)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  userTypeButtonText: {
    fontSize: 16,
    color: '#222',
  },
  userTypeModal: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 280,
    paddingVertical: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  userTypeOption: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userTypeOptionSelected: {
    backgroundColor: '#27AE60',
  },
  userTypeOptionText: {
    fontSize: 16,
    color: '#222',
  },
  userTypeOptionTextSelected: {
    color: '#fff',
  },
});
