import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Linking,
  PermissionsAndroid,
} from 'react-native';
import { Layout, Text, Button, Input, Spinner, Select, Toggle } from '@ui-kitten/components';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { axiosSellerClient } from '../../utils/axiosClient';
import { MainScreensHeader } from '../../components/buyer';
import { launchImageLibrary } from 'react-native-image-picker';
import { BASE_URL } from '../../utils/constants';
import { selectBaseUrls } from '../../store/configs';
import { useSelector } from 'react-redux';

export const EditProductScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const { isDark, theme } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState({
    name: '',
    details: '',
    unit_price: '',
    current_stock: '',
    minimum_order_qty: '',
    unit: '',
    category_id: '',
    sub_category_id: '',
    sub_sub_category_id: '',
    brand_id: '',
    product_type: 'physical',
    code: '',
    tax: '',
    tax_type: 'percent',
    tax_model: 'exclude',
    discount: '',
    discount_type: 'percent',
    shipping_cost: '',
    thumbnail: '',
    images: [],
    colors: [],
    attributes: [],
    choice_options: [],
    variation: [],
    meta_title: '',
    meta_description: '',
    meta_image: '',
    video_link: '',
    status: 1,
    featured_status: 0,
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [barcodeUrl, setBarcodeUrl] = useState(null);

  useEffect(() => {
    fetchProductDetails();
    fetchCategories();
    fetchBrands();
    fetchReviews();
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const response = await axiosSellerClient.get('categories/list');
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axiosSellerClient.get('brands/list');
      if (response.data) {
        setBrands(response.data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axiosSellerClient.get(`products/review-list/${productId}`);
      if (response.data) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosSellerClient.get(`products/details/${productId}`);
      if (response.data) {
        const productData = response.data;
        setProduct({
          ...productData,
          unit_price: productData.unit_price?.toString() || '',
          current_stock: productData.current_stock?.toString() || '',
          minimum_order_qty: productData.minimum_order_qty?.toString() || '',
          discount: productData.discount?.toString() || '',
          shipping_cost: productData.shipping_cost?.toString() || '',
          tax: productData.tax?.toString() || '',
        });
        setThumbnail(`${baseUrls['product_thumbnail_url']}/${productData.thumbnail}`);
        // console.log('thumbnailll', `${baseUrls['product_thumbnail_url']}/${productData.thumbnail}`, "thumbnail", productData.thumbnail);
        setSelectedImages(productData.images.map(image => `${baseUrls['product_image_url']}/${image.replace('product/', '')}`));
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const generateBarcode = async () => {
    try {
      const response = await axiosSellerClient.get(`products/barcode/generate?id=${productId}&quantity=1`);
      if (response.data) {
        setBarcodeUrl(response.data);
        Linking.openURL(response.data);
      }
    } catch (error) {
      console.error('Error generating barcode:', error);
      Alert.alert('Error', 'Failed to generate barcode');
    }
  };

  const updateStatus = async (status) => {
    try {
      await axiosSellerClient.put('products/status-update', {
        id: productId,
        status: status
      });
      setProduct(prev => ({ ...prev, status }));
      Alert.alert('Success', 'Product status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update product status');
    }
  };

  const updateQuantity = async (quantity) => {
    try {
      await axiosSellerClient.put('products/quantity-update', {
        product_id: productId,
        current_stock: quantity
      });
      setProduct(prev => ({ ...prev, current_stock: quantity.toString() }));
      Alert.alert('Success', 'Product quantity updated successfully');
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update product quantity');
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

  const pickImage = async (type) => {
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
        if (type === 'thumbnail') {
          setThumbnail(`${baseUrls['product_thumbnail_url']}/${source.uri}`);
        } else {
          setSelectedImages([...selectedImages, `${baseUrls['product_image_url']}/${source.uri}`]);
        }
      }
    });
  };

  const uploadImage = async (uri, type) => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        type: 'image/jpeg',
        name: 'image.jpg',
      });
      formData.append('type', type);

      const response = await axiosSellerClient.post('products/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.image_name;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Upload thumbnail if changed
      let thumbnailName = product.thumbnail;
      if (thumbnail && thumbnail !== product.thumbnail) {
        thumbnailName = await uploadImage(thumbnail, 'thumbnail');
      }

      // Upload new images if any
      const newImages = selectedImages.filter(img => !product.images.includes(img));
      const uploadedImages = await Promise.all(
        newImages.map(img => uploadImage(img, 'product'))
      );

      const updatedProduct = {
        ...product,
        thumbnail: thumbnailName,
        images: [...product.images, ...uploadedImages],
        unit_price: parseFloat(product.unit_price),
        current_stock: parseInt(product.current_stock),
        minimum_order_qty: parseInt(product.minimum_order_qty),
        discount: parseFloat(product.discount),
        shipping_cost: parseFloat(product.shipping_cost),
        tax: parseFloat(product.tax),
      };

      await axiosSellerClient.put(`products/update/${productId}`, updatedProduct);
      Alert.alert('Success', 'Product updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosSellerClient.delete(`products/delete/${productId}`);
              Alert.alert('Success', 'Product deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };
  const baseUrls = useSelector(selectBaseUrls);


  if (loading) {
    return (
      <Layout style={[styles.container, { backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }]}>
        <View style={styles.loadingContainer}>
          <Spinner size='large' />
        </View>
      </Layout>
    );
  }

  return (
    <Layout style={[styles.container, { backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }]}>
      {/* <MainScreensHeader
        title={t('editProduct.title')}
        showBackButton
        rightIcon="trash-2-outline"
        onRightIconPress={handleDelete}
      /> */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.formContainer}>
          {/* Status Toggle */}
          <View style={styles.statusContainer}>
            <Text style={[styles.statusLabel, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
              {t('editProduct.status')}
            </Text>
            <Toggle
              checked={product.status === 1}
              onChange={(checked) => updateStatus(checked ? 1 : 0)}
              style={styles.toggle}
            />
          </View>

          {/* Featured Toggle */}
          <View style={styles.statusContainer}>
            <Text style={[styles.statusLabel, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
              {t('editProduct.featured')}
            </Text>
            <Toggle
              checked={product.featured_status === 1}
              onChange={(checked) => setProduct(prev => ({ ...prev, featured_status: checked ? 1 : 0 }))}
              style={styles.toggle}
            />
          </View>

          {/* Basic Information */}
          <Input
            label={t('editProduct.name')}
            value={product.name}
            onChangeText={(text) => setProduct({ ...product, name: text })}
            style={styles.input}
            textStyle={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}
          />

          <Input
            label={t('editProduct.details')}
            value={product.details}
            onChangeText={(text) => setProduct({ ...product, details: text })}
            multiline
            textStyle={{ height: 100, textAlignVertical: 'top', color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}
            style={styles.input}
          />

          {/* Price and Stock */}
          <View style={styles.rowContainer}>
            <Input
              label={t('editProduct.price')}
              value={product.unit_price}
              onChangeText={(text) => setProduct({ ...product, unit_price: text })}
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}
            />

            <Input
              label={t('editProduct.stock')}
              value={product.current_stock}
              onChangeText={(text) => setProduct({ ...product, current_stock: text })}
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}
            />
          </View>

          {/* Minimum Order and Unit */}
          <View style={styles.rowContainer}>
            <Input
              label={t('editProduct.minOrder')}
              value={product.minimum_order_qty}
              onChangeText={(text) => setProduct({ ...product, minimum_order_qty: text })}
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}
            />

            <Input
              label={t('editProduct.unit')}
              value={product.unit}
              onChangeText={(text) => setProduct({ ...product, unit: text })}
              style={[styles.input, styles.halfInput]}
              textStyle={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}
            />
          </View>

          {/* Code and Tax */}
          <View style={styles.rowContainer}>
            <Input
              label={t('editProduct.code')}
              value={product.code}
              onChangeText={(text) => setProduct({ ...product, code: text })}
              style={[styles.input, styles.halfInput]}
              textStyle={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}
            />

            <Input
              label={t('editProduct.tax')}
              value={product.tax}
              onChangeText={(text) => setProduct({ ...product, tax: text })}
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}
            />
          </View>

          {/* Discount and Shipping */}
          <View style={styles.rowContainer}>
            <Input
              label={t('editProduct.discount')}
              value={product.discount}
              onChangeText={(text) => setProduct({ ...product, discount: text })}
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}
            />

            <Input
              label={t('editProduct.shippingCost')}
              value={product.shipping_cost}
              onChangeText={(text) => setProduct({ ...product, shipping_cost: text })}
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}
            />
          </View>

          {/* Images Section */}
          <View style={styles.imageSection}>
            <Text style={[styles.sectionTitle, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
              {t('editProduct.thumbnail')}
            </Text>
            <TouchableOpacity onPress={() => pickImage('thumbnail')} style={styles.imageUploadButton}>
              {thumbnail ? (
                <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
              ) : (
                <Text style={{ color: theme['color-shadcn-primary'] }}>{t('editProduct.uploadThumbnail')}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.imageSection}>
            {console.log('selectedImages', selectedImages)}
            <Text style={[styles.sectionTitle, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
              {t('editProduct.images')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
              {selectedImages.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: `${baseUrls['product_image_url']}/${image}` }} style={styles.productImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={() => pickImage('product')} style={styles.addImageButton}>
                <Text style={{ color: theme['color-shadcn-primary'] }}>+</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Barcode Section */}
          <View style={styles.barcodeSection}>
            <Button
              style={[styles.barcodeButton, { backgroundColor: theme['color-shadcn-primary'] }]}
              onPress={generateBarcode}
            >
              {t('editProduct.generateBarcode')}
            </Button>
          </View>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <View style={styles.reviewsSection}>
              <Text style={[styles.sectionTitle, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
                {t('editProduct.reviews')}
              </Text>
              {reviews.map((review, index) => (
                <View key={index} style={styles.reviewItem}>
                  <Text style={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}>
                    {review.customer?.f_name} {review.customer?.l_name}
                  </Text>
                  <Text style={{ color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }}>
                    {review.comment}
                  </Text>
                  <Text style={{ color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }}>
                    Rating: {review.rating}/5
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Button
            style={[styles.saveButton, { backgroundColor: theme['color-shadcn-primary'] }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? t('editProduct.saving') : t('editProduct.save')}
          </Button>
        </View>
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
  scrollContent: {
    padding: 16,
  },
  formContainer: {
    gap: 16,
  },
  input: {
    marginBottom: 8,
  },
  saveButton: {
    marginTop: 16,
  },
  imageSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  imageUploadButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 8,
  },
  imagesScroll: {
    flexDirection: 'row',
    marginTop: 8,
  },
  imageContainer: {
    marginRight: 8,
    position: 'relative',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'red',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
  },
  toggle: {
    marginLeft: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  halfInput: {
    flex: 1,
  },
  barcodeSection: {
    marginTop: 16,
  },
  barcodeButton: {
    marginBottom: 16,
  },
  reviewsSection: {
    marginTop: 16,
  },
  reviewItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
  },
}); 