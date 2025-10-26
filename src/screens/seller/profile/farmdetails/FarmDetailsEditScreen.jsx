import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  Layout,
  Text,
  Input,
  Button,
  Spinner,
  Divider,
} from '@ui-kitten/components';
import {useTheme} from '../../../../theme/ThemeContext';
import {useTranslation} from 'react-i18next';
import {MainScreensHeader} from '../../../../components/buyer';
import {axiosSellerClient} from '../../../../utils/axiosClient';
import {launchImageLibrary} from 'react-native-image-picker';
import {selectBaseUrls} from '../../../../store/configs';
import {useSelector} from 'react-redux';
import {ImagePicker} from '../../../../components/form';
import {ProfileActionButton} from '../../../../components/profile';
import {AppScreens} from '../../../../navigators/AppNavigator';
import {ThemedIcon} from '../../../../components/Icon';

import {getShopInfo, updateShopInfo} from '../../../../services/sellerApi';

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

export const FarmDetailsEditScreen = ({navigation}) => {
  const {theme, isDark} = useTheme();
  const {t} = useTranslation();
  const baseUrls = useSelector(selectBaseUrls);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeliveryManagement, setShowDeliveryManagement] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [showShopSettingsModal, setShowShopSettingsModal] = useState(false);
  const [selectedDeliveryMan, setSelectedDeliveryMan] = useState(null);

  const navigateToEarnings = (deliveryMan = null) => {
    navigation.navigate(AppScreens.EARNINGS_STATS, {deliveryMan});
  };

  // Shop Info State
  const [shopInfo, setShopInfo] = useState({
    name: '',
    address: '',
    contact: '',
    image: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getShopInfo();

      if (response.data) {
        setShopInfo({
          name: response.data.name || '',
          address: response.data.address || '',
          contact: response.data.contact || '',
          image: response.data.image
            ? {
                uri: `${baseUrls['shop_image_url']}/${response.data.image}`,
                name: response.data.image,
                type: 'image/jpeg',
              }
            : null,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert(
        t('farmDetailsEditScreen.alerts.errorTitle'),
        t('farmDetailsEditScreen.alerts.fetchError'),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert(
        t('farmDetailsEditScreen.alerts.permissionDenied'),
        t('farmDetailsEditScreen.alerts.storagePermission'),
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

  const handleUpdate = async () => {
    try {
      setUploading(true);

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

      // console.log("shopFormData", shopFormData);

      await updateShopInfo(shopFormData);

      Alert.alert(
        t('farmDetailsEditScreen.alerts.successTitle'),
        t('farmDetailsEditScreen.alerts.updateSuccess'),
      );
      // navigation.goBack();
    } catch (error) {
      console.error('Error updating shop data:', error);
      Alert.alert(
        t('farmDetailsEditScreen.alerts.errorTitle'),
        t('farmDetailsEditScreen.alerts.updateError'),
      );
    } finally {
      setUploading(false);
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const navigateToDeliveryManagement = () => {
    navigation.navigate(AppScreens.DELIVERY);
  };

  const navigateToOrders = (deliveryMan = null) => {
    navigation.navigate(AppScreens.ORDERS_STATS, {deliveryMan});
  };

  const navigateToReviews = (deliveryMan = null) => {
    navigation.navigate(AppScreens.REVIEWS_STATS, {deliveryMan});
  };

  const navigateToTransactions = () => {
    navigation.navigate(AppScreens.TRANSACTIONS_STATS);
  };

  const navigateToShopSettings = () => {
    navigation.navigate(AppScreens.SHOP_SETTINGS);
  };

  const closeAllModals = () => {
    setShowOrdersModal(false);
    setShowReviewsModal(false);
    setShowTransactionsModal(false);
    setShowShopSettingsModal(false);
    setSelectedDeliveryMan(null);
  };

  if (loading) {
    return (
      <Layout style={styles.loadingContainer}>
        <Spinner size="large" />
      </Layout>
    );
  }

  return (
    <Layout
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
        },
      ]}>
      {showDeliveryManagement ? (
        <Delivery onBack={() => setShowDeliveryManagement(false)} />
      ) : (
        <ScrollView style={styles.scrollView}>
          {/* Header with Back Button */}
          <View style={styles.headerRow}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('farmDetailsEditScreen.title')}
            </Text>
            <Button
              appearance="ghost"
              size="small"
              onPress={navigateToDeliveryManagement}
              style={styles.navButton}>
              {t('farmDetailsEditScreen.deliveryManagement')}
            </Button>
          </View>

          {/* Farm Management Options */}
          <Layout
            style={[
              styles.section,
              {
                backgroundColor: isDark
                  ? theme['color-shadcn-card']
                  : 'rgba(255,255,255,0.95)',
                borderRadius: 12,
              },
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
              {t('farmDetailsEditScreen.managementOptions')}
            </Text>

            <View style={styles.managementGrid}>
              <Button
                appearance="outline"
                style={styles.managementButton}
                onPress={navigateToDeliveryManagement}
                accessoryLeft={props => (
                  <ThemedIcon
                    name="car-outline"
                    iconStyle={{width: 22, height: 22}}
                  />
                )}>
                {t(
                  'farmDetailsEditScreen.managementButtons.deliveryManagement.title',
                )}
              </Button>

              <Button
                appearance="outline"
                style={styles.managementButton}
                onPress={() => navigateToEarnings()}
                accessoryLeft={props => (
                  <ThemedIcon
                    name="trending-up-outline"
                    iconStyle={{width: 22, height: 22}}
                  />
                )}>
                {t('farmDetailsEditScreen.managementButtons.earnings.title')}
              </Button>

              <Button
                appearance="outline"
                style={styles.managementButton}
                onPress={() => navigateToOrders()}
                accessoryLeft={props => (
                  <ThemedIcon
                    name="list-outline"
                    iconStyle={{width: 22, height: 22}}
                  />
                )}>
                {t('farmDetailsEditScreen.managementButtons.orders.title')}
              </Button>

              <Button
                appearance="outline"
                style={styles.managementButton}
                onPress={() => navigateToReviews()}
                accessoryLeft={props => (
                  <ThemedIcon
                    name="star-outline"
                    iconStyle={{width: 22, height: 22}}
                  />
                )}>
                {t('farmDetailsEditScreen.managementButtons.reviews.title')}
              </Button>

              <Button
                appearance="outline"
                style={styles.managementButton}
                onPress={() => navigateToTransactions()}
                accessoryLeft={props => (
                  <ThemedIcon
                    name="credit-card-outline"
                    iconStyle={{width: 22, height: 22}}
                  />
                )}>
                {t(
                  'farmDetailsEditScreen.managementButtons.transactions.title',
                )}
              </Button>

              <Button
                appearance="outline"
                style={styles.managementButton}
                onPress={() => navigateToShopSettings()}
                accessoryLeft={props => (
                  <ThemedIcon
                    name="settings-outline"
                    iconStyle={{width: 22, height: 22}}
                  />
                )}>
                {t(
                  'farmDetailsEditScreen.managementButtons.shopSettings.title',
                )}
              </Button>
            </View>
          </Layout>

          {/* Farm Details Section */}
          {/* <Layout style={[styles.section, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)',
            borderRadius: 12 
          }]}>
            <View style={styles.headerRow}>
              <Text style={[styles.sectionTitle, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>{t('common.farmDetails')}</Text>
              <Button
                appearance="ghost"
                size="small"
                onPress={toggleEditMode}
                style={styles.editButton}
              >
                {isEditMode ? 'Cancel' : 'Edit'}
              </Button>
            </View>

          <View style={styles.imageContainer}>
            <Text style={[styles.label, { 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>{t('farmImage') || 'Farm Image'}</Text>
            {isEditMode ? (
              <ImagePicker
                title={t('chooseFarmImage') || 'Choose Image'}
                onPress={handleImagePick}
                imageUri={shopInfo.image ? shopInfo.image.uri : null}
              />
            ) : (
              <View style={styles.staticImageContainer}>
                <Image
                  source={{ 
                    uri: shopInfo.image ? shopInfo.image.uri : 'https://via.placeholder.com/150?text=No+Image' 
                  }}
                  style={styles.staticImage}
                  resizeMode="cover"
                />
              </View>
            )}
            {shopInfo.image && shopInfo.image.uri && (
              <Text style={{ color: theme['color-shadcn-primary'], fontSize: 12 }}>{t('imageSelected') || 'Image selected'}</Text>
            )}
          </View>

          {isEditMode ? (
            // Edit Mode - Form Inputs
            <>
              <Input
                label="Farm Name"
                value={shopInfo.name}
                onChangeText={(text) => setShopInfo(prev => ({ ...prev, name: text }))}
                style={styles.input}
              />
              <Input
                label="Address"
                value={shopInfo.address}
                onChangeText={(text) => setShopInfo(prev => ({ ...prev, address: text }))}
                style={styles.input}
                multiline
              />
              <Input
                label="Contact"
                value={shopInfo.contact}
                onChangeText={(text) => setShopInfo(prev => ({ ...prev, contact: text }))}
                style={styles.input}
              />

              <Button
                onPress={handleUpdate}
                disabled={uploading}
                style={styles.submitButton}
              >
                {uploading ? <Spinner size='small' /> : 'Save Changes'}
              </Button>
            </>
          ) : (
            // View Mode - Static Information
            <View style={styles.staticInfo}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { 
                  color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                }]}>Farm Name:</Text>
                <Text style={[styles.infoValue, { 
                  color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                }]}>{shopInfo.name || 'Not specified'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { 
                  color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                }]}>Address:</Text>
                <Text style={[styles.infoValue, { 
                  color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                }]}>{shopInfo.address || 'Not specified'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { 
                  color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                }]}>Contact:</Text>
                <Text style={[styles.infoValue, { 
                  color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                }]}>{shopInfo.contact || 'Not specified'}</Text>
              </View>
            </View>
          )}
        </Layout> */}
        </ScrollView>
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    marginLeft: 8,
  },
  navButton: {
    marginLeft: 8,
  },
  managementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  managementButton: {
    width: '48%',
    marginBottom: 12,
    height: 110,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  buttonSubtext: {
    fontSize: 9,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 12,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  staticImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 8,
  },
  staticImage: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  staticInfo: {
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 80,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
});
