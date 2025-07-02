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

export const SellerInfoScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const baseUrls = useSelector(selectBaseUrls);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Seller Info State
  const [sellerInfo, setSellerInfo] = useState({
    f_name: '',
    l_name: '',
    phone: '',
    bank_name: '',
    branch: '',
    account_no: '',
    holder_name: '',
    image: '',
    password: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosSellerClient.get('/seller-info');

      if (response.data) {
        setSellerInfo({
          f_name: response.data.f_name || '',
          l_name: response.data.l_name || '',
          phone: response.data.phone || '',
          bank_name: response.data.bank_name || '',
          branch: response.data.branch || '',
          account_no: response.data.account_no || '',
          holder_name: response.data.holder_name || '',
          image: response.data.image || '',
          password: '',
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch seller data');
    } finally {
      setLoading(false);
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: "Storage Permission",
            message: "App needs access to your storage to upload images.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Storage permission is required to upload images');
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 1000,
      maxWidth: 1000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        Alert.alert('Error', 'Failed to pick image');
      } else if (response.assets && response.assets[0]) {
        const source = response.assets[0];
        setSellerInfo(prev => ({ ...prev, image: source.uri }));
      }
    });
  };

  const handleUpdate = async () => {
    try {
      setUploading(true);

      const sellerFormData = new FormData();
      sellerFormData.append('f_name', sellerInfo.f_name);
      sellerFormData.append('l_name', sellerInfo.l_name);
      sellerFormData.append('phone', sellerInfo.phone);
      sellerFormData.append('bank_name', sellerInfo.bank_name);
      sellerFormData.append('branch', sellerInfo.branch);
      sellerFormData.append('account_no', sellerInfo.account_no);
      sellerFormData.append('holder_name', sellerInfo.holder_name);
      if (sellerInfo.password) {
        sellerFormData.append('password', sellerInfo.password);
      }
      if (sellerInfo.image && sellerInfo.image.startsWith('file://')) {
        sellerFormData.append('image', {
          uri: Platform.OS === 'ios' ? sellerInfo.image.replace('file://', '') : sellerInfo.image,
          type: 'image/jpeg',
          name: 'image.jpg',
        });
      }

      await axiosSellerClient.put('/seller-update', sellerFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Seller information updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating seller data:', error);
      Alert.alert('Error', 'Failed to update seller information');
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
      <MainScreensHeader navigation={navigation} title="Seller Information" />
      <ScrollView style={styles.scrollView}>
        <Layout style={styles.section}>
          <View style={styles.imageContainer}>
            <Image
              source={{ 
                uri: sellerInfo.image 
                  ? sellerInfo.image.startsWith('file://') 
                    ? sellerInfo.image 
                    : `${baseUrls['shop_image_url']}/${sellerInfo.image}`
                  : 'https://randomuser.me/api/portraits/men/1.jpg'
              }}
              style={styles.profileImage}
            />
            <Button
              size="small"
              onPress={pickImage}
              style={styles.imageButton}
            >
              Change Photo
            </Button>
          </View>

          <Input
            label="First Name"
            value={sellerInfo.f_name}
            onChangeText={(text) => setSellerInfo(prev => ({ ...prev, f_name: text }))}
            style={styles.input}
          />
          <Input
            label="Last Name"
            value={sellerInfo.l_name}
            onChangeText={(text) => setSellerInfo(prev => ({ ...prev, l_name: text }))}
            style={styles.input}
          />
          <Input
            label="Phone"
            value={sellerInfo.phone}
            onChangeText={(text) => setSellerInfo(prev => ({ ...prev, phone: text }))}
            style={styles.input}
          />
          <Input
            label="Bank Name"
            value={sellerInfo.bank_name}
            onChangeText={(text) => setSellerInfo(prev => ({ ...prev, bank_name: text }))}
            style={styles.input}
          />
          <Input
            label="Branch"
            value={sellerInfo.branch}
            onChangeText={(text) => setSellerInfo(prev => ({ ...prev, branch: text }))}
            style={styles.input}
          />
          <Input
            label="Account Number"
            value={sellerInfo.account_no}
            onChangeText={(text) => setSellerInfo(prev => ({ ...prev, account_no: text }))}
            style={styles.input}
          />
          <Input
            label="Account Holder Name"
            value={sellerInfo.holder_name}
            onChangeText={(text) => setSellerInfo(prev => ({ ...prev, holder_name: text }))}
            style={styles.input}
          />
          <Input
            label="New Password (Optional)"
            value={sellerInfo.password}
            onChangeText={(text) => setSellerInfo(prev => ({ ...prev, password: text }))}
            style={styles.input}
            secureTextEntry
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  imageButton: {
    marginTop: 8,
  },
  input: {
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
}); 