import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {
  Layout,
  Text,
  Button,
  Spinner,
  Input,
  Card,
} from '@ui-kitten/components';

import {useTheme} from '../../../../../theme/ThemeContext';
import {useTranslation} from 'react-i18next';
import {
  getShopInfo,
  updateShopInfo,
  getSellerInfo,
  updateSellerInfo,
  setShopVacation,
  setShopTemporaryClose,
  updateSellerBankDetails,
} from '../../../../../services/sellerApi';
import {ThemedIcon} from '../../../../../components/Icon';
import {ImagePicker} from '../../../../../components/form';
import {launchImageLibrary} from 'react-native-image-picker';

export default function ShopSettingsPage({navigation}) {
  const {theme, isDark} = useTheme();
  const {t} = useTranslation();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shopInfo, setShopInfo] = useState({
    name: '',
    address: '',
    contact: '',
    image: null,
  });
  const [sellerInfo, setSellerInfo] = useState({
    f_name: '',
    l_name: '',
    phone: '',
    email: '',
    bank_name: '',
    branch: '',
    account_no: '',
    holder_name: '',
    image: null,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [vacation, setVacation] = useState({
    vacation_status: false,
    vacation_start_date: '',
    vacation_end_date: '',
    vacation_note: '',
  });
  const [temporaryClose, setTemporaryClose] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shopResponse, sellerResponse] = await Promise.all([
        getShopInfo(),
        getSellerInfo(),
      ]);

      if (shopResponse.data) {
        setShopInfo({
          name: shopResponse.data.name || '',
          address: shopResponse.data.address || '',
          contact: shopResponse.data.contact || '',
          image: shopResponse.data.image
            ? {
                uri: shopResponse.data.image,
                name: shopResponse.data.image,
                type: 'image/jpeg',
              }
            : null,
        });
        setVacation({
          vacation_status: !!shopResponse.data.vacation_status,
          vacation_start_date: shopResponse.data.vacation_start_date || '',
          vacation_end_date: shopResponse.data.vacation_end_date || '',
          vacation_note: shopResponse.data.vacation_note || '',
        });
        setTemporaryClose(!!shopResponse.data.temporary_close);
      }

      if (sellerResponse.data) {
        setSellerInfo({
          f_name: sellerResponse.data.f_name || '',
          l_name: sellerResponse.data.l_name || '',
          phone: sellerResponse.data.phone || '',
          email: sellerResponse.data.email || '',
          bank_name: sellerResponse.data.bank_name || '',
          branch: sellerResponse.data.branch || '',
          account_no: sellerResponse.data.account_no || '',
          holder_name: sellerResponse.data.holder_name || '',
          image: sellerResponse.data.image
            ? {
                uri: sellerResponse.data.image,
                name: sellerResponse.data.image,
                type: 'image/jpeg',
              }
            : null,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert(
        t('shopSettingsPage.alerts.errorTitle'),
        t('shopSettingsPage.alerts.fetchError'),
      );
    } finally {
      setLoading(false);
    }
  };

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
    return true;
  };

  const handleShopImagePick = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert(
        t('shopSettingsPage.alerts.permissionDenied'),
        t('shopSettingsPage.alerts.storagePermission'),
      );
      return;
    }

    const result = await launchImageLibrary({mediaType: 'photo'});
    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setShopInfo(prev => ({
        ...prev,
        image: {
          uri: asset.uri,
          name: asset.fileName || 'image.jpg',
          type: asset.type || 'image/jpeg',
        },
      }));
    }
  };

  const handleSellerImagePick = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert(
        t('shopSettingsPage.alerts.permissionDenied'),
        t('shopSettingsPage.alerts.storagePermission'),
      );
      return;
    }

    const result = await launchImageLibrary({mediaType: 'photo'});
    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setSellerInfo(prev => ({
        ...prev,
        image: {
          uri: asset.uri,
          name: asset.fileName || 'image.jpg',
          type: asset.type || 'image/jpeg',
        },
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Update shop info
      const shopFormData = new FormData();
      shopFormData.append('name', shopInfo.name);
      shopFormData.append('address', shopInfo.address);
      shopFormData.append('contact', shopInfo.contact);
      if (shopInfo.image && shopInfo.image.uri) {
        shopFormData.append('image', {
          uri:
            Platform.OS === 'ios'
              ? shopInfo.image.uri.replace('file://', '')
              : shopInfo.image.uri,
          type: shopInfo.image.type,
          name: shopInfo.image.name,
        });
      }

      // Update seller info
      const sellerFormData = new FormData();
      sellerFormData.append('f_name', sellerInfo.f_name);
      sellerFormData.append('l_name', sellerInfo.l_name);
      sellerFormData.append('phone', sellerInfo.phone);
      sellerFormData.append('email', sellerInfo.email);
      sellerFormData.append('bank_name', sellerInfo.bank_name);
      sellerFormData.append('branch', sellerInfo.branch);
      sellerFormData.append('account_no', sellerInfo.account_no);
      sellerFormData.append('holder_name', sellerInfo.holder_name);
      if (sellerInfo.image && sellerInfo.image.uri) {
        sellerFormData.append('image', {
          uri:
            Platform.OS === 'ios'
              ? sellerInfo.image.uri.replace('file://', '')
              : sellerInfo.image.uri,
          type: sellerInfo.image.type,
          name: sellerInfo.image.name,
        });
      }

      await Promise.all([
        updateShopInfo(shopFormData),
        updateSellerInfo(sellerFormData),
      ]);

      Alert.alert(
        t('shopSettingsPage.alerts.successTitle'),
        t('shopSettingsPage.alerts.settingsSuccess'),
      );
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert(
        t('shopSettingsPage.alerts.errorTitle'),
        t('shopSettingsPage.alerts.settingsError'),
      );
    } finally {
      setSaving(false);
    }
  };

  // Separate handlers for shop and seller update
  // const handleShopSave = async () => {
  //   try {
  //     setSaving(true);
  //     const shopFormData = new FormData();
  //     shopFormData.append('name', shopInfo.name);
  //     shopFormData.append('address', shopInfo.address);
  //     shopFormData.append('contact', shopInfo.contact);
  //     if (shopInfo.image && shopInfo.image.uri) {
  //       shopFormData.append('image', {
  //         uri: Platform.OS === 'ios' ? shopInfo.image.uri.replace('file://', '') : shopInfo.image.uri,
  //         type: shopInfo.image.type,
  //         name: shopInfo.image.name,
  //       });
  //     }
  //     await updateShopInfo(shopFormData);
  //     Alert.alert('Success', 'Shop info updated successfully');
  //     setIsEditMode(false);
  //   } catch (error) {
  //     console.error('Error updating shop info:', error);
  //     Alert.alert('Error', 'Failed to update shop info');
  //   } finally {
  //     setSaving(false);
  //   }
  // };
  const handleShopSave = async () => {
    try {
      setSaving(true);
      const shopFormData = new FormData();

      // Append all fields with proper encoding
      shopFormData.append('name', shopInfo.name);
      shopFormData.append('address', shopInfo.address);
      shopFormData.append('contact', shopInfo.contact);

      if (shopInfo.image && shopInfo.uri) {
        shopFormData.append('image', {
          uri: shopInfo.image.uri,
          type: shopInfo.image.type || 'image/jpeg',
          name: shopInfo.image.name || 'shop_image.jpg',
        });
      }

      // Add headers for FormData
      const config = {
        headers: {
          Accept: 'application/json',
          // DO NOT set Content-Type here!
        },
      };

      await updateShopInfo(shopFormData, config);
      Alert.alert(
        t('shopSettingsPage.alerts.successTitle'),
        t('shopSettingsPage.alerts.shopInfoSuccess'),
      );
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating shop info:', error);
      Alert.alert(
        t('shopSettingsPage.alerts.errorTitle'),
        t('shopSettingsPage.alerts.shopInfoError') + ': ' + error.message,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSellerSave = async () => {
    try {
      setSaving(true);
      const sellerFormData = new FormData();
      sellerFormData.append('f_name', sellerInfo.f_name);
      sellerFormData.append('l_name', sellerInfo.l_name);
      sellerFormData.append('phone', sellerInfo.phone);
      sellerFormData.append('email', sellerInfo.email);
      sellerFormData.append('bank_name', sellerInfo.bank_name);
      sellerFormData.append('branch', sellerInfo.branch);
      sellerFormData.append('account_no', sellerInfo.account_no);
      sellerFormData.append('holder_name', sellerInfo.holder_name);
      if (sellerInfo.image && sellerInfo.image.uri) {
        sellerFormData.append('image', {
          uri:
            Platform.OS === 'ios'
              ? sellerInfo.image.uri.replace('file://', '')
              : sellerInfo.image.uri,
          type: sellerInfo.image.type,
          name: sellerInfo.image.name,
        });
      }
      await updateSellerInfo(sellerFormData);
      Alert.alert(
        t('shopSettingsPage.alerts.successTitle'),
        t('shopSettingsPage.alerts.sellerInfoSuccess'),
      );
      setIsEditMode(false);
    } catch (error) {
      console.error(
        'Error updating seller info:',
        error?.data ||
          error.response ||
          error?.message ||
          error?.response?.data,
      );
      Alert.alert(
        t('shopSettingsPage.alerts.errorTitle'),
        t('shopSettingsPage.alerts.sellerInfoError'),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleVacationSave = async () => {
    try {
      setSaving(true);
      await setShopVacation({
        vacation_status: vacation.vacation_status ? 1 : 0,
        vacation_start_date: vacation.vacation_start_date,
        vacation_end_date: vacation.vacation_end_date,
        vacation_note: vacation.vacation_note,
      });
      Alert.alert(
        t('shopSettingsPage.alerts.successTitle'),
        t('shopSettingsPage.alerts.vacationSuccess'),
      );
    } catch (error) {
      Alert.alert(
        t('shopSettingsPage.alerts.errorTitle'),
        t('shopSettingsPage.alerts.vacationError'),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTemporaryCloseSave = async () => {
    try {
      setSaving(true);
      await setShopTemporaryClose(temporaryClose ? 1 : 0);
      Alert.alert(
        t('shopSettingsPage.alerts.successTitle'),
        t('shopSettingsPage.alerts.temporaryCloseSuccess'),
      );
    } catch (error) {
      Alert.alert(
        t('shopSettingsPage.alerts.errorTitle'),
        t('shopSettingsPage.alerts.temporaryCloseError'),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBankSave = async () => {
    try {
      setSaving(true);
      const bankDetails = {
        bank_name: sellerInfo.bank_name,
        branch: sellerInfo.branch,
        account_no: sellerInfo.account_no,
        holder_name: sellerInfo.holder_name,
      };
      await updateSellerBankDetails(bankDetails);
      Alert.alert(
        t('shopSettingsPage.alerts.successTitle'),
        t('shopSettingsPage.alerts.bankSuccess'),
      );
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating bank details:', error);
      Alert.alert(
        t('shopSettingsPage.alerts.errorTitle'),
        t('shopSettingsPage.alerts.bankError'),
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      // Validate passwords
      if (
        !passwordData.currentPassword ||
        !passwordData.newPassword ||
        !passwordData.confirmPassword
      ) {
        Alert.alert(
          t('shopSettingsPage.alerts.errorTitle'),
          'Please fill all password fields',
        );
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        Alert.alert(
          t('shopSettingsPage.alerts.errorTitle'),
          'New passwords do not match',
        );
        return;
      }

      if (passwordData.newPassword.length < 8) {
        Alert.alert(
          t('shopSettingsPage.alerts.errorTitle'),
          'Password must be at least 8 characters',
        );
        return;
      }

      setSaving(true);

      // Create password update payload
      const passwordPayload = {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword,
      };

      // You'll need to implement this API call in your sellerApi.js
      // await updateSellerPassword(passwordPayload);

      Alert.alert(
        t('shopSettingsPage.alerts.successTitle'),
        'Password updated successfully',
      );

      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert(
        t('shopSettingsPage.alerts.errorTitle'),
        'Failed to update password',
      );
    } finally {
      setSaving(false);
    }
  };

  // Always render as a page
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? theme['color-shadcn-background'] : '#fff',
      }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? theme['color-shadcn-background'] : '#fff'}
      />
      {/* Page Header */}
      <View
        style={[
          styles.pageHeader,
          {backgroundColor: isDark ? theme['color-shadcn-background'] : '#fff'},
        ]}>
        <Button
          appearance="ghost"
          size="small"
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <ThemedIcon
            name="arrow-back-outline"
            iconStyle={{width: 24, height: 24}}
          />
        </Button>
        <Text
          style={[
            styles.pageTitle,
            {
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            },
          ]}>
          {t('shopSettingsPage.title')}
        </Text>
        <View style={styles.headerActions}>
          {!isEditMode ? (
            <Button
              appearance="ghost"
              size="small"
              onPress={() => setIsEditMode(true)}
              style={styles.headerButton}>
              {t('shopSettingsPage.edit')}
            </Button>
          ) : (
            <Button
              appearance="ghost"
              size="small"
              onPress={() => setIsEditMode(false)}
              style={styles.headerButton}>
              {t('shopSettingsPage.cancel')}
            </Button>
          )}
        </View>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
        </View>
      ) : (
        <ScrollView
          style={styles.pageContent}
          contentContainerStyle={{padding: 16}}>
          {/* Vacation & Temporary Close */}
          <Card
            style={[
              styles.section,
              {backgroundColor: isDark ? theme['color-shadcn-card'] : '#fff'},
            ]}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('shopSettingsPage.sections.shopAvailability.title')}
            </Text>
            {/* Vacation Mode */}
            <View style={{marginBottom: 16}}>
              <Text
                style={[
                  styles.label,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {t(
                  'shopSettingsPage.sections.shopAvailability.vacationMode.title',
                )}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 8,
                }}>
                <Button
                  appearance={vacation.vacation_status ? 'filled' : 'outline'}
                  size="small"
                  onPress={() =>
                    isEditMode &&
                    setVacation(v => ({
                      ...v,
                      vacation_status: !v.vacation_status,
                    }))
                  }
                  disabled={!isEditMode}
                  style={{marginRight: 8}}>
                  {vacation.vacation_status
                    ? t(
                        'shopSettingsPage.sections.shopAvailability.vacationMode.on',
                      )
                    : t(
                        'shopSettingsPage.sections.shopAvailability.vacationMode.off',
                      )}
                </Button>
                {isEditMode && (
                  <Button
                    size="tiny"
                    onPress={handleVacationSave}
                    disabled={saving}>
                    {saving ? (
                      <Spinner size="small" />
                    ) : (
                      t('shopSettingsPage.save')
                    )}
                  </Button>
                )}
              </View>
              {vacation.vacation_status && (
                <>
                  <Input
                    label={t(
                      'shopSettingsPage.sections.shopAvailability.vacationMode.startDate',
                    )}
                    value={vacation.vacation_start_date}
                    onChangeText={text =>
                      setVacation(v => ({...v, vacation_start_date: text}))
                    }
                    disabled={!isEditMode}
                    style={styles.input}
                  />
                  <Input
                    label={t(
                      'shopSettingsPage.sections.shopAvailability.vacationMode.endDate',
                    )}
                    value={vacation.vacation_end_date}
                    onChangeText={text =>
                      setVacation(v => ({...v, vacation_end_date: text}))
                    }
                    disabled={!isEditMode}
                    style={styles.input}
                  />
                  <Input
                    label={t(
                      'shopSettingsPage.sections.shopAvailability.vacationMode.note',
                    )}
                    value={vacation.vacation_note}
                    onChangeText={text =>
                      setVacation(v => ({...v, vacation_note: text}))
                    }
                    disabled={!isEditMode}
                    style={styles.input}
                  />
                </>
              )}
            </View>
            {/* Temporary Close */}
            <View>
              <Text
                style={[
                  styles.label,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {t(
                  'shopSettingsPage.sections.shopAvailability.temporaryClose.title',
                )}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 8,
                }}>
                <Button
                  appearance={temporaryClose ? 'filled' : 'outline'}
                  size="small"
                  onPress={() => isEditMode && setTemporaryClose(v => !v)}
                  disabled={!isEditMode}
                  style={{marginRight: 8}}>
                  {temporaryClose
                    ? t(
                        'shopSettingsPage.sections.shopAvailability.temporaryClose.closed',
                      )
                    : t(
                        'shopSettingsPage.sections.shopAvailability.temporaryClose.open',
                      )}
                </Button>
                {isEditMode && (
                  <Button
                    size="tiny"
                    onPress={handleTemporaryCloseSave}
                    disabled={saving}>
                    {saving ? (
                      <Spinner size="small" />
                    ) : (
                      t('shopSettingsPage.save')
                    )}
                  </Button>
                )}
              </View>
            </View>
          </Card>
          {/* Shop Information */}
          <Card
            style={[
              styles.section,
              {backgroundColor: isDark ? theme['color-shadcn-card'] : '#fff'},
            ]}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {t('shopSettingsPage.sections.shopInformation.title')}
              </Text>
              {isEditMode && (
                <Button
                  size="tiny"
                  appearance="filled"
                  onPress={handleShopSave}
                  disabled={saving}
                  style={{marginLeft: 8}}>
                  {saving ? (
                    <Spinner size="small" />
                  ) : (
                    t('shopSettingsPage.update')
                  )}
                </Button>
              )}
            </View>
            <View style={styles.imageContainer}>
              <Text
                style={[
                  styles.label,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {t('shopSettingsPage.sections.shopInformation.shopImage')}
              </Text>
              {isEditMode ? (
                <ImagePicker
                  title={t(
                    'shopSettingsPage.sections.shopInformation.chooseShopImage',
                  )}
                  onPress={handleShopImagePick}
                  imageUri={shopInfo.image ? shopInfo.image.uri : null}
                />
              ) : (
                <View style={styles.staticImageContainer}>
                  {shopInfo.image && shopInfo.image.uri ? (
                    <ThemedIcon
                      name="image-outline"
                      iconStyle={{width: 60, height: 60, opacity: 0.5}}
                      source={{uri: shopInfo.image.uri}}
                    />
                  ) : (
                    <ThemedIcon
                      name="image-outline"
                      iconStyle={{width: 60, height: 60, opacity: 0.5}}
                    />
                  )}
                </View>
              )}
            </View>
            <Input
              label={t('shopSettingsPage.sections.shopInformation.shopName')}
              value={shopInfo.name}
              onChangeText={text =>
                setShopInfo(prev => ({...prev, name: text}))
              }
              disabled={!isEditMode}
              style={styles.input}
            />
            <Input
              label={t('shopSettingsPage.sections.shopInformation.address')}
              value={shopInfo.address}
              onChangeText={text =>
                setShopInfo(prev => ({...prev, address: text}))
              }
              disabled={!isEditMode}
              multiline
              style={styles.input}
            />
            <Input
              label={t('shopSettingsPage.sections.shopInformation.contact')}
              value={shopInfo.contact}
              onChangeText={text =>
                setShopInfo(prev => ({...prev, contact: text}))
              }
              disabled={!isEditMode}
              style={styles.input}
            />
          </Card>
          {/* Seller Information */}
          <Card
            style={[
              styles.section,
              {backgroundColor: isDark ? theme['color-shadcn-card'] : '#fff'},
            ]}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {t('shopSettingsPage.sections.sellerInformation.title')}
              </Text>
              {isEditMode && (
                <Button
                  size="tiny"
                  appearance="filled"
                  onPress={handleSellerSave}
                  disabled={saving}
                  style={{marginLeft: 8}}>
                  {saving ? <Spinner size="small" /> : 'Update'}
                </Button>
              )}
            </View>
            <View style={styles.imageContainer}>
              <Text
                style={[
                  styles.label,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {t('shopSettingsPage.sections.sellerInformation.profileImage')}
              </Text>
              {isEditMode ? (
                <ImagePicker
                  title={t(
                    'shopSettingsPage.sections.sellerInformation.chooseProfileImage',
                  )}
                  onPress={handleSellerImagePick}
                  imageUri={sellerInfo.image ? sellerInfo.image.uri : null}
                />
              ) : (
                <View style={styles.staticImageContainer}>
                  {sellerInfo.image && sellerInfo.image.uri ? (
                    <ThemedIcon
                      name="person-outline"
                      iconStyle={{width: 60, height: 60, opacity: 0.5}}
                      source={{uri: sellerInfo.image.uri}}
                    />
                  ) : (
                    <ThemedIcon
                      name="person-outline"
                      iconStyle={{width: 60, height: 60, opacity: 0.5}}
                    />
                  )}
                </View>
              )}
            </View>
            <Input
              label={t('shopSettingsPage.sections.sellerInformation.firstName')}
              value={sellerInfo.f_name}
              onChangeText={text =>
                setSellerInfo(prev => ({...prev, f_name: text}))
              }
              disabled={!isEditMode}
              style={styles.input}
            />
            <Input
              label={t('shopSettingsPage.sections.sellerInformation.lastName')}
              value={sellerInfo.l_name}
              onChangeText={text =>
                setSellerInfo(prev => ({...prev, l_name: text}))
              }
              disabled={!isEditMode}
              style={styles.input}
            />
            <Input
              label={t('shopSettingsPage.sections.sellerInformation.phone')}
              value={sellerInfo.phone}
              onChangeText={text =>
                setSellerInfo(prev => ({...prev, phone: text}))
              }
              disabled={!isEditMode}
              style={styles.input}
            />
            <Input
              label={t('shopSettingsPage.sections.sellerInformation.email')}
              value={sellerInfo.email}
              onChangeText={text =>
                setSellerInfo(prev => ({...prev, email: text}))
              }
              disabled={!isEditMode}
              style={styles.input}
            />
          </Card>
          {/* Bank Information */}
          <Card
            style={[
              styles.section,
              {backgroundColor: isDark ? theme['color-shadcn-card'] : '#fff'},
            ]}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {t('shopSettingsPage.sections.bankInformation.title')}
              </Text>
              {isEditMode && (
                <Button
                  size="tiny"
                  appearance="filled"
                  onPress={handleBankSave}
                  disabled={saving}
                  style={{marginLeft: 8}}>
                  {saving ? <Spinner size="small" /> : 'Update'}
                </Button>
              )}
            </View>
            <Input
              label={t('shopSettingsPage.sections.bankInformation.bankName')}
              value={sellerInfo.bank_name}
              onChangeText={text =>
                setSellerInfo(prev => ({...prev, bank_name: text}))
              }
              disabled={!isEditMode}
              style={styles.input}
            />
            <Input
              label={t('shopSettingsPage.sections.bankInformation.branch')}
              value={sellerInfo.branch}
              onChangeText={text =>
                setSellerInfo(prev => ({...prev, branch: text}))
              }
              disabled={!isEditMode}
              style={styles.input}
            />
            <Input
              label={t(
                'shopSettingsPage.sections.bankInformation.accountNumber',
              )}
              value={sellerInfo.account_no}
              onChangeText={text =>
                setSellerInfo(prev => ({...prev, account_no: text}))
              }
              disabled={!isEditMode}
              style={styles.input}
            />
            <Input
              label={t(
                'shopSettingsPage.sections.bankInformation.accountHolderName',
              )}
              value={sellerInfo.holder_name}
              onChangeText={text =>
                setSellerInfo(prev => ({...prev, holder_name: text}))
              }
              disabled={!isEditMode}
              style={styles.input}
            />
          </Card>

          {/* Password Update Section */}
          <Card
            style={[
              styles.section,
              {backgroundColor: isDark ? theme['color-shadcn-card'] : '#fff'},
            ]}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {t('common.updatePassword')}
              </Text>
              {isEditMode && (
                <Button
                  size="tiny"
                  appearance="filled"
                  onPress={handlePasswordUpdate}
                  disabled={saving}
                  style={{marginLeft: 8}}>
                  {saving ? (
                    <Spinner size="small" />
                  ) : (
                    t('common.updatePassword')
                  )}
                </Button>
              )}
            </View>
            <Input
              label={t('common.currentPassword')}
              value={passwordData.currentPassword}
              onChangeText={text =>
                setPasswordData(prev => ({...prev, currentPassword: text}))
              }
              disabled={!isEditMode}
              secureTextEntry={true}
              style={styles.input}
            />
            <Input
              label={t('common.newPassword')}
              value={passwordData.newPassword}
              onChangeText={text =>
                setPasswordData(prev => ({...prev, newPassword: text}))
              }
              disabled={!isEditMode}
              secureTextEntry={true}
              style={styles.input}
            />
            <Input
              label={t('common.confirmNewPassword')}
              value={passwordData.confirmPassword}
              onChangeText={text =>
                setPasswordData(prev => ({...prev, confirmPassword: text}))
              }
              disabled={!isEditMode}
              secureTextEntry={true}
              style={styles.input}
            />
          </Card>

          {/* Remove the bottom row of update buttons */}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  section: {
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  staticImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
});
