import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import {Layout, Text, Button, Icon, Spinner} from '@ui-kitten/components';
import {useTheme} from '../../../theme/ThemeContext';
import {useTranslation} from 'react-i18next';
import {axiosSellerClient} from '../../../utils/axiosClient';
import {MainScreensHeader} from '../../../components/buyer';
import {BASE_URLS} from '../../../store/configs';

const {width: windowWidth} = Dimensions.get('screen');

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

  // Prepare product images array for carousel
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

  // Get screen dimensions for fullscreen carousel
  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

  // Fullscreen Carousel Component
  const FullscreenCarousel = () => {
    const renderCarouselItem = ({item, index}) => (
      <View
        style={{
          width: screenWidth,
          height: screenHeight,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Image
          source={{uri: item.image}}
          style={{
            width: screenWidth,
            height: screenWidth, // Square aspect ratio
            resizeMode: 'contain',
          }}
        />
      </View>
    );

    return (
      <Modal
        visible={showFullscreenCarousel}
        transparent={false}
        animationType="fade"
        statusBarTranslucent={true}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'black',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {/* Close Button */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 50,
              right: 20,
              zIndex: 1000,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={closeFullscreenCarousel}>
            <Icon name="close" fill="white" style={{width: 24, height: 24}} />
          </TouchableOpacity>

          {/* Image Counter */}
          <View
            style={{
              position: 'absolute',
              top: 50,
              left: 20,
              zIndex: 1000,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 15,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}>
            <Text style={{color: 'white', fontSize: 14, fontWeight: 'bold'}}>
              {currentImageIndex + 1} / {productImages.length}
            </Text>
          </View>

          {/* Carousel */}
          <FlatList
            data={productImages}
            renderItem={renderCarouselItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={currentImageIndex}
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            onScrollToIndexFailed={() => {}}
            onMomentumScrollEnd={event => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / screenWidth,
              );
              setCurrentImageIndex(index);
            }}
          />

          {/* Navigation Dots */}
          {productImages.length > 1 && (
            <View
              style={{
                position: 'absolute',
                bottom: 50,
                left: 0,
                right: 0,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {productImages.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      index === currentImageIndex
                        ? 'white'
                        : 'rgba(255,255,255,0.3)',
                    marginHorizontal: 4,
                  }}
                  onPress={() => {
                    setCurrentImageIndex(index);
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </Modal>
    );
  };

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
            Product Images
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}>
            {/* Thumbnail Image */}
            {product.thumbnail && (
              <TouchableOpacity
                key="thumbnail"
                onPress={() => openFullscreenCarousel(0)}
                activeOpacity={0.8}>
                <Image
                  source={{
                    uri: `${BASE_URLS.product_thumbnail_url}/${product.thumbnail}`,
                  }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}

            {/* Additional Product Images */}
            {product.images &&
              product.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() =>
                    openFullscreenCarousel(
                      product.thumbnail ? index + 1 : index,
                    )
                  }
                  activeOpacity={0.8}>
                  <Image
                    source={{uri: `${BASE_URLS.product_image_url}/${image}`}}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}

            {/* Fallback if no images */}
            {!product.thumbnail &&
              (!product.images || product.images.length === 0) && (
                <View style={styles.noImageContainer}>
                  <Text
                    style={[
                      styles.noImageText,
                      {
                        color: isDark
                          ? theme['color-shadcn-muted-foreground']
                          : theme['color-basic-600'],
                      },
                    ]}>
                    No Images Available
                  </Text>
                </View>
              )}
          </ScrollView>
        </View>

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
                label="Purchase Price"
                value={`Rs ${
                  product.purchase_price?.toLocaleString() || 'N/A'
                }`}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label="Min Qty"
                value={`${product.min_qty || 'N/A'} ${product.unit}`}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label="Product Type"
                value={product.product_type || 'Physical'}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label="Refundable"
                value={product.refundable === 1 ? 'Yes' : 'No'}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label="Free Shipping"
                value={product.free_shipping === 1 ? 'Yes' : 'No'}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label="Published"
                value={product.published === 1 ? 'Yes' : 'No'}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label="Request Status"
                value={
                  product.request_status === 1
                    ? 'Approved'
                    : product.request_status === 0
                    ? 'Pending'
                    : 'Denied'
                }
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label="Reviews Count"
                value={product.reviews_count || 0}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label="Featured Status"
                value={
                  product.featured_status === 1 ? 'Featured' : 'Not Featured'
                }
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label="Discount"
                value={`${product.discount || 0}%`}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label="Tax"
                value={`${product.tax || 0}%`}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label="Shipping Cost"
                value={
                  product.shipping_cost > 0
                    ? `Rs ${product.shipping_cost}`
                    : 'Free'
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
                label="Updated"
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
                  label="Denied Note"
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
                {backgroundColor: theme['color-danger-default']},
              ]}
              onPress={handleDelete}>
              {t('productDetails.delete')}
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* Fullscreen Image Carousel */}
      <FullscreenCarousel />
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
  imageSection: {
    marginBottom: 16,
  },
  imageScroll: {
    maxHeight: 300,
  },
  productImage: {
    width: windowWidth,
    height: 300,
  },
  noImageContainer: {
    width: windowWidth,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  noImageText: {
    fontSize: 16,
    fontStyle: 'italic',
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
