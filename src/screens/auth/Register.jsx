import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Layout, Text, Input, Icon} from '@ui-kitten/components';
import {Formik} from 'formik';
import {InputError, SubmitButton, ImagePicker} from '../../components/form';
import {AuthContainer} from '../../components/auth/AuthContainer';
import {flexeStyles} from '../../utils/globalStyles';
import {Select, SelectItem, IndexPath} from '@ui-kitten/components';
import TextButton from '../../components/form/TextButton';
import i18next from 'i18next';
import {useRoute} from '@react-navigation/native';
import {axiosBuyerClient, axiosSellerClient} from '../../utils/axiosClient';
import {useDispatch} from 'react-redux';
import {setAuthToken, setUserType, UserType} from '../../store/user';
import {AppScreens} from '../../navigators/AppNavigator';
import {launchImageLibrary} from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import {useTheme} from '../../theme/ThemeContext';

import * as Yup from 'yup';
import {COUNTRY_CODES, stateKeys, citiesByState} from '../../utils/constants';

// Shared validation schema
const createBaseSchema = t => ({
  firstName: Yup.string().required(t('validation.firstNameRequired')),
  lastName: Yup.string().required(t('validation.lastNameRequired')),
  email: Yup.string()
    .email(t('validation.invalidEmail'))
    .required(t('validation.emailRequired')),
  countryCode: Yup.string().required(t('validation.countryCodeRequired')),
  phone: Yup.string().required(t('validation.phoneRequired')),
  password: Yup.string()
    .min(6, t('validation.passwordMinLength'))
    .required(t('validation.passwordRequired')),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], t('validation.passwordsMustMatch'))
    .required(t('validation.confirmPasswordRequired')),
  state: Yup.string().required(t('validation.stateRequired')),
  city: Yup.string().required(t('validation.cityRequired')),
});

// Additional fields for seller
const createSellerSchema = t => ({
  image: Yup.object().nullable().required(t('validation.profileImageRequired')),
  shop_name: Yup.string().required(t('validation.farmNameRequired')),
  shop_address: Yup.string().required(t('validation.farmAddressRequired')),
  logo: Yup.object().nullable().required(t('validation.farmLogoRequired')),
  banner: Yup.object().nullable().required(t('validation.farmBannerRequired')),
});

// Permission request helper for gallery access
const requestGalleryPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } else if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true; // iOS handles it via Info.plist
};

export const RegisterScreen = ({navigation}) => {
  const route = useRoute();
  const {isItSeller: initialIsSeller = true} = route.params || {};
  const [isItSeller, setIsItSeller] = useState(initialIsSeller);
  const [userTypeModalVisible, setUserTypeModalVisible] = useState(false);
  const {isDark, theme} = useTheme();
  const {t} = useTranslation();

  const validationSchema = Yup.object().shape(
    isItSeller
      ? {...createBaseSchema(t), ...createSellerSchema(t)}
      : createBaseSchema(t),
  );

  const [isBtnDisable, setIsBtnDisable] = useState(false);
  const dispatch = useDispatch();

  // For improved phone UI
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  const navigateToPage = (pageName, params = {}) => {
    navigation.navigate(pageName, params);
  };

  // Helper to pick image and set in Formik, with permission check
  const handleImagePick = async (field, setFieldValue) => {
    // console.log("IMAGE PICKING", field)
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
        if (values.image && values.image.uri)
          formData.append('image', {
            uri: values.image.uri,
            name: values.image.name,
            type: values.image.type,
          });
        formData.append('shop_name', values.shop_name);
        formData.append('shop_address', values.shop_address);
        if (values.logo && values.logo.uri)
          formData.append('logo', {
            uri: values.logo.uri,
            name: values.logo.name,
            type: values.logo.type,
          });
        if (values.banner && values.banner.uri)
          formData.append('banner', {
            uri: values.banner.uri,
            name: values.banner.name,
            type: values.banner.type,
          });
      }

      const headers = {
        'Content-Type': 'multipart/form-data',
      };
      // console.log("DATA", formData)
      let response;
      if (isItSeller) {
        // console.log("IN seller")
        response = await axiosSellerClient.post('registration', formData, {
          headers,
        });
        if (response.status >= 200 && response.status < 300) {
          // console.log("IN FORM")
          // const formData = new FormData();
          // formData.append('email', values.email.trim());
          // formData.append('password', values.password);
          // // console.log("FORM NEW DATA ->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", formData)
          // try {
          //   const responseToLogin = await axiosSellerClient.post('auth/login', formData, {headers});
          //   console.debug("RESPONSE", responseToLogin)
          //   if(responseToLogin.status >= 200 && responseToLogin.status < 300){
          //     if (response?.data?.token) {
          //       // console.log("IN TOKEN")
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
        // console.log("IN buyer")
        response = await axiosBuyerClient.post('auth/register', formData, {
          headers,
        });
      }
      // TODO: handle registration success (e.g., navigation, token storage, etc.)
      console.debug('Register Success Response->', response);
      console.debug('\nRegister Success Response', response.data);

      if (response.data.token) {
        // console.log("IN TOKEN")
        dispatch(setUserType(isItSeller ? UserType.SELLER : UserType.BUYER));
        dispatch(setAuthToken(response.data.token));
        navigateToPage(
          isItSeller ? AppScreens.SELLER_HOME_MAIN : AppScreens.BUYER_HOME_MAIN,
        );
      } else {
        navigateToPage(AppScreens.LOGIN, {
          isItSeller: isItSeller,
          email: values.email.trim(),
          password: values.password,
        });
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
              text1: err.message || t('common.error'),
              text2: t('registration.registrationFailed'),
              position: 'top',
            });
          });
        } else {
          Toast.show({
            type: 'error',
            text1: t('registration.somethingWentWrong'),
            text2: t('registration.registrationFailed'),
            position: 'top',
          });
        }
      }
      setIsBtnDisable(false);
    } finally {
      setIsBtnDisable(false);
    }
  };

  return (
    <AuthContainer>
      <Image
        source={require('../../../assets/latest/petbooker_icon.png')}
        style={styles.topLeftLogo}
      />

      <Text
        style={[
          styles.title,
          {
            color: isDark
              ? theme['color-shadcn-foreground']
              : theme['color-basic-900'],
          },
        ]}>
        {t('createaccount')}
      </Text>
      <Text
        style={[
          styles.subtitle,
          {
            color: isDark
              ? theme['color-shadcn-muted-foreground']
              : theme['color-basic-700'],
          },
        ]}>
        {t('fillUpTheFormToCreateAnAccount')}
      </Text>

      {/* User Type Toggle */}
      <View style={styles.userTypeContainer}>
        <Text
          style={[
            styles.label,
            {
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            },
          ]}>
          {t('registration.accountType')}
        </Text>
        <TouchableOpacity
          style={[
            styles.userTypeButton,
            {
              backgroundColor: isDark
                ? theme['color-shadcn-card']
                : theme['color-basic-100'],
              borderColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
            },
          ]}
          onPress={() => setUserTypeModalVisible(true)}>
          <Text
            style={[
              styles.userTypeButtonText,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            {isItSeller ? t('seller') : t('buyer')}
          </Text>
          <Icon
            name="chevron-down"
            fill={
              isDark
                ? theme['color-shadcn-muted-foreground']
                : theme['color-basic-600']
            }
            style={{width: 20, height: 20}}
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={userTypeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUserTypeModalVisible(false)}>
        <TouchableOpacity
          style={[
            styles.modalOverlay,
            {
              backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)',
            },
          ]}
          activeOpacity={1}
          onPressOut={() => setUserTypeModalVisible(false)}>
          <View
            style={[
              styles.userTypeModal,
              {
                backgroundColor: isDark
                  ? theme['color-shadcn-card']
                  : theme['color-basic-100'],
              },
            ]}>
            <TouchableOpacity
              style={[
                styles.userTypeOption,
                isItSeller && {backgroundColor: theme['color-shadcn-primary']},
              ]}
              onPress={() => {
                setIsItSeller(true);
                setUserTypeModalVisible(false);
              }}>
              <Text
                style={[
                  styles.userTypeOptionText,
                  {
                    color: isItSeller
                      ? theme['color-shadcn-primary-foreground']
                      : theme['color-shadcn-primary'],
                  },
                ]}>
                {t('seller')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.userTypeOption,
                !isItSeller && {backgroundColor: theme['color-shadcn-primary']},
              ]}
              onPress={() => {
                setIsItSeller(false);
                setUserTypeModalVisible(false);
              }}>
              <Text
                style={[
                  styles.userTypeOptionText,
                  {
                    color: !isItSeller
                      ? theme['color-shadcn-primary-foreground']
                      : theme['color-shadcn-primary'],
                  },
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
              <View style={{marginBottom: 10}}>
                <Text
                  style={[
                    styles.label,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {t('registration.profileImage')}
                </Text>
                <ImagePicker
                  title={t('registration.chooseProfileImage')}
                  onPress={() => handleImagePick('image', setFieldValue)}
                  imageUri={values.image ? values.image.uri : null}
                />
                {values.image && values.image.uri && (
                  <Text
                    style={{
                      color: theme['color-shadcn-primary'],
                      fontSize: 12,
                    }}>
                    {t('registration.imageSelected')}
                  </Text>
                )}
              </View>
            )}

            {/* Farm Name */}
            {isItSeller && (
              <Input
                label={evaProps => (
                  <Text
                    {...evaProps}
                    style={[
                      styles.label,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    {t('shopName')}
                  </Text>
                )}
                placeholderTextColor={
                  isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600']
                }
                placeholder={t('registration.enterShopName')}
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark
                      ? theme['color-shadcn-card']
                      : theme['color-basic-100'],
                    borderColor: isDark
                      ? theme['color-shadcn-border']
                      : theme['color-basic-400'],
                  },
                ]}
                textStyle={[
                  styles.textStyle,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}
                onChangeText={handleChange('shop_name')}
                onBlur={handleBlur('shop_name')}
                value={values.shop_name}
                caption={
                  touched.shop_name && errors.shop_name ? errors.shop_name : ''
                }
                status={
                  errors.shop_name && touched.shop_name ? 'danger' : 'basic'
                }
              />
            )}

            {/* Farm Address */}
            {isItSeller && (
              <Input
                label={evaProps => (
                  <Text
                    {...evaProps}
                    style={[
                      styles.label,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    {t('shopAddress')}
                  </Text>
                )}
                placeholderTextColor={
                  isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600']
                }
                placeholder={t('registration.enterShopAddress')}
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark
                      ? theme['color-shadcn-card']
                      : theme['color-basic-100'],
                    borderColor: isDark
                      ? theme['color-shadcn-border']
                      : theme['color-basic-400'],
                  },
                ]}
                textStyle={[
                  styles.textStyle,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}
                onChangeText={handleChange('shop_address')}
                onBlur={handleBlur('shop_address')}
                value={values.shop_address}
                caption={
                  touched.shop_address && errors.shop_address
                    ? errors.shop_address
                    : ''
                }
                status={
                  errors.shop_address && touched.shop_address
                    ? 'danger'
                    : 'basic'
                }
              />
            )}

            {/* Farm Logo Picker */}
            {isItSeller && (
              <View style={{marginBottom: 10}}>
                <Text
                  style={[
                    styles.label,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {t('farmLogo')}
                </Text>
                <ImagePicker
                  title={t('registration.choosefarmLogo')}
                  onPress={() => handleImagePick('logo', setFieldValue)}
                  imageUri={values.logo ? values.logo.uri : null}
                />
                {values.logo && values.logo.uri && (
                  <Text
                    style={{
                      color: theme['color-shadcn-primary'],
                      fontSize: 12,
                    }}>
                    {t('registration.logoSelected')}
                  </Text>
                )}
              </View>
            )}

            {/* Farm Banner Picker */}
            {isItSeller && (
              <View style={{marginBottom: 10}}>
                <Text
                  style={[
                    styles.label,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {t('farmBanner')}
                </Text>
                <ImagePicker
                  title={t('registration.choosefarmBanner')}
                  onPress={() => handleImagePick('banner', setFieldValue)}
                  imageUri={values.banner ? values.banner.uri : null}
                />
                {values.banner && values.banner.uri && (
                  <Text
                    style={{
                      color: theme['color-shadcn-primary'],
                      fontSize: 12,
                    }}>
                    {t('registration.bannerSelected')}
                  </Text>
                )}
              </View>
            )}

            {/* First Name */}
            <Input
              label={evaProps => (
                <Text
                  {...evaProps}
                  style={[
                    styles.label,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {t('firstname')}
                </Text>
              )}
              placeholderTextColor={
                isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600']
              }
              placeholder="John"
              style={[
                styles.input,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-card']
                    : theme['color-basic-100'],
                  borderColor: isDark
                    ? theme['color-shadcn-border']
                    : theme['color-basic-400'],
                },
              ]}
              textStyle={[
                styles.textStyle,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}
              onChangeText={handleChange('firstName')}
              onBlur={handleBlur('firstName')}
              value={values.firstName}
              status={
                touched.firstName && errors.firstName ? 'danger' : 'basic'
              }
              caption={
                touched.firstName && errors.firstName ? errors.firstName : ''
              }
            />

            {/* Last Name */}
            <Input
              label={evaProps => (
                <Text
                  {...evaProps}
                  style={[
                    styles.label,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {t('lastname')}
                </Text>
              )}
              placeholderTextColor={
                isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600']
              }
              placeholder="Doe"
              style={[
                styles.input,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-card']
                    : theme['color-basic-100'],
                  borderColor: isDark
                    ? theme['color-shadcn-border']
                    : theme['color-basic-400'],
                },
              ]}
              textStyle={[
                styles.textStyle,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}
              onChangeText={handleChange('lastName')}
              onBlur={handleBlur('lastName')}
              value={values.lastName}
              caption={
                touched.lastName && errors.lastName ? errors.lastName : ''
              }
              status={errors.lastName && touched.lastName ? 'danger' : 'basic'}
            />

            {/* Email */}
            <Input
              label={evaProps => (
                <Text
                  {...evaProps}
                  style={[
                    styles.label,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {t('email')}
                </Text>
              )}
              placeholderTextColor={
                isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600']
              }
              placeholder="abc@gmail.com"
              textContentType="emailAddress"
              keyboardType="email-address"
              style={[
                styles.input,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-card']
                    : theme['color-basic-100'],
                  borderColor: isDark
                    ? theme['color-shadcn-border']
                    : theme['color-basic-400'],
                },
              ]}
              textStyle={[
                styles.textStyle,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              caption={touched.email && errors.email ? errors.email : ''}
              status={errors.email && touched.email ? 'danger' : 'basic'}
            />

            {/* Phone Field */}
            <View style={{flexDirection: 'row'}}>
              <Text
                style={[
                  styles.label,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {t('phone')}
              </Text>
              <Text
                style={[
                  styles.countryCodeNote,
                  {
                    color: theme['color-shadcn-destructive'],
                  },
                ]}>
                {t('countryCodeNote')}
              </Text>
            </View>
            <View
              style={[
                styles.phoneRowImproved,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-card']
                    : theme['color-basic-100'],
                  borderColor: isDark
                    ? theme['color-shadcn-border']
                    : theme['color-basic-400'],
                },
              ]}>
              <TouchableOpacity
                style={[
                  styles.countryCodeTouchable,
                  {
                    backgroundColor: isDark
                      ? theme['color-shadcn-secondary']
                      : theme['color-basic-200'],
                    borderRightColor: isDark
                      ? theme['color-shadcn-border']
                      : theme['color-basic-400'],
                  },
                ]}
                onPress={() => setCountryModalVisible(true)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.countryCodeText,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {COUNTRY_CODES.find(c => c.code === values.countryCode)
                    ?.label || COUNTRY_CODES[0].label}
                </Text>
                <Text
                  style={[
                    styles.countryCodeDropdownIcon,
                    {
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600'],
                    },
                  ]}>
                  ▼
                </Text>
              </TouchableOpacity>
              <Input
                placeholderTextColor={
                  isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600']
                }
                placeholder="300 123 4567"
                style={[
                  styles.phoneInputImproved,
                  {
                    backgroundColor: 'transparent',
                  },
                ]}
                textStyle={[
                  styles.textStyle,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}
                keyboardType="phone-pad"
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                value={values.phone}
                maxLength={15}
              />
            </View>

            {/* Country Code Modal */}
            <Modal
              visible={countryModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setCountryModalVisible(false)}>
              <TouchableOpacity
                style={[
                  styles.modalOverlay,
                  {
                    backgroundColor: isDark
                      ? 'rgba(0,0,0,0.5)'
                      : 'rgba(0,0,0,0.25)',
                  },
                ]}
                activeOpacity={1}
                onPressOut={() => setCountryModalVisible(false)}>
                <View
                  style={[
                    styles.countryModal,
                    {
                      backgroundColor: isDark
                        ? theme['color-shadcn-card']
                        : theme['color-basic-100'],
                    },
                  ]}>
                  <FlatList
                    data={COUNTRY_CODES}
                    keyExtractor={item => item.code}
                    renderItem={({item}) => (
                      <TouchableOpacity
                        style={[
                          styles.countryModalItem,
                          {
                            borderBottomColor: isDark
                              ? theme['color-shadcn-border']
                              : theme['color-basic-400'],
                          },
                        ]}
                        onPress={() => {
                          setFieldValue('countryCode', item.code);
                          setCountryModalVisible(false);
                        }}>
                        <Text
                          style={[
                            styles.countryModalItemText,
                            {
                              color: isDark
                                ? theme['color-shadcn-foreground']
                                : theme['color-basic-900'],
                            },
                          ]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>

            {/* State Select */}
            <Select
              placeholder={t('selectOption')}
              placeholderTextColor={
                isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600']
              }
              textStyle={[
                styles.textStyle,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}
              style={[
                styles.select,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-card']
                    : theme['color-basic-100'],
                  borderColor: isDark
                    ? theme['color-shadcn-border']
                    : theme['color-basic-400'],
                },
              ]}
              selectedIndex={
                values.state
                  ? new IndexPath(
                      stateKeys.findIndex(key => key === values.state),
                    )
                  : null
              }
              label={evaProps => (
                <Text
                  {...evaProps}
                  style={[
                    styles.label,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {t('state')}
                </Text>
              )}
              value={values.state ? t(values.state) : ''}
              onSelect={index => {
                const selectedStateKey = stateKeys[index.row];
                handleChange('state')(selectedStateKey);
                handleChange('city')(''); // Reset city when state changes
              }}>
              {stateKeys.map((stateKey, i) => (
                <SelectItem
                  title={t(stateKey)}
                  key={i}
                  placeholderTextColor={
                    isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600']
                  }
                  textStyle={[
                    styles.selectItem,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}
                />
              ))}
            </Select>

            {/* City Select */}
            <Select
              disabled={!values.state}
              placeholder={t('selectOption')}
              placeholderTextColor={
                isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600']
              }
              textStyle={[
                styles.textStyle,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}
              style={[
                styles.select,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-card']
                    : theme['color-basic-100'],
                  borderColor: isDark
                    ? theme['color-shadcn-border']
                    : theme['color-basic-400'],
                },
              ]}
              label={evaProps => (
                <Text
                  {...evaProps}
                  style={[
                    styles.label,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {t('city')}
                </Text>
              )}
              value={values.city ? t(values.city) : ''}
              selectedIndex={
                values.city && values.state
                  ? new IndexPath(
                      (citiesByState[values.state] || []).findIndex(
                        cityKey => cityKey === values.city,
                      ),
                    )
                  : null
              }
              onSelect={index => {
                const selectedCityKey = citiesByState[values.state][index.row];
                handleChange('city')(selectedCityKey);
              }}>
              {(citiesByState[values.state] || []).map((cityKey, i) => (
                <SelectItem
                  title={t(cityKey)}
                  key={i}
                  placeholderTextColor={
                    isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600']
                  }
                  textStyle={[
                    styles.selectItem,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}
                />
              ))}
            </Select>

            {/* Password */}
            {(() => {
              const [showPassword, setShowPassword] = React.useState(false);
              return (
                <Input
                  label={evaProps => (
                    <Text
                      {...evaProps}
                      style={[
                        styles.label,
                        {
                          color: isDark
                            ? theme['color-shadcn-foreground']
                            : theme['color-basic-900'],
                        },
                      ]}>
                      {t('password')}
                    </Text>
                  )}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={
                    isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600']
                  }
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark
                        ? theme['color-shadcn-card']
                        : theme['color-basic-100'],
                      borderColor: isDark
                        ? theme['color-shadcn-border']
                        : theme['color-basic-400'],
                    },
                  ]}
                  textStyle={[
                    styles.textStyle,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  caption={
                    touched.password && errors.password ? errors.password : ''
                  }
                  status={
                    errors.password && touched.password ? 'danger' : 'basic'
                  }
                  accessoryRight={props => (
                    <Icon
                      {...props}
                      name={showPassword ? 'eye-off' : 'eye'}
                      fill={
                        isDark
                          ? theme['color-shadcn-muted-foreground']
                          : theme['color-basic-600']
                      }
                      style={{width: 26, height: 26, marginRight: 5}}
                      onPress={() => setShowPassword(v => !v)}
                    />
                  )}
                />
              );
            })()}

            {/* Confirm Password */}
            {(() => {
              const [showConfirmPassword, setShowConfirmPassword] =
                React.useState(false);
              return (
                <Input
                  label={evaProps => (
                    <Text
                      {...evaProps}
                      style={[
                        styles.label,
                        {
                          color: isDark
                            ? theme['color-shadcn-foreground']
                            : theme['color-basic-900'],
                        },
                      ]}>
                      {t('confirmpassword')}
                    </Text>
                  )}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor={
                    isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600']
                  }
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark
                        ? theme['color-shadcn-card']
                        : theme['color-basic-100'],
                      borderColor: isDark
                        ? theme['color-shadcn-border']
                        : theme['color-basic-400'],
                    },
                  ]}
                  textStyle={[
                    styles.textStyle,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  value={values.confirmPassword}
                  caption={
                    touched.confirmPassword && errors.confirmPassword
                      ? errors.confirmPassword
                      : ''
                  }
                  status={
                    errors.confirmPassword && touched.confirmPassword
                      ? 'danger'
                      : 'basic'
                  }
                  accessoryRight={props => (
                    <Icon
                      {...props}
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      fill={
                        isDark
                          ? theme['color-shadcn-muted-foreground']
                          : theme['color-basic-600']
                      }
                      style={{width: 26, height: 26, marginRight: 5}}
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
                iconName={'arrow-right'}
                title={t('alreadyHaveAnAccount')}
                style={[
                  styles.alreadyHaveAnAccount,
                  {
                    borderColor: theme['color-shadcn-primary'],
                  },
                ]}
                onPress={() => navigateToPage('Login')}
              />
            </View>
          </Layout>
        )}
      </Formik>
      <Layout style={[flexeStyles.row, flexeStyles.contentBetween]}>
        <Text
          category="c1"
          style={{
            color: isDark
              ? theme['color-shadcn-foreground']
              : theme['color-basic-900'],
          }}>
          {t('alreadymember')}
        </Text>
        <Text
          category="p2"
          status="primary"
          style={[
            styles.externalLink,
            {
              color: theme['color-shadcn-primary'],
            },
          ]}
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
    borderRadius: 10,
    borderWidth: 1,
  },
  selectItem: {
    backgroundColor: 'transparent',
  },
  select: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  phoneRowImproved: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  countryCodeTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    minWidth: 90,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    marginRight: 4,
  },
  countryCodeDropdownIcon: {
    fontSize: 12,
    marginLeft: 2,
  },
  phoneInputImproved: {
    flex: 1,
    marginVertical: 0,
    marginLeft: 0,
    borderWidth: 0,
    paddingLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryModal: {
    borderRadius: 10,
    width: 280,
    maxHeight: 350,
    paddingVertical: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  countryModalItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
  },
  countryModalItemText: {
    fontSize: 16,
  },
  countryCodeNote: {
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 2,
  },
  textStyle: {
    fontSize: 14,
    paddingVertical: 4,
  },
  label: {
    fontSize: 16,
  },
  externalLink: {
    marginLeft: 5,
  },
  alreadyHaveAnAccount: {
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
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
  },
  userTypeButtonText: {
    fontSize: 16,
  },
  userTypeModal: {
    borderRadius: 10,
    width: 280,
    paddingVertical: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  userTypeOption: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
  },
  userTypeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
