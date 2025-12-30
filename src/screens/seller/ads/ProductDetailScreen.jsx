import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Layout, Text, Button, Icon, Spinner} from '@ui-kitten/components';
import {useTheme} from '../../../theme/ThemeContext';
import {useTranslation} from 'react-i18next';
import {axiosSellerClient} from '../../../utils/axiosClient';
import {MainScreensHeader} from '../../../components/buyer';
import {
  ProductImagesSlider,
  FullscreenImageCarousel,
} from '../../../components/product';
import {BASE_URLS} from '../../../store/configs';

export const ProductDetailScreen = ({route, navigation}) => {
  const {productId} = route.params;
  const {isDark, theme} = useTheme();
  const {t, i18n} = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [showFullscreenCarousel, setShowFullscreenCarousel] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // console.log('productId in ProductDetailScreen', productId);

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
        setProduct(response.data);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert(t('common.error'), t('common.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditProduct', {productId});
  };

  const handleDelete = () => {
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

  // Handle fullscreen image carousel
  const openFullscreenCarousel = (index = 0) => {
    setCurrentImageIndex(index);
    setShowFullscreenCarousel(true);
  };

  const closeFullscreenCarousel = () => {
    setShowFullscreenCarousel(false);
  };

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

  if (!product) {
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
        <View style={styles.errorContainer}>
          <Text
            style={{
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            }}>
            {t('product.noDataAvailable')}
          </Text>
        </View>
      </Layout>
    );
  }
  // Prepare product images array for ProductImagesSlider
  const productImages = [];

  // Add thumbnail first if it exists
  if (product.thumbnail) {
    productImages.push({
      id: 'thumbnail',
      image: `${BASE_URLS.product_thumbnail_url}/${product.thumbnail}`,
    });
  }

  // Add additional images
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((image, index) => {
      productImages.push({
        id: `image_${index}`,
        image: `${BASE_URLS.product_image_url}/${image}`,
      });
    });
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Product Images */}
        <ProductImagesSlider
          slideList={productImages}
          onImagePress={openFullscreenCarousel}
        />

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text
            style={[
              styles.productName,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            {product.name}
          </Text>
          <Text
            style={[
              styles.price,
              {
                color: isDark
                  ? theme['color-shadcn-primary']
                  : theme['color-primary-500'],
              },
            ]}>
            Rs {product.unit_price?.toLocaleString()}
          </Text>

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  product.status === 1
                    ? theme['color-success-default']
                    : theme['color-warning-default'],
              },
            ]}>
            <Text
              style={[styles.statusText, {color: theme['color-basic-100']}]}>
              {product.status === 1
                ? t('productDetails.active')
                : t('productDetails.inactive')}
            </Text>
          </View>

          {/* Details Section */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('productDetails.description')}
            </Text>
            <Text
              style={[
                styles.detailsText,
                {
                  color: isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600'],
                },
              ]}>
              {product.details}
            </Text>
          </View>

          {/* Specifications */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('productDetails.specifications')}
            </Text>
            <View style={styles.specsContainer}>
              <SpecItem
                label={t('productDetails.stock')}
                value={`${product.current_stock} ${product.unit}`}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label={t('productDetails.unit')}
                value={product.unit}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label={t('productDetails.minOrder')}
                value={`${product.minimum_order_qty} ${product.unit}`}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label={t('editProduct.purchasePrice')}
                value={`Rs ${
                  product.purchase_price?.toLocaleString() || t('common.notAvailable')
                }`}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label={t('editProduct.minQty')}
                value={`${product.min_qty || t('common.notAvailable')} ${product.unit}`}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label={t('product.productType')}
                value={product.product_type || t('editProduct.physical')}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label={t('product.refundable')}
                value={product.refundable === 1 ? t('product.yes') : t('product.no')}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label={t('product.freeShipping')}
                value={product.free_shipping === 1 ? t('product.yes') : t('product.no')}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label={t('product.published')}
                value={product.published === 1 ? t('product.yes') : t('product.no')}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label={t('editProduct.requestStatus')}
                value={
                  product.request_status === 1
                    ? t('common.approved')
                    : product.request_status === 0
                    ? t('common.pending')
                    : t('common.rejected')
                }
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label={t('editProduct.reviewsCount')}
                value={product.reviews_count || 0}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label={t('editProduct.featuredStatus')}
                value={
                  product.featured_status === 1 ? t('featured') : t('editProduct.notFeatured')
                }
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label={t('editProduct.discount')}
                value={`${product.discount || 0}%`}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label={t('editProduct.tax')}
                value={`${product.tax || 0}%`}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label={t('editProduct.shippingCost')}
                value={
                  product.shipping_cost > 0
                    ? `Rs ${product.shipping_cost}`
                    : t('product.free')
                }
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label={t('product.created')}
                value={new Date(product.created_at).toLocaleDateString()}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label={t('editProduct.updated')}
                value={new Date(product.updated_at).toLocaleDateString()}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label={t('productDetails.status')}
                value={
                  product.status === 1
                    ? t('productDetails.active')
                    : t('productDetails.inactive')
                }
                isDark={isDark}
                theme={theme}
              />
              {product.denied_note && (
                <SpecItem
                  label={t('editProduct.deniedNote')}
                  value={product.denied_note}
                  isDark={isDark}
                  theme={theme}
                  valueColor={theme['color-danger-default']}
                />
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              style={[
                styles.editButton,
                {backgroundColor: theme['color-shadcn-primary']},
              ]}
              onPress={handleEdit}>
              {t('productDetails.edit')}
            </Button>
            <Button
              style={[
                styles.deleteButton,
                // {backgroundColor: isDark ? theme['color-danger-default'] : theme['color-danger-primary']},
              ]}
              onPress={handleDelete}>
              <Text style={{color: isDark? '#FFFFFF' : '#000000'}}>{t('productDetails.delete')}</Text>
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* Fullscreen Image Carousel */}
      <FullscreenImageCarousel
        visible={showFullscreenCarousel}
        images={productImages}
        initialIndex={currentImageIndex}
        onClose={closeFullscreenCarousel}
        onImageIndexChange={setCurrentImageIndex}
      />
    </Layout>
  );
};

const SpecItem = ({label, value, isDark, theme, valueColor}) => (
  <View style={styles.specItem}>
    <Text
      style={[
        styles.specLabel,
        {
          color: isDark
            ? theme['color-shadcn-muted-foreground']
            : theme['color-basic-600'],
        },
      ]}>
      {label}
    </Text>
    <Text
      style={[
        styles.specValue,
        {
          color:
            valueColor ||
            (isDark
              ? theme['color-shadcn-foreground']
              : theme['color-basic-900']),
        },
      ]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 52,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  infoContainer: {
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailsText: {
    fontSize: 16,
    lineHeight: 24,
  },
  specsContainer: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 16,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  specLabel: {
    fontSize: 14,
  },
  specValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  editButton: {
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    flex: 1,
    marginLeft: 8,
  },
});
