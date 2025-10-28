import {
  Button,
  Divider,
  Icon,
  Layout,
  Text,
  useTheme as useUIKittenTheme,
} from '@ui-kitten/components';
import {useTheme} from '../../../theme/ThemeContext';
import {useTranslation} from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
  Share,
  Modal,
  Dimensions,
  Linking,
} from 'react-native';
import {AirbnbRating} from 'react-native-ratings';
import {ProductsList} from '../../../components/buyer/ProductsList';
import {ThemedIcon} from '../../../components/Icon';
import {Price} from '../../../components/Price';
import {ProductImagesSlider} from '../../../components/product';
import {flexeStyles, spacingStyles} from '../../../utils/globalStyles';
import React, {useCallback, useEffect, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {axiosBuyerClient} from '../../../utils/axiosClient';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';

import {
  loadSellerProducts,
  selectSellerProducts,
} from '../../../store/sellerDetails';
import {
  addToWishlist,
  removeFromWishlist,
  selectIsInWishlist,
} from '../../../store/wishlist';
import {calculateDiscountedPrice} from '../../../utils/products';
import {BASE_URLS} from '../../../store/configs';
import {selectProductCategories} from '../../../store/productCategories';
import {setActiveRoom} from '../../../store/chat';
import {setBottomTabBarVisibility} from '../../../store/configs';
import {
  selectIsBuyerAuthenticated,
  selectIsSellerAuthenticated,
  selectCustomerInfo,
} from '../../../store/user';
import ProductDetailShimmer from './components/ProductDetailShimmer';
import {
  smartBuyerClient,
  handleAuthError,
  setAuthModalHandlers,
} from '../../../utils/authAxiosClient';
import Toast from 'react-native-toast-message';
import {ChatRoutes} from '../../../navigators/ChatNavigator';
import {AppScreens} from '../../../navigators/AppNavigator';

/**
 * Type definitions for better type safety
 * These are JSDoc comments that provide TypeScript-like type checking
 */

/**
 * @typedef {Object} Seller
 * @property {number} id - Seller ID
 * @property {Object} shop - Shop information
 * @property {string} shop.name - Shop name
 * @property {string} shop.image - Shop image
 * @property {string} shop.address - Shop address
 * @property {number} shop.products_count - Number of products in shop
 * @property {string} city - Seller city
 * @property {string} state - Seller state
 */

/**
 * @typedef {Object} Product
 * @property {number} id - Product ID
 * @property {string} name - Product name
 * @property {number} unit_price - Product price
 * @property {string} thumbnail - Product thumbnail
 * @property {string} slug - Product slug
 * @property {Seller|null} seller - Seller information (can be null)
 * @property {Object|null} shop - Shop information (fallback when seller is null)
 * @property {number} user_id - User ID (fallback for seller ID)
 */

/**
 * Safely access nested seller properties with fallback to shop properties
 * @param {Product} product - The product object
 * @param {string} propertyPath - Dot-separated property path (e.g., 'shop.name')
 * @param {*} fallback - Default value if property doesn't exist
 * @returns {*} The property value or fallback
 */
const getSellerProperty = (product, propertyPath, fallback = '') => {
  if (!product) return fallback;

  // Handle nested property paths like 'shop.name', 'shop.image', etc.
  const pathParts = propertyPath.split('.');
  let current = product.seller;

  // If seller is null, try shop as fallback
  if (!current) {
    current = product.shop;
  }

  if (!current) return fallback;

  // Navigate through the property path
  for (const part of pathParts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return fallback;
    }
  }

  return current || fallback;
};

/**
 * Get seller ID with fallback to user_id
 * @param {Product} product - The product object
 * @returns {number|null} Seller ID or null if not available
 */
const getSellerId = product => {
  return product?.seller?.id || product?.user_id || null;
};

/**
 * Get shop name with fallback
 * @param {Product} product - The product object
 * @returns {string} Farm name or 'Unknown Farm'
 */
const getShopName = product => {
  return getSellerProperty(product, 'shop.name', 'Unknown Farm');
};

/**
 * Get farm image with fallback
 * @param {Product} product - The product object
 * @returns {string} Farm image path or empty string
 */
const getShopImage = product => {
  return getSellerProperty(product, 'shop.image', '');
};

/**
 * Get farm products count with fallback
 * @param {Product} product - The product object
 * @returns {number} Number of products or 0
 */
const getShopProductsCount = product => {
  return getSellerProperty(product, 'shop.products_count', 0);
};

/**
 * Get seller address with fallback
 * @param {Product} product - The product object
 * @returns {string} Seller address or 'Address not available'
 */
const getSellerAddress = product => {
  return getSellerProperty(product, 'shop.address', 'Address not available');
};

/**
 * Get seller city with fallback
 * @param {Product} product - The product object
 * @returns {string} Seller city or 'City not available'
 */
const getSellerCity = product => {
  return getSellerProperty(product, 'city', 'City not available');
};

/**
 * Get seller state with fallback
 * @param {Product} product - The product object
 * @returns {string} Seller state or 'State not available'
 */
const getSellerState = product => {
  return getSellerProperty(product, 'state', 'State not available');
};

/**
 * Validate if seller data is available and properly structured
 * @param {Product} product - The product object
 * @returns {boolean} True if seller data is available
 */
const hasSellerData = product => {
  return !!(product?.seller || product?.shop);
};

/**
 * Get a safe seller object that handles null cases
 * @param {Product} product - The product object
 * @returns {Object} Safe seller object with fallbacks
 */
const getSafeSellerData = product => {
  if (!product) {
    return {
      id: null,
      shop: {
        name: 'Unknown Shop',
        image: '',
        address: 'Address not available',
        products_count: 0,
      },
      city: 'City not available',
      state: 'State not available',
    };
  }

  return {
    id: getSellerId(product),
    shop: {
      name: getShopName(product),
      image: getShopImage(product),
      address: getSellerAddress(product),
      products_count: getShopProductsCount(product),
    },
    city: getSellerCity(product),
    state: getSellerState(product),
  };
};

/**
 * Test function to validate type safety implementation
 * This can be used for debugging or testing the seller data handling
 * @param {Product} product - The product object to test
 * @returns {Object} Test results
 */
const testSellerTypeSafety = product => {
  const results = {
    hasSellerData: hasSellerData(product),
    sellerId: getSellerId(product),
    shopName: getShopName(product),
    shopImage: getShopImage(product),
    shopProductsCount: getShopProductsCount(product),
    sellerAddress: getSellerAddress(product),
    sellerCity: getSellerCity(product),
    sellerState: getSellerState(product),
    safeSellerData: getSafeSellerData(product),
  };

  // console.log('Seller Type Safety Test Results:', results);
  return results;
};

export const ProductDetailScreen = ({route, navigation}) => {
  const {t} = useTranslation();
  const {theme, isDark} = useTheme();
  const uiKittenTheme = useUIKittenTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const {productId, slug = null} = route.params || {};
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showFullscreenCarousel, setShowFullscreenCarousel] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get wishlist status from Redux
  const isInWishlist = useSelector(state =>
    selectIsInWishlist(state, product?.id),
  );

  // Get authentication states
  const isBuyerAuthenticated = useSelector(selectIsBuyerAuthenticated);
  const isSellerAuthenticated = useSelector(selectIsSellerAuthenticated);
  const customerInfo = useSelector(selectCustomerInfo);

  // Get categories for mapping
  const {categories} = useSelector(selectProductCategories);

  // Set up auth modal handlers
  useEffect(() => {
    setAuthModalHandlers({
      showBuyerAuthModal: () =>
        navigation.navigate(AppScreens.LOGIN, {isItSeller: false}),
    });
  }, [navigation]);

  const navigateToProductDetail = (productId, slug) => {
    // console.log("[navigateToProductDetail]", productId, slug);
    navigation.navigate('ProductDetail', {productId: productId, slug: slug});
  };

  const navigateToVandorDetail = vandorId => {
    // console.log("[navigateToVandorDetail]", vandorId);
    navigation.navigate(AppScreens.VANDOR_DETAIL, {sellerId: vandorId});
  };

  const dispatch = useDispatch();
  const {sellerProducts, sellerProductsLoading} =
    useSelector(selectSellerProducts);

  const parsedProducts = useCallback(list => {
    if (!Array.isArray(list)) return [];
    return list.map(productItem => ({
      id: productItem.id,
      name: productItem.name,
      image: productItem.thumbnail
        ? `${BASE_URLS.product_thumbnail_url}/${
            productItem.thumbnail?.split('/')?.pop() || ''
          }`
        : '',
      price:
        productItem.discount > 0
          ? calculateDiscountedPrice(
              productItem.unit_price,
              productItem.discount,
              productItem.discount_type,
            )
          : productItem.unit_price,
      oldPrice: productItem.discount > 0 ? productItem.unit_price : 0,
      isSoldOut: productItem.current_stock === 0,
      discountType: productItem.discount_type,
      discount: productItem.discount,
      rating: 0,
      slug: productItem?.slug || '',
    }));
  }, []);

  useEffect(() => {
    console.debug('SELLER ID', product);
    const sellerId = getSellerId(product);
    if (sellerId) {
      dispatch(loadSellerProducts({sellerId, limit: 10, offset: 0}));
    } else {
      console.warn('No seller ID found for product:', product?.id);
    }
  }, [getSellerId(product)]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        console.error('No slug provided for product details');
        return;
      }
      try {
        setLoading(true);
        const response = await axiosBuyerClient.get(`products/details/${slug}`);
        // console.log(
        //   '[fetchProductDetails]',
        //   JSON.stringify(response.data, null, 10),
        // );
        setProduct(response.data);
      } catch (error) {
        console.error(
          'Error fetching product [fetchProduct]:',
          error || error?.message || error?.response?.data?.message,
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?.id) return;

      try {
        setLoadingRelated(true);
        const response = await axiosBuyerClient.get(
          `products/related-products/${product.id}`,
        );
        // console.log("[fetchRelatedProducts]", JSON.stringify(response, null, 10));
        setRelatedProducts(response.data);
      } catch (error) {
        console.error(
          'Error fetching related products [fetchRelatedProducts]:',
          error || error?.message || error?.response?.data?.message,
        );
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedProducts();
  }, [product?.id]);

  if (loading || !product) {
    return <ProductDetailShimmer />;
  }

  // Validate seller data and log warnings for debugging
  if (!hasSellerData(product)) {
    console.warn('Product has no seller data:', product?.id, product);
  } else {
    // Test type safety implementation (can be removed in production)
    testSellerTypeSafety(product);
  }

  const addToCart = async (product, onSuccess) => {
    // Check if user is authenticated as buyer
    if (!isBuyerAuthenticated) {
      // Show informative alert based on current auth state
      const message = isSellerAuthenticated
        ? 'You are signed in as a seller. Please also sign in as a buyer to add items to cart.'
        : 'Please sign in as a buyer to add items to cart.';

      Alert.alert('Buyer Authentication Required', message, [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Sign in as Buyer',
          onPress: () =>
            navigation.navigate(AppScreens.LOGIN, {isItSeller: false}),
        },
      ]);
      return;
    }

    try {
      setAddingToCart(true);
      // console.log("[addToCart data]======", product, "-------------------->", product.id);

      const response = await smartBuyerClient.post('cart/add', {
        id: product.id,
        quantity: 1,
      });

      // console.log('Product added to cart:', response, "-=================================?>", response.data);
      setAddingToCart(false);
      setAddedToCart(true);

      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: 'Product added to cart successfully!',
      });

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          setAddedToCart(false);
        }, 2000);
      }
    } catch (error) {
      console.error(
        'Error adding to cart:',
        error || error?.message || error?.response?.data?.message,
      );

      setAddingToCart(false);

      // Handle auth errors with proper modal display
      handleAuthError(error, err => {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to add to cart';
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: errorMessage,
        });
      });
    }
    // console.log("[addToCart]", product);
  };

  // Handle wishlist toggle with authentication check
  const handleWishlistToggle = () => {
    if (!isBuyerAuthenticated) {
      const message = isSellerAuthenticated
        ? t('product.wishlistAuth')
        : t('product.addToWishlistAuth');

      Alert.alert(t('product.buyerAuthRequired'), message, [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('product.signInAsBuyer'),
          onPress: () =>
            navigation.navigate(AppScreens.LOGIN, {isItSeller: false}),
        },
      ]);
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist({productId: product.id}));
    } else {
      dispatch(
        addToWishlist({
          productId: product.id,
          productData: product,
        }),
      );
    }
  };

  // Handle chat with seller
  const handleChatWithSeller = () => {
    // Check if user is authenticated as buyer
    if (!isBuyerAuthenticated) {
      if (isSellerAuthenticated) {
        Alert.alert(
          'Seller to Seller Chat',
          'You are signed in as a seller and are about to message another seller. Do you want to continue?',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Continue',
              onPress: () => navigateToChat(),
            },
          ],
        );
      } else {
        Alert.alert(
          'Buyer Authentication Required',
          'Please sign in as a buyer to chat with sellers.',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Sign in as Buyer',
              onPress: () =>
                navigation.navigate(AppScreens.LOGIN, {isItSeller: false}),
            },
          ],
        );
      }
      return;
    }
    navigateToChat();
  };

  const navigateToChat = () => {
    // Set up the chat state similar to ChatScreen
    dispatch(setBottomTabBarVisibility(false));
    const sellerId = getSellerId(product);
    dispatch(
      setActiveRoom({
        roomId: sellerId,
        recipient: {
          name: getShopName(product),
          profile:
            BASE_URLS.shop_image_url && getShopImage(product)
              ? `${BASE_URLS.shop_image_url}/${getShopImage(product)}`
              : '',
        },
      }),
    );

    // Navigate to Messages screen with seller info
    navigation.navigate(ChatRoutes.MESSAGES, {
      roomId: sellerId, // seller_id for buyer chat
      recipientProfile:
        BASE_URLS.shop_image_url && getShopImage(product)
          ? `${BASE_URLS.shop_image_url}/${getShopImage(product)}`
          : '',
      recipientName: getShopName(product),
      chatType: 'buyer', // Always 'buyer' when messaging a seller from product detail
      // Add product information for initial message context
      productInfo: {
        id: product.id,
        name: product.name,
        price: product.unit_price,
        image:
          BASE_URLS.product_thumbnail_url && product.thumbnail
            ? `${BASE_URLS.product_thumbnail_url}/${product.thumbnail}`
            : '',
        slug: product.slug,
        url:
          BASE_URLS.product_url && product.slug
            ? `${BASE_URLS.product_url}/${product.slug}`
            : '',
        seller: {
          id: sellerId,
          name: getShopName(product),
          shopName: getShopName(product),
        },
      },
    });
  };

  const navigateToSellerProfile = sellerId => {
    navigation.navigate('VandorDetail', {sellerId});
    // console.log("[navigateToSellerProfile]", sellerId);
  };

  // Handle fullscreen image carousel
  const openFullscreenCarousel = (index = 0) => {
    setCurrentImageIndex(index);
    setShowFullscreenCarousel(true);
  };

  const closeFullscreenCarousel = () => {
    setShowFullscreenCarousel(false);
  };

  // Helper function to get category names from category_ids
  const getCategoryNames = categoryIds => {
    if (!categoryIds || !Array.isArray(categoryIds) || !categories) return [];
    return categoryIds
      .map(categoryItem => {
        // Handle both formats: direct ID or object with id property
        const categoryId =
          typeof categoryItem === 'object' ? categoryItem.id : categoryItem;
        const category = categories.find(cat => cat.id == categoryId); // Use == for string/number comparison
        return category ? category.name : null;
      })
      .filter(Boolean);
  };

  // Helper function to handle phone calls
  const handlePhoneCall = phoneNumber => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  // Check if YouTube URL is present
  const getYouTubeVideoId = url => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Handle social share
  const handleShare = async () => {
    try {
      if (!product?.slug) {
        Alert.alert(t('common.error'), t('product.shareInfoNotAvailable'));
        return;
      }

      // Call the social-share-link API to get the shareable link
      const response = await axiosBuyerClient.get(
        `products/social-share-link/${product.slug}`,
      );
      const shareLink = response.data;

      // console.log('product', product);

      const shareOptions = {
        title: t('product.shareTitle', {productName: product.name}),
        message: product.is_living
          ? t('product.shareMessagePet', {
              productName: product.name,
              price: product.unit_price.toLocaleString(),
              link: shareLink,
            })
          : t('product.shareMessage', {
              productName: product.name,
              price: product.unit_price.toLocaleString(),
              link: shareLink,
            }),
        url: shareLink,
      };

      await Share.share(shareOptions);
    } catch (error) {
      console.error('Error sharing product:', error);
      Alert.alert(t('common.error'), t('product.shareError'));
    }
  };

  // console.log('Rendering shimmer', ProductDetailShimmer);

  const productImages = Array.isArray(product.images)
    ? product.images.map(image => ({
        id: image,
        image:
          BASE_URLS.product_image_url && image
            ? `${BASE_URLS.product_image_url}/${image?.split('/')?.pop() || ''}`
            : '',
      }))
    : [];

  // const parsedRelatedProducts = Array.isArray(relatedProducts)
  //   ? relatedProducts.map(item => ({
  //       id: item.id,
  //       name: item.name,
  //       image:
  //         BASE_URLS.product_thumbnail_url && item.thumbnail
  //           ? `${BASE_URLS.product_thumbnail_url}/${item.thumbnail}`
  //           : '',
  //       price: item.unit_price,
  //       oldPrice: item.discount > 0 ? item.unit_price : 0,
  //       isSoldOut: item.current_stock === 0,
  //       discountType: item.discount_type,
  //       discount: item.discount,
  //       rating: item.average_review || 0,
  //       slug: item.slug,
  //     }))
  //   : [];

  // Get screen dimensions
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
                    // Scroll to the selected image
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
      level="3"
      style={{
        flex: 1,
        backgroundColor: isDark
          ? theme['color-shadcn-background']
          : theme['color-basic-100'],
      }}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
        }}
        contentContainerStyle={{
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
          flexGrow: 1,
          justifyContent: 'flex-start',
          paddingTop: 10,
        }}>
        <ProductImagesSlider
          slideList={productImages}
          onImagePress={openFullscreenCarousel}
        />
        <Layout
          level="1"
          style={{
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          }}>
          <Layout
            style={[
              spacingStyles.px8,
              spacingStyles.pt8,
              flexeStyles.row,
              flexeStyles.itemsCenter,
              flexeStyles.contentBetween,
              {
                backgroundColor: isDark
                  ? theme['color-shadcn-background']
                  : theme['color-basic-100'],
              },
            ]}>
            <Layout
              style={{
                backgroundColor: isDark
                  ? theme['color-shadcn-background']
                  : theme['color-basic-100'],
                flex: 1,
              }}>
              <Layout
                style={[
                  flexeStyles.row,
                  flexeStyles.itemsCenter,
                  spacingStyles.px4,
                ]}>
                <Text
                  style={[
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                      fontSize: 18,
                      fontWeight: 'bold',
                      flex: 1,
                    },
                  ]}
                  category="h6">
                  {product.name}
                </Text>
                {product.featured && (
                  <Layout
                    style={{
                      backgroundColor: '#FF6D1A',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 8,
                      marginLeft: 8,
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 10,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}>
                      {t('product.boosted')}
                    </Text>
                  </Layout>
                )}
              </Layout>
            </Layout>
            <Layout
              style={[
                flexeStyles.row,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-background']
                    : theme['color-basic-100'],
                },
              ]}>
              <Button
                accessoryLeft={
                  <ThemedIcon
                    name={isInWishlist ? 'heart' : 'heart-outline'}
                    fill={
                      isInWishlist
                        ? uiKittenTheme['color-danger-default']
                        : isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600']
                    }
                  />
                }
                size="small"
                appearance="ghost"
                onPress={handleWishlistToggle}
              />
              <Button
                accessoryLeft={<ThemedIcon name="share" />}
                size="small"
                appearance="ghost"
                onPress={handleShare}
              />
            </Layout>
          </Layout>

          <Layout
            style={{
              marginHorizontal: 12,
              marginTop: 0,
              backgroundColor: isDark
                ? theme['color-shadcn-background']
                : theme['color-basic-100'],
            }}>
            {product.discount > 0 ? (
              <Layout>
                <Price
                  fontSize={20}
                  amount={calculateDiscountedPrice(
                    product.unit_price,
                    product.discount,
                    product.discount_type,
                  )}
                />
                <Layout
                  style={[
                    flexeStyles.row,
                    flexeStyles.itemsCenter,
                    {marginTop: 4},
                  ]}>
                  <Text
                    style={{
                      textDecorationLine: 'line-through',
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600'],
                      fontSize: 16,
                      marginRight: 8,
                    }}>
                    {t('common.rs')} {product.unit_price.toLocaleString()}
                  </Text>
                  <Text
                    style={{
                      backgroundColor: theme['color-danger-500'],
                      color: 'white',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 'bold',
                    }}>
                    -{product.discount}
                    {product.discount_type === 'percent' ? '%' : ' OFF'}
                  </Text>
                </Layout>
              </Layout>
            ) : (
              <Price fontSize={20} amount={product.unit_price} />
            )}
          </Layout>

          <Divider
            style={{
              backgroundColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
            }}
          />

          <Layout
            style={{
              flexDirection: 'row',
              marginTop: 18,
              marginBottom: 8,
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
            }}>
            <Button
              onPress={() =>
                addToCart(product, () => navigation.navigate(AppScreens.CART))
              }
              style={{
                flex: 1,
                backgroundColor: theme['color-shadcn-primary'],
                borderRadius: 6,
                marginRight: 8,
                borderWidth: 0,
                height: 45,
                opacity: product.current_stock === 0 ? 0.5 : 1,
              }}
              textStyle={{
                color: theme['color-shadcn-primary-foreground'],
                fontWeight: 'bold',
              }}
              appearance="filled"
              disabled={addingToCart || product.current_stock === 0}
              accessoryLeft={
                addingToCart
                  ? () => (
                      <ActivityIndicator
                        size="small"
                        color={theme['color-shadcn-primary-foreground']}
                      />
                    )
                  : undefined
              }>
              {product.current_stock === 0
                ? t('product.outOfStock')
                : addingToCart
                ? ''
                : t('product.buyNow')}
            </Button>

            <Button
              onPress={() => addToCart(product)}
              style={{
                flex: 1,
                backgroundColor: theme['color-shadcn-primary'],
                borderRadius: 6,
                marginRight: 8,
                borderWidth: 0,
                height: 45,
                opacity: product.current_stock === 0 ? 0.5 : 1,
              }}
              textStyle={{
                color: theme['color-shadcn-primary-foreground'],
                fontWeight: 'bold',
              }}
              appearance="filled"
              disabled={addingToCart || product.current_stock === 0}
              accessoryLeft={
                addingToCart
                  ? () => (
                      <ActivityIndicator
                        size="small"
                        color={theme['color-shadcn-primary-foreground']}
                      />
                    )
                  : undefined
              }>
              {product.current_stock === 0
                ? t('product.outOfStock')
                : addingToCart
                ? ''
                : addedToCart
                ? t('product.addedToCart')
                : t('product.addToCart')}
            </Button>

            <Button
              onPress={handleChatWithSeller}
              style={{
                flex: 1,
                backgroundColor: isDark
                  ? theme['color-shadcn-card']
                  : theme['color-basic-100'],
                borderColor: isDark
                  ? theme['color-shadcn-border']
                  : theme['color-basic-400'],
                borderWidth: 1,
                borderRadius: 6,
                height: 45,
              }}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
                fontWeight: 'bold',
              }}
              appearance="outline">
              {t('product.chat')}
            </Button>
          </Layout>

          <Layout
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8,
              marginTop: 8,
            }}>
            <TouchableOpacity
              style={{flex: 1, alignItems: 'center'}}
              onPress={() => setActiveTab('overview')}>
              <Text
                style={{
                  fontWeight: 'bold',
                  color:
                    activeTab === 'overview'
                      ? isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900']
                      : isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  fontSize: 16,
                }}>
                {t('product.overview')}
              </Text>
              {activeTab === 'overview' && (
                <View
                  style={{
                    height: 4,
                    backgroundColor: theme['color-shadcn-primary'],
                    width: 60,
                    borderRadius: 2,
                    marginTop: 2,
                  }}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={{flex: 1, alignItems: 'center'}}
              onPress={() => setActiveTab('reviews')}>
              <Text
                style={{
                  fontWeight: 'bold',
                  color:
                    activeTab === 'reviews'
                      ? isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900']
                      : isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  fontSize: 16,
                }}>
                {t('product.reviews')}
              </Text>
              {activeTab === 'reviews' && (
                <View
                  style={{
                    height: 4,
                    backgroundColor: theme['color-shadcn-primary'],
                    width: 60,
                    borderRadius: 2,
                    marginTop: 2,
                  }}
                />
              )}
            </TouchableOpacity>
          </Layout>

          {activeTab === 'overview' ? (
            <Layout
              style={[
                spacingStyles.p16,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-background']
                    : theme['color-basic-100'],
                },
              ]}
              level="1">
              <Text
                category="p1"
                style={{
                  marginBottom: 10,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                }}>
                {t('product.description')}
              </Text>
              <Text
                style={{
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                }}>
                {product.details}
              </Text>

              <Layout style={{marginTop: 16}}>
                <Text
                  category="p1"
                  style={{
                    marginBottom: 10,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  }}>
                  {t('product.productDetails')}
                </Text>

                <Layout style={{flexDirection: 'row', marginBottom: 8}}>
                  <Text
                    style={{
                      flex: 1,
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600'],
                      fontSize: 14,
                    }}>
                    {t('product.minimumOrderQuantity')}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      fontWeight: '600',
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                      fontSize: 14,
                    }}>
                    {product.minimum_order_qty} {product.unit}
                  </Text>
                </Layout>

                <Layout style={{flexDirection: 'row', marginBottom: 8}}>
                  <Text
                    style={{
                      flex: 1,
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600'],
                      fontSize: 14,
                    }}>
                    {t('product.currentStock')}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      fontWeight: '600',
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                      fontSize: 14,
                    }}>
                    {product.current_stock} {product.unit}
                  </Text>
                </Layout>

                <Layout style={{flexDirection: 'row', marginBottom: 8}}>
                  <Text
                    style={{
                      flex: 1,
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600'],
                      fontSize: 14,
                    }}>
                    {t('product.featured')}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      fontWeight: '600',
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                      fontSize: 14,
                    }}>
                    {product.featured ? t('product.yes') : t('product.no')}
                  </Text>
                </Layout>

                <Layout style={{flexDirection: 'row', marginBottom: 8}}>
                  <Text
                    style={{
                      flex: 1,
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600'],
                      fontSize: 14,
                    }}>
                    {t('product.productType')}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      fontWeight: '600',
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                      fontSize: 14,
                    }}>
                    {product.product_type}
                  </Text>
                </Layout>

                <Layout style={{flexDirection: 'row', marginBottom: 8}}>
                  <Text
                    style={{
                      flex: 1,
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600'],
                      fontSize: 14,
                    }}>
                    {t('product.refundable')}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      fontWeight: '600',
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                      fontSize: 14,
                    }}>
                    {product.refundable ? t('product.yes') : t('product.no')}
                  </Text>
                </Layout>

                <Layout style={{flexDirection: 'row', marginBottom: 8}}>
                  <Text
                    style={{
                      flex: 1,
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600'],
                      fontSize: 14,
                    }}>
                    {t('product.freeShipping')}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      fontWeight: '600',
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                      fontSize: 14,
                    }}>
                    {product.free_shipping ? t('product.yes') : t('product.no')}
                  </Text>
                </Layout>

                {/* Categories Section */}
                {product.category_ids && product.category_ids.length > 0 && (
                  <Layout style={{marginTop: 16}}>
                    <Text
                      category="p1"
                      style={{
                        marginBottom: 10,
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      }}>
                      {t('product.categories')}
                    </Text>
                    <Layout
                      style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
                      {getCategoryNames(product.category_ids).map(
                        (categoryName, index) => (
                          <Text
                            key={index}
                            style={{
                              backgroundColor: isDark
                                ? theme['color-shadcn-secondary']
                                : theme['color-basic-200'],
                              color: isDark
                                ? theme['color-shadcn-foreground']
                                : theme['color-basic-900'],
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 16,
                              fontSize: 12,
                              fontWeight: '500',
                              marginRight: 8,
                              marginBottom: 8,
                            }}>
                            {categoryName}
                          </Text>
                        ),
                      )}
                    </Layout>
                  </Layout>
                )}

                {/* Tags Section */}
                {product.tags && product.tags.length > 0 && (
                  <Layout style={{marginTop: 16}}>
                    <Text
                      category="p1"
                      style={{
                        marginBottom: 10,
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      }}>
                      {t('product.tags')}
                    </Text>
                    <Layout
                      style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
                      {product.tags.map((tagObj, index) => (
                        <Text
                          key={tagObj.id || index}
                          style={{
                            backgroundColor: isDark
                              ? theme['color-shadcn-accent']
                              : theme['color-primary-100'],
                            color: isDark
                              ? theme['color-shadcn-foreground']
                              : theme['color-primary-700'],
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: '500',
                            marginRight: 6,
                            marginBottom: 6,
                            borderWidth: 1,
                            borderColor: isDark
                              ? theme['color-shadcn-border']
                              : theme['color-primary-200'],
                          }}>
                          #{tagObj.tag}
                        </Text>
                      ))}
                    </Layout>
                  </Layout>
                )}

                {/* YouTube Video Section */}
                {product.youtube_video_url &&
                  getYouTubeVideoId(product.youtube_video_url) && (
                    <Layout style={{marginTop: 16}}>
                      <Text
                        category="p1"
                        style={{
                          marginBottom: 10,
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          color: isDark
                            ? theme['color-shadcn-foreground']
                            : theme['color-basic-900'],
                        }}>
                        {t('product.productVideo')}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          Linking.openURL(product.youtube_video_url)
                        }
                        style={{
                          backgroundColor: isDark
                            ? theme['color-shadcn-card']
                            : theme['color-basic-100'],
                          borderRadius: 12,
                          overflow: 'hidden',
                          borderWidth: 1,
                          borderColor: isDark
                            ? theme['color-shadcn-border']
                            : theme['color-basic-400'],
                        }}>
                        <Image
                          source={{
                            uri: `https://img.youtube.com/vi/${getYouTubeVideoId(
                              product.youtube_video_url,
                            )}/maxresdefault.jpg`,
                          }}
                          style={{
                            width: '100%',
                            height: 200,
                            resizeMode: 'cover',
                          }}
                        />
                        <Layout
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0,0,0,0.3)',
                          }}>
                          <Layout
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              borderRadius: 50,
                              width: 60,
                              height: 60,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            <Icon
                              name="play"
                              fill="#FF0000"
                              style={{width: 30, height: 30}}
                            />
                          </Layout>
                        </Layout>
                      </TouchableOpacity>
                    </Layout>
                  )}

                <Layout style={{marginTop: 16}}>
                  <Text
                    category="p1"
                    style={{
                      marginBottom: 10,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    }}>
                    {t('product.sellerLocation')}
                  </Text>
                  <Layout style={{flexDirection: 'row', marginBottom: 8}}>
                    <Text
                      style={{
                        flex: 1,
                        color: isDark
                          ? theme['color-shadcn-muted-foreground']
                          : theme['color-basic-600'],
                        fontSize: 14,
                      }}>
                      {t('product.address')}
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        fontWeight: '600',
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                        fontSize: 14,
                      }}>
                      {getSellerAddress(product)}
                    </Text>
                  </Layout>
                  <Layout style={{flexDirection: 'row', marginBottom: 8}}>
                    <Text
                      style={{
                        flex: 1,
                        color: isDark
                          ? theme['color-shadcn-muted-foreground']
                          : theme['color-basic-600'],
                        fontSize: 14,
                      }}>
                      {t('product.city')}
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        fontWeight: '600',
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                        fontSize: 14,
                      }}>
                      {getSellerCity(product)
                        ? t(getSellerCity(product))
                        : t('product.cityNotAvailable')}
                    </Text>
                  </Layout>
                  <Layout style={{flexDirection: 'row', marginBottom: 8}}>
                    <Text
                      style={{
                        flex: 1,
                        color: isDark
                          ? theme['color-shadcn-muted-foreground']
                          : theme['color-basic-600'],
                        fontSize: 14,
                      }}>
                      {t('product.state')}
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        fontWeight: '600',
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                        fontSize: 14,
                      }}>
                      {getSellerState(product)
                        ? t(getSellerState(product))
                        : t('product.stateNotAvailable')}
                    </Text>
                  </Layout>
                </Layout>
              </Layout>
            </Layout>
          ) : (
            <Layout
              style={[
                spacingStyles.p16,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-background']
                    : theme['color-basic-100'],
                },
              ]}
              level="1">
              <Text
                category="p1"
                style={{
                  marginBottom: 10,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                }}>
                {t('product.reviews')} ({product.reviews_count})
              </Text>
              {product.reviews.length > 0 ? (
                <Layout style={{marginTop: 8}}>
                  {product.reviews.map((review, index) => (
                    <Layout key={index} style={{paddingVertical: 4}}>
                      <Layout
                        style={[
                          flexeStyles.row,
                          flexeStyles.contentBetween,
                          {
                            marginBottom: 4,
                          },
                        ]}>
                        <Text
                          category="s1"
                          style={{
                            color: isDark
                              ? theme['color-shadcn-foreground']
                              : theme['color-basic-900'],
                          }}>
                          {review.user?.name || 'Anonymous'}
                        </Text>
                        <AirbnbRating
                          count={5}
                          defaultRating={review.rating}
                          showRating={false}
                          size={14}
                          isDisabled={true}
                          selectedColor={theme['color-shadcn-primary']}
                        />
                      </Layout>
                      <Text
                        style={{
                          color: isDark
                            ? theme['color-shadcn-foreground']
                            : theme['color-basic-900'],
                        }}>
                        {review.comment}
                      </Text>
                      <Divider
                        style={{
                          marginTop: 8,
                          backgroundColor: isDark
                            ? theme['color-shadcn-border']
                            : theme['color-basic-400'],
                        }}
                      />
                    </Layout>
                  ))}
                </Layout>
              ) : (
                <Text
                  style={{
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  }}>
                  {t('product.noReviewsYet')}
                </Text>
              )}
            </Layout>
          )}
        </Layout>

        {/* SELLER INFO CARD */}
        <View
          style={{
            backgroundColor: isDark
              ? theme['color-shadcn-card']
              : theme['color-basic-100'],
            borderRadius: 12,
            marginHorizontal: 0,
            marginBottom: 16,
            marginTop: 4,
            paddingVertical: 16,
            paddingHorizontal: 20,
            shadowColor: '#000',
            shadowOpacity: 0.04,
            shadowRadius: 6,
            shadowOffset: {width: 0, height: 2},
            elevation: 1,
            borderWidth: 1,
            borderColor: isDark
              ? theme['color-shadcn-border']
              : theme['color-basic-400'],
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
            }}>
            <Image
              source={{
                uri:
                  BASE_URLS.shop_image_url && getShopImage(product)
                    ? `${BASE_URLS.shop_image_url}/${getShopImage(product)}`
                    : undefined,
              }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                marginRight: 10,
                backgroundColor: isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-200'],
              }}
            />
            <View style={{flex: 1}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 2,
                }}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 17,
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                    flex: 1,
                  }}>
                  {getShopName(product)}
                </Text>
                {product.seller?.shop?.vacation_status === 1 && (
                  <View
                    style={{
                      backgroundColor: '#FFA500',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 8,
                      marginLeft: 8,
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 10,
                        fontWeight: 'bold',
                      }}>
                      VACATION
                    </Text>
                  </View>
                )}
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 2,
                }}>
                <Text
                  style={{
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                    fontSize: 13,
                    marginRight: 2,
                  }}>
                  {t('product.sellerInfo')}
                </Text>
                <Icon
                  name="info"
                  width={14}
                  height={14}
                  fill={
                    isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600']
                  }
                />
              </View>
            </View>
          </View>
          <Divider
            style={{
              marginVertical: 8,
              backgroundColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-200'],
                borderRadius: 10,
                marginRight: 6,
                paddingVertical: 12,
              }}>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 28,
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                }}>
                {getShopProductsCount(product)}
              </Text>
              <Text
                style={{
                  color: isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600'],
                  fontSize: 15,
                  fontWeight: '500',
                }}>
                {t('product.products')}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-200'],
                borderRadius: 10,
                marginLeft: 6,
                paddingVertical: 12,
              }}>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 28,
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                }}>
                {product.reviews_count || product?.shop?.reviews_count || 0}
              </Text>
              <Text
                style={{
                  color: isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600'],
                  fontSize: 15,
                  fontWeight: '500',
                }}>
                {t('product.reviews')}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={{marginTop: 2, borderRadius: 8, overflow: 'hidden'}}>
            <LinearGradient
              colors={[
                theme['color-shadcn-primary'],
                theme['color-primary-400'],
              ]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={{
                paddingVertical: 12,
                alignItems: 'center',
                borderRadius: 8,
              }}>
              <Text
                onPress={() => {
                  navigateToVandorDetail(getSellerId(product));
                }}
                style={{
                  color: theme['color-shadcn-primary-foreground'],
                  fontWeight: 'bold',
                  fontSize: 18,
                }}>
                {t('product.visitStore')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Layout level="1" style={[spacingStyles.px16, spacingStyles.py8]}>
          <View style={{marginTop: 20, marginBottom: 80}}>
            <ProductsList
              listTitle={t('product.relatedProducts')}
              loading={sellerProductsLoading}
              list={parsedProducts(
                relatedProducts.filter(p => p.id !== product.id),
              )}
              onProductDetail={navigateToProductDetail}
              onViewAll={() =>
                navigation.navigate('AllProductsScreen', {
                  productType: 'related',
                  title: 'Related Products',
                  // Optionally pass a list of related product IDs or a filter
                })
              }
            />

            <ProductsList
              listTitle={t('product.fromSeller')}
              loading={sellerProductsLoading}
              list={parsedProducts(
                sellerProducts.products.filter(p => p.id !== product.id),
              )}
              onProductPress={navigateToProductDetail}
              onProductDetail={navigateToProductDetail}
              onViewAll={() =>
                navigation.navigate('AllProductsScreen', {
                  productType: 'seller',
                  sellerId: getSellerId(product),
                  title: getShopName(product) || 'From Seller',
                })
              }
            />
          </View>
        </Layout>
      </ScrollView>

      {/* Fullscreen Image Carousel */}
      <FullscreenCarousel />
    </Layout>
  );
};
