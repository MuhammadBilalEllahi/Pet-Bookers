import React, { useEffect, useState } from 'react';
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
} from '@ui-kitten/components';
import { useTheme } from '../../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { MainScreensHeader } from '../../../../components/buyer';
import { axiosSellerClient } from '../../../../utils/axiosClient';
import { launchImageLibrary } from 'react-native-image-picker';
import { selectBaseUrls } from '../../../../store/configs';
import { useSelector } from 'react-redux';
import { ImagePicker } from '../../../../components/form';

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

export const FarmDetailsEditScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const baseUrls = useSelector(selectBaseUrls);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      const response = await axiosSellerClient.get('/shop-info');

      if (response.data) {
        setShopInfo({
          name: response.data.name || '',
          address: response.data.address || '',
          contact: response.data.contact || '',
          image: response.data.image ? {
            uri: `${baseUrls['shop_image_url']}/${response.data.image}`,
            name: response.data.image,
            type: 'image/jpeg'
          } : null,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch shop data');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Storage permission is required to upload images');
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
        }
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
          uri: Platform.OS === 'ios' ? shopInfo.image.uri.replace('file://', '') : shopInfo.image.uri,
          type: shopInfo.image.type,
          name: shopInfo.image.name,
        });
      }

      console.log("shopFormData", shopFormData);

      await axiosSellerClient.put('shop-update', shopFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Farm details updated successfully');
      // navigation.goBack();
    } catch (error) {
      console.error('Error updating shop data:', error);
      Alert.alert('Error', 'Failed to update farm details');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Layout style={styles.loadingContainer}>
        <Spinner size='large' />
      </Layout>
    );
  }

  return (
    <Layout style={[styles.container, { 
      backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']
    }]}>
      <ScrollView style={styles.scrollView}>
        <Layout style={styles.section}>
          <View style={styles.imageContainer}>
            <Text style={[styles.label, { 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>{t('farmImage') || 'Farm Image'}</Text>
            <ImagePicker
              title={t('chooseFarmImage') || 'Choose Image'}
              onPress={handleImagePick}
              imageUri={shopInfo.image ? shopInfo.image.uri : null}
            />
            {shopInfo.image && shopInfo.image.uri && (
              <Text style={{ color: theme['color-shadcn-primary'], fontSize: 12 }}>{t('imageSelected') || 'Image selected'}</Text>
            )}
          </View>

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
        </Layout>
      </ScrollView>
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
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
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
}); 