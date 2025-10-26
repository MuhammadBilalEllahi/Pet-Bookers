import React, {useEffect, useState} from 'react';
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
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {
  Layout,
  Text,
  Button,
  Input,
  Spinner,
  Select,
  Toggle,
  Icon,
} from '@ui-kitten/components';
import {useTheme} from '../../theme/ThemeContext';
import {useTranslation} from 'react-i18next';
import {axiosSellerClient} from '../../utils/axiosClient';
import {MainScreensHeader} from '../../components/buyer';
import {launchImageLibrary} from 'react-native-image-picker';
import {BASE_URL} from '../../utils/constants';
import {selectBaseUrls} from '../../store/configs';
import {useSelector} from 'react-redux';
import FastImageWithFallback from '../../components/common/FastImageWithFallback';
import FastImage from '@d11/react-native-fast-image';

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

export const EditProductScreen = ({route, navigation}) => {
  const {productId} = route.params;
  const {isDark, theme} = useTheme();
  const {t, i18n} = useTranslation();
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
  const [selectedImages, setSelectedImages] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [barcodeUrl, setBarcodeUrl] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosSellerClient.get(
        `products/details/${productId}`,
      );
      // console.log("product detail response", response.data);
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
          purchase_price: productData.purchase_price?.toString() || '',
          min_qty: productData.min_qty?.toString() || '',
          multiply_qty: productData.multiply_qty?.toString() || '',
        });

        // Fix image handling - use proper image objects like in AddProductScreen
        if (productData.thumbnail) {
          setThumbnail({
            uri: `${
              baseUrls?.product_thumbnail_url || BASE_URL
            }/uploads/products/thumbnail/${productData.thumbnail}`,
            fileName: productData.thumbnail,
            type: 'image/jpeg',
          });
        }

        if (productData.images && productData.images.length > 0) {
          const imageObjects = productData.images.map(image => ({
            uri: `${
              baseUrls?.product_image_url || BASE_URL
            }/uploads/products/images/${image}`,
            fileName: image,
            type: 'image/jpeg',
          }));
          setSelectedImages(imageObjects);
        }

        // Handle tags
        if (productData.tags) {
          if (Array.isArray(productData.tags)) {
            setTags(productData.tags.map(tag => tag.tag || tag));
          } else if (typeof productData.tags === 'string') {
            setTags(productData.tags.split(',').filter(tag => tag.trim()));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert(t('common.error'), t('common.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const generateBarcode = async () => {
    try {
      const response = await axiosSellerClient.get(
        `products/barcode/generate?id=${productId}&quantity=1`,
      );
      if (response.data) {
        setBarcodeUrl(response.data);
        Linking.openURL(response.data);
      }
    } catch (error) {
      console.error('Error generating barcode:', error);
      Alert.alert(t('common.error'), t('editProduct.barcodeError'));
    }
  };

  const updateStatus = async status => {
    try {
      await axiosSellerClient.put('products/status-update', {
        id: productId,
        status: status,
      });
      setProduct(prev => ({...prev, status}));
      Alert.alert(t('common.success'), t('editProduct.statusSuccess'));
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert(t('common.error'), t('editProduct.statusError'));
    }
  };

  const updateQuantity = async quantity => {
    try {
      await axiosSellerClient.put('products/quantity-update', {
        product_id: productId,
        current_stock: quantity,
      });
      setProduct(prev => ({...prev, current_stock: quantity.toString()}));
      Alert.alert(t('common.success'), t('editProduct.quantitySuccess'));
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert(t('common.error'), t('editProduct.quantityError'));
    }
  };

  const handleImagePick = async field => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: field === 'images' ? 5 : 1,
      quality: 0.8,
    });

    if (result.assets && result.assets.length > 0) {
      if (field === 'thumbnail') {
        setThumbnail(result.assets[0]);
      } else {
        setSelectedImages(result.assets);
      }
    }
  };

  const pickImage = async type => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert(
        t('editProduct.permissionDenied'),
        t('editProduct.storagePermission'),
      );
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: type === 'images' ? 5 : 1,
    };

    try {
      const result = await launchImageLibrary(options);
      if (result.assets && result.assets.length > 0) {
        if (type === 'thumbnail') {
          setThumbnail(result.assets[0]);
        } else {
          setSelectedImages(result.assets);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(t('common.error'), t('editProduct.imagePickerError'));
    }
  };

  const uploadImage = async (imageAsset, type) => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri:
          Platform.OS === 'android'
            ? imageAsset.uri
            : imageAsset.uri.replace('file://', ''),
        name: imageAsset.fileName || `image_${Date.now()}.jpg`,
        type: imageAsset.type || 'image/jpeg',
      });
      formData.append('type', type);

      const response = await axiosSellerClient.post(
        'products/upload-images',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return response.data.image_name;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const newTags = tagInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
      setTags([...tags, ...newTags]);
      setTagInput('');
    }
  };

  const handleRemoveTag = index => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Upload thumbnail if changed (only if it's a new image)
      let thumbnailName = product.thumbnail;
      if (
        thumbnail &&
        typeof thumbnail === 'object' &&
        thumbnail.uri &&
        !thumbnail.fileName
      ) {
        thumbnailName = await uploadImage(thumbnail, 'thumbnail');
      } else if (
        thumbnail &&
        typeof thumbnail === 'object' &&
        thumbnail.fileName
      ) {
        // If it's an existing image, just use the filename
        thumbnailName = thumbnail.fileName;
      }

      // Upload new images if any (only new ones, not existing ones)
      const newImages = selectedImages.filter(
        img => typeof img === 'object' && img.uri && !img.fileName,
      );
      const uploadedImages = await Promise.all(
        newImages.map(img => uploadImage(img, 'product')),
      );

      // Get existing image filenames
      const existingImages = selectedImages
        .filter(img => typeof img === 'object' && img.fileName)
        .map(img => img.fileName);

      // Validate required fields
      if (!product.name || !product.name.trim()) {
        Alert.alert(t('common.error'), 'Product name is required');
        return;
      }

      if (!product.unit_price || isNaN(parseFloat(product.unit_price))) {
        Alert.alert(t('common.error'), 'Valid price is required');
        return;
      }

      const updatedProduct = {
        ...product,
        thumbnail: thumbnailName,
        images: [...existingImages, ...uploadedImages],
        unit_price: parseFloat(product.unit_price),
        current_stock: parseInt(product.current_stock) || 0,
        minimum_order_qty: parseInt(product.minimum_order_qty) || 1,
        discount: parseFloat(product.discount) || 0,
        shipping_cost: parseFloat(product.shipping_cost) || 0,
        tax: parseFloat(product.tax) || 0,
        purchase_price: parseFloat(product.purchase_price) || 0,
        min_qty: parseInt(product.min_qty) || 1,
        tags: tags.join(','),
      };

      // console.log('Sending product data:', updatedProduct);
      await axiosSellerClient.put(
        `products/update/${productId}`,
        updatedProduct,
      );
      Alert.alert(t('common.success'), t('editProduct.success'));
      navigation.goBack();
    } catch (error) {
      console.error('Error updating product:', error);
      console.error('Error details:', error.response?.data);
      Alert.alert(t('common.error'), t('editProduct.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      t('productDetails.confirmDelete'),
      t('productDetails.confirmDelete'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('productDetails.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosSellerClient.delete(`products/delete/${productId}`);
              Alert.alert(
                t('common.success'),
                t('productDetails.deleteSuccess'),
              );
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert(t('common.error'), t('productDetails.deleteError'));
            }
          },
        },
      ],
    );
  };
  const baseUrls = useSelector(selectBaseUrls);

  if (loading) {
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
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
        </View>
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
      {/* <MainScreensHeader
        title={t('editProduct.title')}
        showBackButton
        rightIcon="trash-2-outline"
        onRightIconPress={handleDelete}
      /> */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          {/* Status Toggle */}
          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.statusLabel,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('editProduct.status')}
            </Text>
            <Toggle
              checked={product.status === 1}
              onChange={checked => updateStatus(checked ? 1 : 0)}
              style={styles.toggle}
            />
          </View>

          {/* Featured Toggle */}
          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.statusLabel,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('editProduct.featured')}
            </Text>
            <Toggle
              checked={product.featured_status === 1}
              onChange={checked =>
                setProduct(prev => ({
                  ...prev,
                  featured_status: checked ? 1 : 0,
                }))
              }
              style={styles.toggle}
              disabled={true}
            />
          </View>

          {/* Basic Information */}
          <Input
            label={t('editProduct.name')}
            value={product.name}
            onChangeText={text => setProduct({...product, name: text})}
            style={styles.input}
            textStyle={{
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            }}
          />

          <Input
            label={t('editProduct.details')}
            value={product.details}
            onChangeText={text => setProduct({...product, details: text})}
            multiline
            textStyle={{
              height: 100,
              textAlignVertical: 'top',
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            }}
            style={styles.input}
          />

          {/* Price and Stock */}
          <View style={styles.rowContainer}>
            <Input
              label={t('editProduct.price')}
              value={product.unit_price}
              onChangeText={text => setProduct({...product, unit_price: text})}
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              }}
            />

            <Input
              label={t('editProduct.stock')}
              value={product.current_stock}
              onChangeText={text =>
                setProduct({...product, current_stock: text})
              }
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              }}
            />
          </View>

          {/* Minimum Order and Unit */}
          <View style={styles.rowContainer}>
            <Input
              label={t('editProduct.minOrder')}
              value={product.minimum_order_qty}
              onChangeText={text =>
                setProduct({...product, minimum_order_qty: text})
              }
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              }}
            />

            <Input
              label={t('editProduct.unit')}
              value={product.unit}
              onChangeText={text => setProduct({...product, unit: text})}
              style={[styles.input, styles.halfInput]}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              }}
            />
          </View>

          {/* Code and Tax */}
          <View style={styles.rowContainer}>
            <Input
              label={t('editProduct.code')}
              value={product.code}
              onChangeText={text => setProduct({...product, code: text})}
              style={[styles.input, styles.halfInput]}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              }}
            />

            <Input
              label={t('editProduct.tax')}
              value={product.tax}
              onChangeText={text => setProduct({...product, tax: text})}
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              }}
            />
          </View>

          {/* Discount and Shipping */}
          <View style={styles.rowContainer}>
            <Input
              label={t('editProduct.discount')}
              value={product.discount}
              onChangeText={text => setProduct({...product, discount: text})}
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              }}
            />

            <Input
              label={t('editProduct.shippingCost')}
              value={product.shipping_cost}
              onChangeText={text =>
                setProduct({...product, shipping_cost: text})
              }
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              }}
            />
          </View>

          {/* Additional Product Information */}
          <View style={styles.rowContainer}>
            <Input
              label="Purchase Price"
              value={product.purchase_price?.toString() || ''}
              onChangeText={text =>
                setProduct({...product, purchase_price: text})
              }
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              }}
            />

            <Input
              label="Min Qty"
              value={product.min_qty?.toString() || ''}
              onChangeText={text => setProduct({...product, min_qty: text})}
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              }}
            />
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            <Text
              style={[
                styles.tagsLabel,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              Tags
            </Text>
            <View style={styles.tagsInputContainer}>
              <TextInput
                style={[
                  styles.tagsInput,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                    borderColor: isDark
                      ? theme['color-shadcn-border']
                      : theme['color-basic-300'],
                  },
                ]}
                placeholder="Add tags (comma separated)"
                placeholderTextColor={
                  isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-500']
                }
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
              />
              <Button
                size="small"
                onPress={handleAddTag}
                style={styles.addTagButton}>
                Add
              </Button>
            </View>
            <ScrollView
              style={styles.tagsList}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}>
              <View style={styles.tagsRow}>
                {tags.map((tag, index) => (
                  <View
                    key={index}
                    style={[
                      styles.tag,
                      {
                        backgroundColor: isDark
                          ? theme['color-shadcn-secondary']
                          : theme['color-basic-200'],
                      },
                    ]}>
                    <Text
                      style={[
                        styles.tagText,
                        {
                          color: isDark
                            ? theme['color-shadcn-foreground']
                            : theme['color-basic-900'],
                        },
                      ]}>
                      {tag}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveTag(index)}>
                      <Icon
                        name="close"
                        size={16}
                        fill={
                          isDark
                            ? theme['color-shadcn-foreground']
                            : theme['color-basic-900']
                        }
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Product Type and Status Information */}
          <View style={styles.infoSection}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              Product Information
            </Text>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                Product Type:
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {product.product_type || 'Physical'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                Refundable:
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {product.refundable === 1 ? 'Yes' : 'No'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                Free Shipping:
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {product.free_shipping === 1 ? 'Yes' : 'No'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                Published:
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {product.published === 1 ? 'Yes' : 'No'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                Request Status:
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {product.request_status === 1
                  ? 'Approved'
                  : product.request_status === 0
                  ? 'Pending'
                  : 'Denied'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                Reviews Count:
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {product.reviews_count || 0}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                Created:
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {product.created_at
                  ? new Date(product.created_at).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                Updated:
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {product.updated_at
                  ? new Date(product.updated_at).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </View>
            {product.denied_note && (
              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    {
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600'],
                    },
                  ]}>
                  Denied Note:
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    {color: theme['color-danger-default']},
                  ]}>
                  {product.denied_note}
                </Text>
              </View>
            )}
          </View>

          {/* Images Section */}
          <View style={styles.imageSection}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('editProduct.thumbnail')}
            </Text>
            <TouchableOpacity
              onPress={() => pickImage('thumbnail')}
              style={styles.imageUploadButton}>
              {thumbnail ? (
                <FastImageWithFallback
                  priority={FastImage.priority.high}
                  resizeMode={FastImage.resizeMode.cover}
                  source={{uri: thumbnail.uri || thumbnail}}
                  fallbackSource={{
                    uri: 'https://via.placeholder.com/120x120?text=No+Image',
                  }}
                  style={styles.thumbnail}
                />
              ) : (
                <Text style={{color: theme['color-shadcn-primary']}}>
                  {t('editProduct.uploadThumbnail')}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.imageSection}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('editProduct.images')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imagesScroll}>
              {selectedImages.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <FastImageWithFallback
                    priority={FastImage.priority.high}
                    resizeMode={FastImage.resizeMode.cover}
                    source={{uri: image.uri || image}}
                    fallbackSource={{
                      uri: 'https://via.placeholder.com/120x120?text=No+Image',
                    }}
                    style={styles.productImage}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() =>
                      setSelectedImages(
                        selectedImages.filter((_, i) => i !== index),
                      )
                    }>
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => pickImage('images')}
                style={styles.addImageButton}>
                <Text style={{color: theme['color-shadcn-primary']}}>+</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Barcode Section */}
          <View style={styles.barcodeSection}>
            <Button
              style={[
                styles.barcodeButton,
                {backgroundColor: theme['color-shadcn-primary']},
              ]}
              onPress={generateBarcode}>
              {t('editProduct.generateBarcode')}
            </Button>
          </View>

          <Button
            style={[
              styles.saveButton,
              {backgroundColor: theme['color-shadcn-primary']},
            ]}
            onPress={handleSave}
            disabled={saving}>
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
    height: 200,
    width: 200,
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
  infoSection: {
    marginTop: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
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
  tagsContainer: {
    marginBottom: 16,
  },
  tagsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagsInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
  },
  addTagButton: {
    paddingHorizontal: 16,
  },
  tagsList: {
    maxHeight: 120,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    fontSize: 14,
  },
});
