import {Button, Input, Layout, Text, useTheme, Spinner} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {Dimensions, Image, ScrollView, View, StyleSheet, Alert} from 'react-native';
import {AirbnbRating} from 'react-native-ratings';
import {ProductCard} from '../../components/product/ProductCard';
import {ThemedIcon} from '../../components/Icon';
import {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {selectBaseUrls} from '../../store/configs';
import {calculateDiscountedPrice} from '../../utils/products';
import { axiosBuyerClient } from '../../utils/axiosClient';
import { ProductsList } from '../../components/buyer/ProductsList';
import { setActiveRoom } from '../../store/chat';
import { setBottomTabBarVisibility } from '../../store/configs';
import { selectIsBuyerAuthenticated, selectIsSellerAuthenticated } from '../../store/user';
import { ChatRoutes } from '../../navigators/ChatNavigator';

const {width: windowWidth} = Dimensions.get('screen');

export const VandorDetailScreen = ({route, navigation}) => {
  const {t} = useTranslation();
  const theme = useTheme();
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
    fetchProducts(0, searchQuery);
  }, [sellerId]);

  const fetchSellerInfo = async () => {
    setSellerInfoLoading(true);
    setSellerInfoError(null);
    try {
      const res = await axiosBuyerClient.get(`/seller`, { params: { seller_id: sellerId } });
      setSellerInfo(res.data);
    } catch (err) {
      setSellerInfoError('Failed to load seller information');
    } finally {
      setSellerInfoLoading(false);
    }
  };

  const fetchProducts = async (newOffset = 0, search = '') => {
    if (newOffset === 0) setProductsLoading(true);
    setProductsError(null);
    try {
      const res = await axiosBuyerClient.get(`/seller/${sellerId}/all-products`, {
        params: { limit, offset: newOffset, search }
      });
      if (newOffset === 0) {
        setProducts(res.data.products);
      } else {
        setProducts(prev => [...prev, ...res.data.products]);
      }
      setTotalSize(res.data.total_size);
      setOffset(newOffset + limit);
    } catch (err) {
      setProductsError('Failed to load products');
    } finally {
      setProductsLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const safeProducts = Array.isArray(products) ? products : [];
    if (safeProducts.length < totalSize && !loadingMore) {
      setLoadingMore(true);
      fetchProducts(offset, searchQuery);
    }
  };

  const handleSearch = () => {
    fetchProducts(0, searchQuery);
  };

  const handleChatWithSeller = () => {
    if (!isBuyerAuthenticated) {
      const message = isSellerAuthenticated
        ? 'You are signed in as a seller. Please also sign in as a buyer to chat with other sellers.'
        : 'Please sign in as a buyer to chat with sellers.';
      Alert.alert(
        'Buyer Authentication Required',
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          // You may want to add a sign-in action here
        ]
      );
      return;
    }
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
      })
    );
    navigation.navigate(ChatRoutes.MESSAGES, {
      roomId: sellerInfo?.seller?.id,
      recipientProfile: sellerInfo?.seller?.shop?.image
        ? `${baseUrls['shop_image_url']}/${sellerInfo.seller.shop.image}`
        : '',
      recipientName: sellerInfo?.seller?.shop?.name,
      chatType: 'buyer',
      // Optionally add more context here
    });
  };

  if (sellerInfoLoading) {
    return (
      <Layout level="3" style={styles(theme).loadingContainer}>
        <Spinner size="large" />
      </Layout>
    );
  }

  if (sellerInfoError || !sellerInfo) {
    return (
      <Layout level="3" style={styles(theme).errorContainer}>
        <Text status="danger">{sellerInfoError || 'Failed to load seller information'}</Text>
      </Layout>
    );
  }

  const safeProducts = Array.isArray(products) ? products : [];
  const parsedProducts = safeProducts.map(product => ({
    id: product.id,
    title: product.name,
    rating: product.rating?.[0]?.average || 0,
    discountPercentage: product.discount,
    isSoldOut: product.current_stock === 0,
    price: product.discount > 0
      ? calculateDiscountedPrice(
          product.unit_price,
          product.discount,
          product.discount_type,
        )
      : product.unit_price,
    oldPrice: product.discount > 0 ? product.unit_price : 0,
    image:
      baseUrls && baseUrls['product_thumbnail_url'] && product.thumbnail
        ? `${baseUrls['product_thumbnail_url']}/${product.thumbnail}`
        : '',
  }));

  return (
    <Layout level="3" style={{flex: 1, backgroundColor: theme['background-basic-color-2']}}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-start',
          paddingTop: 10,
          paddingBottom: 90,
        }}>
        {/* Banner */}
        <View style={styles(theme).bannerShadow}>
          <Image
            source={{
              uri: sellerInfo?.seller?.shop && sellerInfo.seller.shop.banner
                ? `https://petbookers.com.pk/storage/app/public/shop/banner/${sellerInfo.seller.shop.banner}`
                : undefined,
            }}
            style={styles(theme).banner}
            defaultSource={require('../../../assets/new/lion.png')}
          />
        </View>
        {/* Store Info Card */}
        <View style={styles(theme).storeInfoCard}>
          <View style={styles(theme).storeInfoRow}>
            <Image
              source={{
                uri: sellerInfo?.seller?.shop && sellerInfo.seller.shop.image
                  ? `${baseUrls['shop_image_url']}/${sellerInfo.seller.shop.image}`
                  : undefined,
              }}
              style={styles(theme).avatar}
              defaultSource={require('../../../assets/new/lion.png')}
            />
            <View style={{flex: 1}}>
              <Text style={styles(theme).storeName}>{sellerInfo?.seller?.shop?.name || 'Unknown Store'}</Text>
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
                <Text style={styles(theme).ratingValue}>{sellerInfo?.avg_rating || 0}</Text>
                <Text style={styles(theme).ratingCount}>({sellerInfo?.total_review || 0})</Text>
              </View>
              <Text style={styles(theme).orderCount}>{sellerInfo?.total_order || 0} Orders</Text>
              <Text style={styles(theme).addressText}>{sellerInfo?.seller?.shop?.address || 'No address provided'}</Text>
              <Text style={styles(theme).contactText}>{sellerInfo?.seller?.shop?.contact || 'No contact provided'}</Text>
            </View>
            <Button
              appearance="ghost"
              accessoryLeft={<ThemedIcon name="message-square-outline" status="primary" />}
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
              placeholder="Search in Store"
              style={styles(theme).searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              accessoryRight={<ThemedIcon name="search-outline" />}
            />
            <Button
              appearance="ghost"
              accessoryLeft={<ThemedIcon name="funnel-outline" />}
              size="small"
              style={styles(theme).filterBtn}
            />
          </View>
        </View>
        {/* Product Grid */}
        <ProductsList
          list={parsedProducts}
          listTitle={t('products')}
          loading={productsLoading}
          loadingError={productsError}
          onLoadMore={handleLoadMore}
          onProductDetail={product => {
            navigation.navigate('ProductDetail', {productId: product.id});
          }}
          hasMore={safeProducts.length < totalSize}
          hideViewAllBtn={true}
          onViewAll={() => {
            navigation.navigate('ProductsList', {
              sellerId,
              title: sellerInfo?.seller?.shop?.name || 'Products',
            });
          }}
          cardWidth={(windowWidth - 56) / 2}
          cardHeight={(windowWidth - 56) / 2.2}
        />
        <View style={styles(theme).productGrid}>
          {parsedProducts.map(item => (
            <View key={item.id} style={styles(theme).productCardWrapper}>
              <ProductCard
                {...item}
                cardWidth={(windowWidth - 56) / 2}
                onProductDetail={(id, slug) => navigation.navigate('ProductDetail', { productId: id, slug })}
              />
            </View>
          ))}
        </View>
        {productsLoading && (
          <View style={styles(theme).loadingMoreContainer}>
            <Spinner size="small" />
          </View>
        )}
        {!productsLoading && safeProducts.length < totalSize && (
          <Button appearance="ghost" onPress={handleLoadMore} style={{margin: 16}}>
            {loadingMore ? <Spinner size="small" /> : t('Load More')}
          </Button>
        )}
      </ScrollView>
    </Layout>
  );
};

const styles = (theme) => StyleSheet.create({
  bannerShadow: {
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 12,
    // shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  banner: {
    width: '100%',
    height: (windowWidth - 32) / 2.2,
    resizeMode: 'cover',
    borderRadius: 18,
  },
  storeInfoCard: {
    backgroundColor: theme['background-basic-color-1'],
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: theme['text-basic-color'],
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
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
    shadowColor: theme['text-basic-color'],
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
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
    color: theme['color-basic-700'],
    marginTop: 4,
  },
  contactText: {
    fontSize: 14,
    color: theme['color-basic-700'],
    marginTop: 2,
  },
});
