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
  Linking,
} from 'react-native';
import {AirbnbRating} from 'react-native-ratings';
import {Price} from '../../../components/Price';
import {calculateDiscountedPrice} from '../../../utils/products';
import {axiosBuyerClient} from '../../../utils/axiosClient';
import {
  ProductImagesSlider,
  ProductActionButtons,
  SellerInfoCard,
  RelatedProducts,
  SellerProducts,
  WishlistButton,
  ShareButton,
} from '../../../components/product';
import {flexeStyles, spacingStyles} from '../../../utils/globalStyles';
import React, {useEffect, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {setCartCount, incrementCartCount} from '../../../store/cart';

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
  return (
    product?.seller?.shop?.name ||
    product?.shop?.name ||
    'Unknown Farm'
  );
};

/**
 * Get farm image with fallback
 * @param {Product} product - The product object
 * @returns {string} Farm image path or empty string
 */
const getShopImage = product => {
  return (
    product?.seller?.shop?.image ||
    product?.shop?.image ||
    ''
  );
};

export const ProductDetailScreen = ({route, navigation}) => {
  const {t} = useTranslation();
  const {theme, isDark} = useTheme();
  const uiKittenTheme = useUIKittenTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const {productId, slug = null} = route.params || {};
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const dispatch = useDispatch();

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


  if (loading || !product) {
    return <ProductDetailShimmer />;
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

      // Update Redux cart count
      dispatch(incrementCartCount());

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

  // Handle navigation to product images grid screen
  const openProductImagesGrid = (index = 0) => {
    navigation.navigate(AppScreens.PRODUCT_IMAGES_GRID, {
      product,
      productImages,
      currentImageIndex: index,
      onBuyNow: () => addToCart(product, () => navigation.navigate(AppScreens.CART)),
      onAddToCart: () => addToCart(product),
      onChat: handleChatWithSeller,
      addingToCart,
      addedToCart,
    });
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
          onImagePress={openProductImagesGrid}
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
              <WishlistButton product={product} navigation={navigation} />
              <ShareButton product={product} />
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

          <ProductActionButtons
            product={product}
            onBuyNow={() => addToCart(product, () => navigation.navigate(AppScreens.CART))}
            onAddToCart={() => addToCart(product)}
            onChat={handleChatWithSeller}
            addingToCart={addingToCart}
            addedToCart={addedToCart}
            isDark={isDark}
            theme={theme}
            t={t}
            style={{
              marginTop: 18,
              marginBottom: 8,
            }}
          />

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
                      {product?.seller?.shop?.address ||
                        product?.shop?.address ||
                        t('product.addressNotAvailable')}
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
                      {product?.seller?.city || product?.city
                        ? t(product?.seller?.city || product?.city)
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
                      {product?.seller?.state || product?.state
                        ? t(product?.seller?.state || product?.state)
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
        <SellerInfoCard product={product} navigation={navigation} />

        <Layout level="1" style={[spacingStyles.px16, spacingStyles.py8]}>
          <RelatedProducts
            productId={product.id}
              onProductDetail={navigateToProductDetail}
            navigation={navigation}
          />
          <SellerProducts
            productId={product.id}
            sellerId={product?.seller?.id || product?.user_id}
            shopName={
              product?.seller?.shop?.name ||
              product?.shop?.name ||
              'From Seller'
            }
              onProductDetail={navigateToProductDetail}
            navigation={navigation}
            />
        </Layout>
      </ScrollView>
    </Layout>
  );
};
