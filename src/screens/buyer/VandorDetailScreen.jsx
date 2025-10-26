import {Button, Input, Layout, Text, Spinner} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  Image,
  ScrollView,
  View,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import {AirbnbRating} from 'react-native-ratings';
import {ProductCard} from '../../components/product/ProductCard';
import {ThemedIcon} from '../../components/Icon';
import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {BASE_URLS, selectBaseUrls} from '../../store/configs';
import {calculateDiscountedPrice} from '../../utils/products';
import {axiosBuyerClient} from '../../utils/axiosClient';
import {ProductsList} from '../../components/buyer/ProductsList';
import {setActiveRoom} from '../../store/chat';
import {setBottomTabBarVisibility} from '../../store/configs';
import {
  selectIsBuyerAuthenticated,
  selectIsSellerAuthenticated,
} from '../../store/user';
import {ChatRoutes} from '../../navigators/ChatNavigator';
import {AppScreens} from '../../navigators/AppNavigator';
import {useTheme} from '../../theme/ThemeContext';
import FastImageWithFallback from '../../components/common/FastImageWithFallback';
import FastImage from '@d11/react-native-fast-image';

const {width: windowWidth} = Dimensions.get('screen');

export const VandorDetailScreen = ({route, navigation}) => {
  const isBuyerAuthenticated = useSelector(selectIsBuyerAuthenticated);
  const isSellerAuthenticated = useSelector(selectIsSellerAuthenticated);
  const dispatch = useDispatch();

  const {t} = useTranslation();
  const {theme, isDark} = useTheme();
  const baseUrls = useSelector(selectBaseUrls);
  const [searchQuery, setSearchQuery] = useState('');
  const [sellerInfo, setSellerInfo] = useState(null);
  const [sellerInfoLoading, setSellerInfoLoading] = useState(true);
  const [sellerInfoError, setSellerInfoError] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [totalSize, setTotalSize] = useState(0);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const sellerId = route.params?.sellerId || 12;

  useEffect(() => {
    fetchSellerInfo();
    fetchProducts(0, ''); // Start with empty search
  }, [sellerId]);

  // Add effect to handle search query changes with debouncing
  useEffect(() => {
    if (searchQuery.length === 0) {
      // If search is cleared, reload all products
      setOffset(0);
      setProducts([]);
      fetchProducts(0, '');
    }
  }, [searchQuery]);

  const fetchSellerInfo = async () => {
    setSellerInfoLoading(true);
    setSellerInfoError(null);
    try {
      const res = await axiosBuyerClient.get(`/seller`, {
        params: {seller_id: sellerId},
      });
      setSellerInfo(res.data);
    } catch (err) {
      setSellerInfoError(t('vendor.failedToLoadSeller'));
    } finally {
      setSellerInfoLoading(false);
    }
  };

  const fetchProducts = async (newOffset = 0, search = '') => {
    if (newOffset === 0) setProductsLoading(true);
    setProductsError(null);
    try {
      // console.log('Searching with params:', { limit, offset: newOffset, search, sellerId });
      const res = await axiosBuyerClient.get(
        `/seller/${sellerId}/all-products`,
        {
          params: {limit, offset: newOffset, search},
        },
      );
      // console.log('Search response:', res.data);
      // Defensive: ensure products is always an array
      const productsArr = Array.isArray(res.data.products)
        ? res.data.products
        : res.data.products
        ? [res.data.products]
        : [];
      const total =
        typeof res.data.total_size === 'number'
          ? res.data.total_size
          : parseInt(res.data.total_size) || 0;
      // console.log('Processed products:', productsArr.length, 'Total:', total);

      if (newOffset === 0) {
        setProducts(productsArr);
        setOffset(limit); // Reset offset properly for new search
      } else {
        setProducts(prev => [...prev, ...productsArr]);
        setOffset(newOffset + limit);
      }
      setTotalSize(total);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProductsError(t('vendor.failedToLoadProducts'));
    } finally {
      setProductsLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (products.length < totalSize && !loadingMore) {
      setLoadingMore(true);
      fetchProducts(offset, searchQuery);
    }
  };

  const handleSearch = () => {
    setOffset(0); // Reset pagination
    setProducts([]); // Clear existing products
    fetchProducts(0, searchQuery);
  };

  const handlePhoneCall = phoneNumber => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleChatWithSeller = () => {
    if (!isBuyerAuthenticated) {
      if (isSellerAuthenticated) {
        Alert.alert(
          t('vendor.sellerToSellerChat'),
          t('vendor.sellerChatMessage'),
          [
            {text: t('vendor.cancel'), style: 'cancel'},
            {
              text: t('vendor.continue'),
              onPress: () => navigateToChat(),
            },
          ],
        );
      } else {
        Alert.alert(
          t('vendor.buyerAuthRequired'),
          t('vendor.buyerAuthMessage'),
          [
            {text: t('vendor.cancel'), style: 'cancel'},
            // You may want to add a sign-in action here
          ],
        );
      }
      return;
    }
    navigateToChat();
  };

  const navigateToChat = () => {
    dispatch(setBottomTabBarVisibility(false));
    dispatch(
      setActiveRoom({
        roomId: sellerInfo?.seller?.id,
        recipient: {
          name: sellerInfo?.seller?.shop?.name,
          profile: sellerInfo?.seller?.shop?.image
            ? `${baseUrls['shop_image_url']}/${sellerInfo.seller.shop.image}`
            : '',
        },
      }),
    );
    navigation.navigate(ChatRoutes.MESSAGES, {
      roomId: sellerInfo?.seller?.id,
      recipientProfile: sellerInfo?.seller?.shop?.image
        ? `${baseUrls['shop_image_url']}/${sellerInfo.seller.shop.image}`
        : '',
      recipientName: sellerInfo?.seller?.shop?.name,
      chatType: isSellerAuthenticated ? 'seller' : 'buyer',
      // Optionally add more context here
    });
  };

  if (sellerInfoLoading) {
    return (
      <Layout
        level="3"
        style={[
          styles(theme).loadingContainer,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          },
        ]}>
        <Spinner size="large" />
      </Layout>
    );
  }

  if (sellerInfoError || !sellerInfo) {
    return (
      <Layout
        level="3"
        style={[
          styles(theme).errorContainer,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          },
        ]}>
        <Text status="danger">
          {sellerInfoError || t('vendor.failedToLoadSeller')}
        </Text>
      </Layout>
    );
  }

  const parsedProducts = products.map(product => {
    // console.log('product----p', product.slug);
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      rating: product.rating?.[0]?.average || 0,
      discountPercentage: product.discount,
      isSoldOut: product.current_stock === 0,
      price:
        product.discount > 0
          ? calculateDiscountedPrice(
              product.unit_price,
              product.discount,
              product.discount_type,
            )
          : product.unit_price,
      oldPrice: product.discount > 0 ? product.unit_price : 0,
      image: product.thumbnail
        ? `${BASE_URLS.product_thumbnail_url}/${product.thumbnail}`
        : '',
    };
  });

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
          flexGrow: 1,
          justifyContent: 'flex-start',
          paddingTop: 10,
          paddingBottom: 90,
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
        }}>
        {/* Banner */}
        <View style={styles(theme).bannerShadow}>
          <FastImageWithFallback
            priority={FastImage.priority.high}
            resizeMode={FastImage.resizeMode.cover}
            source={{
              uri:
                sellerInfo?.seller?.shop && sellerInfo.seller.shop.banner
                  ? `${BASE_URLS.shop_banner_url}/${sellerInfo.seller.shop.banner}`
                  : undefined,
            }}
            style={styles(theme).banner}
            defaultSource={require('../../../assets/new/lion.png')}
            fallbackSource={require('../../../assets/new/lion.png')}
          />
        </View>
        {/* Store Info Card */}
        <View style={styles(theme).storeInfoCard}>
          <View style={styles(theme).storeInfoRow}>
            <FastImageWithFallback
              priority={FastImage.priority.high}
              resizeMode={FastImage.resizeMode.cover}
              source={{
                uri:
                  sellerInfo?.seller?.shop && sellerInfo.seller.shop.image
                    ? `${BASE_URLS.shop_image_url}/${sellerInfo.seller.shop.image}`
                    : undefined,
              }}
              style={styles(theme).avatar}
              defaultSource={require('../../../assets/new/lion.png')}
            />
            <View style={{flex: 1}}>
              <Text style={styles(theme).storeName}>
                {sellerInfo?.seller?.shop?.name || t('vendor.unknownStore')}
              </Text>
              <View style={styles(theme).ratingRow}>
                <AirbnbRating
                  count={5}
                  defaultRating={sellerInfo?.avg_rating || 0}
                  showRating={false}
                  size={16}
                  isDisabled={true}
                  selectedColor={theme['color-primary-default']}
                  starContainerStyle={{marginRight: 4}}
                />
                <Text style={styles(theme).ratingValue}>
                  {sellerInfo?.avg_rating || 0}
                </Text>
                <Text style={styles(theme).ratingCount}>
                  ({sellerInfo?.total_review || 0})
                </Text>
              </View>
              <Text style={styles(theme).orderCount}>
                {sellerInfo?.total_order || 0} {t('vendor.orders')}
              </Text>
              <Text style={styles(theme).addressText}>
                {sellerInfo?.seller?.shop?.address ||
                  t('vendor.noAddressProvided')}
              </Text>
              {/* <Text 
                style={[styles(theme).contactText, sellerInfo?.seller?.shop?.contact && styles(theme).clickableText]} 
                onPress={() => handlePhoneCall(sellerInfo?.seller?.shop?.contact)}
              >
                {sellerInfo?.seller?.shop?.contact || t('vendor.noContactProvided')}
              </Text> */}
            </View>
            <Button
              appearance="ghost"
              accessoryLeft={
                <ThemedIcon name="message-square-outline" status="primary" />
              }
              size="small"
              style={styles(theme).messageBtn}
              onPress={handleChatWithSeller}
            />
          </View>
        </View>
        {/* Search Bar */}
        <View style={styles(theme).searchBarShadow}>
          <View style={styles(theme).searchBarRow}>
            <Input
              placeholder={t('vendor.searchInStore')}
              style={styles(theme).searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              accessoryRight={() => (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {searchQuery.length > 0 && (
                    <ThemedIcon
                      name="close-outline"
                      style={{marginRight: 8}}
                      onPress={() => setSearchQuery('')}
                    />
                  )}
                  <ThemedIcon name="search-outline" onPress={handleSearch} />
                </View>
              )}
            />
          </View>
        </View>
        {/* Product Grid */}
        {searchQuery.length > 0 && (
          <View style={styles(theme).searchInfo}>
            <Text style={styles(theme).searchInfoText}>
              {productsLoading
                ? t('vendor.searching', 'Searching...')
                : t(
                    'vendor.searchResults',
                    'Found {{count}} results for "{{query}}"',
                    {count: products.length, query: searchQuery},
                  )}
            </Text>
          </View>
        )}
        <View style={styles(theme).productGrid}>
          {parsedProducts.map(item => (
            <View key={item.id} style={styles(theme).productCardWrapper}>
              <ProductCard
                isDark={isDark}
                {...item}
                name={item.name}
                cardWidth={(windowWidth - 56) / 2}
                theme={theme}
                onProductDetail={(id, slug) =>
                  navigation.navigate(AppScreens.PRODUCT_DETAIL, {
                    productId: id,
                    slug,
                  })
                }
              />
            </View>
          ))}
        </View>
        {/* No products found message */}
        {!productsLoading &&
          searchQuery.length > 0 &&
          products.length === 0 && (
            <View style={styles(theme).noResultsContainer}>
              <ThemedIcon
                name="search-outline"
                style={styles(theme).noResultsIcon}
              />
              <Text style={styles(theme).noResultsText}>
                {t(
                  'vendor.noProductsFound',
                  'No products found for "{{query}}"',
                  {query: searchQuery},
                )}
              </Text>
              <Button
                appearance="ghost"
                onPress={() => setSearchQuery('')}
                style={styles(theme).clearSearchBtn}>
                {t('vendor.clearSearch', 'Clear Search')}
              </Button>
            </View>
          )}
        {productsLoading && (
          <View style={styles(theme).loadingMoreContainer}>
            <Spinner size="small" />
          </View>
        )}
        {!productsLoading && products.length < totalSize && (
          <Button
            appearance="ghost"
            onPress={handleLoadMore}
            style={{margin: 16}}>
            {loadingMore ? <Spinner size="small" /> : t('vendor.loadMore')}
          </Button>
        )}
      </ScrollView>
    </Layout>
  );
};

const styles = theme =>
  StyleSheet.create({
    bannerShadow: {
      borderRadius: 10,
      overflow: 'hidden',
      marginHorizontal: 16,
      marginBottom: 12,
      // shadowColor: '#000',
      // shadowOpacity: 0.08,
      // shadowRadius: 8,
      // shadowOffset: {width: 0, height: 2},
      // elevation: 2,
    },
    banner: {
      width: '100%',
      height: (windowWidth - 32) / 2.2,
      resizeMode: 'cover',
      borderRadius: 18,
    },
    storeInfoCard: {
      backgroundColor: theme['background-basic-color-1'],
      borderColor: theme['color-basic-600'],
      borderWidth: 0.5,
      borderRadius: 14,
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 16,
      // shadowColor: theme['text-basic-color'],
      // shadowOpacity: 0.06,
      // shadowRadius: 6,
      // shadowOffset: {width: 0, height: 2},
      // elevation: 1,
    },
    storeInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 70,
      height: 70,
      borderRadius: 35,
      borderWidth: 2,
      borderColor: theme['background-basic-color-1'],
      marginRight: 14,
      backgroundColor: theme['background-basic-color-3'],
    },
    storeName: {
      fontWeight: 'bold',
      fontSize: 20,
      color: theme['text-basic-color'],
      marginBottom: 2,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 2,
    },
    ratingValue: {
      fontWeight: 'bold',
      fontSize: 16,
      color: theme['text-basic-color'],
      marginLeft: 4,
    },
    ratingCount: {
      fontSize: 14,
      color: theme['color-basic-600'],
      marginLeft: 2,
    },
    orderCount: {
      fontSize: 14,
      color: theme['color-basic-600'],
      marginTop: 2,
    },
    messageBtn: {
      marginLeft: 8,
      marginTop: 0,
    },
    searchBarShadow: {
      marginHorizontal: 16,
      marginBottom: 16,
      borderColor: theme['color-basic-600'],
      borderWidth: 0.5,
      // shadowColor: theme['text-basic-color'],
      // shadowOpacity: 0.06,
      // shadowRadius: 6,
      // shadowOffset: {width: 0, height: 2},
      // elevation: 1,
      borderRadius: 10,
      backgroundColor: theme['background-basic-color-1'],
      padding: 2,
    },
    searchBarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 10,
      backgroundColor: theme['background-basic-color-1'],
      padding: 4,
    },
    searchInput: {
      flexGrow: 1,
      marginRight: 4,
      borderRadius: 10,
      backgroundColor: theme['background-basic-color-2'],
      borderWidth: 0,
      paddingHorizontal: 10,
    },
    filterBtn: {
      borderRadius: 10,
      backgroundColor: theme['background-basic-color-2'],
      borderWidth: 0,
    },
    productGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      paddingHorizontal: 2,
    },
    productCardWrapper: {
      margin: 8,
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
      padding: 20,
    },
    loadingMoreContainer: {
      padding: 10,
      alignItems: 'center',
    },
    addressText: {
      fontSize: 14,
      color: theme['color-basic-300'],
      marginTop: 4,
    },
    contactText: {
      fontSize: 14,
      color: theme['color-basic-400'],
      marginTop: 2,
    },
    clickableText: {
      textDecorationLine: 'underline',
      color: theme['color-primary-default'],
    },
    searchInfo: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginBottom: 8,
    },
    searchInfoText: {
      fontSize: 14,
      color: theme['color-basic-600'],
      fontStyle: 'italic',
    },
    noResultsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    noResultsIcon: {
      width: 48,
      height: 48,
      marginBottom: 16,
      tintColor: theme['color-basic-400'],
    },
    noResultsText: {
      fontSize: 16,
      color: theme['color-basic-600'],
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 24,
    },
    clearSearchBtn: {
      marginTop: 8,
    },
  });
