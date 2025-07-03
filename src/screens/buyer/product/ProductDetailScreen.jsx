import { Button, Divider, Icon, Layout, Text, useTheme as useUIKittenTheme } from '@ui-kitten/components';
import { useTheme } from '../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { AirbnbRating } from 'react-native-ratings';
import { ProductsList } from '../../../components/buyer/ProductsList';
import { ThemedIcon } from '../../../components/Icon';
import { Price } from '../../../components/Price';
import { ProductImagesSlider } from '../../../components/product';
import { flexeStyles, spacingStyles } from '../../../utils/globalStyles';
import React, { useCallback, useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { axiosBuyerClient } from '../../../utils/axiosClient';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

import { loadSellerProducts, selectSellerProducts } from '../../../store/sellerDetails';
import { addToWishlist, removeFromWishlist, selectIsInWishlist } from '../../../store/wishlist';
import { calculateDiscountedPrice } from '../../../utils/products';
import { selectBaseUrls } from '../../../store/configs';
import ProductDetailShimmer from './components/ProductDetailShimmer';

export const ProductDetailScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const uiKittenTheme = useUIKittenTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const baseUrls = useSelector(selectBaseUrls);
  const { productId, slug } = route.params || {};
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Get wishlist status from Redux
  const isInWishlist = useSelector(state => selectIsInWishlist(state, product?.id));

  const navigateToProductDetail = (productId, slug) => {
    console.log("[navigateToProductDetail]", productId, slug);
    navigation.navigate('ProductDetail', {productId: productId, slug: slug});
  };

  const navigateToVandorDetail = vandorId => {
    console.log("[navigateToVandorDetail]", vandorId);
    navigation.navigate('VandorDetail', {sellerId: vandorId});
  };

  const dispatch = useDispatch();
  const { sellerProducts, sellerProductsLoading } = useSelector(selectSellerProducts);

  const parsedProducts = useCallback(
    list => {
      if (!Array.isArray(list)) return [];
      return list.map(productItem => ({
        id: productItem.id,
        name: productItem.name,
        image: `${baseUrls['product_thumbnail_url']}/${productItem.thumbnail}`,
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
        slug: productItem.slug,
      }));
    },
    [baseUrls],
  );

  useEffect(() => {
    console.debug("SELLER ID", product?.seller?.id)
    if (product?.seller?.id) {
      dispatch(loadSellerProducts({ sellerId: product.seller.id, limit: 10, offset: 0 }));
    }
  }, [product?.seller?.id]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        console.error('No slug provided for product details');
        return;
      }
      try {
        setLoading(true);
        const response = await axiosBuyerClient.get(`products/details/${slug}`);
        console.log("[fetchProductDetails]", JSON.stringify(response.data, null, 10));
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product [fetchProduct]:', error || error?.message || error?.response?.data?.message);
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
        const response = await axiosBuyerClient.get(`products/related-products/${product.id}`);
        console.log("[fetchRelatedProducts]", JSON.stringify(response, null, 10));
        setRelatedProducts(response.data);
      } catch (error) {
        console.error('Error fetching related products [fetchRelatedProducts]:', error || error?.message || error?.response?.data?.message);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedProducts();
  }, [product?.id]);

  if (loading || !product) {
    return (<ProductDetailShimmer />);
  }

  const addToCart = async (product) => {
    try {
      setAddingToCart(true);
      console.log("[addToCart data]======", product, "------------------>",product.id, );
      const response = await axiosBuyerClient.post('cart/add', {
        id: product.id,
        quantity: 1,
      });
      console.log('Product added to cart:', response, "-=================================?>",response.data);
      setAddingToCart(false);
      setAddedToCart(true);
      
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding to cart:', error || error?.message || error?.response?.data?.message);
      
      setAddingToCart(false);
    }
    console.log("[addToCart]", product);
  };

  const toggleWishlist = () => {
    if (!product?.id) return;
    
    if (isInWishlist) {
      // Remove from wishlist
      dispatch(removeFromWishlist({productId: product.id}));
    } else {
      // Add to wishlist with complete product data
      const productData = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        unit_price: product.unit_price,
        discount: product.discount,
        discount_type: product.discount_type,
        current_stock: product.current_stock,
        thumbnail: product.thumbnail,
        images: product.images,
        details: product.details,
        reviews_count: product.reviews_count,
        average_review: product.average_review,
      };
      dispatch(addToWishlist({productId: product.id, productData}));
    }
  };

  const navigateToSellerProfile = (sellerId) => {
    navigation.navigate('VandorDetail', { sellerId });
    console.log("[navigateToSellerProfile]", sellerId);
  };

  console.log('Rendering shimmer', ProductDetailShimmer);

  const productImages = product.images.map(image => ({
    id: image,
    image: `${baseUrls['product_image_url']}/${image}`
  }));

  const parsedRelatedProducts = relatedProducts.map(item => ({
    id: item.id,
    name: item.name,
    image: `${baseUrls['product_thumbnail_url']}/${item.thumbnail}`,
    price: item.unit_price,
    oldPrice: item.discount > 0 ? item.unit_price : 0,
    isSoldOut: item.current_stock === 0,
    discountType: item.discount_type,
    discount: item.discount,
    rating: item.average_review || 0,
    slug: item.slug,
  }));

  return (
    <Layout level="3" style={{ flex: 1, backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'],
          flexGrow: 1,
          justifyContent: 'flex-start',
          paddingTop: 10,
        }}>

        <ProductImagesSlider slideList={productImages} />
        <Layout level="1" style={{ backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }}>
          <Layout
            style={[
              spacingStyles.px8,
              spacingStyles.pt8,
              flexeStyles.row,
              flexeStyles.itemsCenter,
              flexeStyles.contentBetween,
              { backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] },
            ]}>
            <Layout style={{ backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }}>
              <Text 
                style={[
                  spacingStyles.px4,
                  { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }
                ]} 
                category="h6">
                {product.name}
              </Text>
            </Layout>
            <Button
              accessoryLeft={
                <ThemedIcon 
                  name={isInWishlist ? "heart" : "heart-outline"} 
                  fill={isInWishlist ? uiKittenTheme['color-danger-default'] : (isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'])}
                />
              }
              size="small"
              appearance="ghost"
              onPress={toggleWishlist}
            />
            <Button
              accessoryLeft={<ThemedIcon name="share" />}
              size="small"
              appearance="ghost"
            />
          </Layout>

          <Layout style={{ marginHorizontal: 12, marginTop: 0, backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }}>
            <Price fontSize={20} amount={product.unit_price} />
            {product.discount > 0 && (
              <Layout style={flexeStyles.row}>
                <Price amount={product.unit_price} cross={true} />
                <Text style={{ marginLeft: 4, color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }}>
                  -{product.discount}{product.discount_type === 'percent' ? '%' : ''}
                </Text>
              </Layout>
            )}
          </Layout>

          <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
          
          <Layout style={{ flexDirection: 'row', marginTop: 18, marginBottom: 8, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
            <Button
              onClick={() => { }}
              style={{ 
                flex: 1, 
                backgroundColor: theme['color-shadcn-primary'], 
                borderRadius: 6, 
                marginRight: 8, 
                borderWidth: 0, 
                height: 45 
              }}
              textStyle={{ color: theme['color-shadcn-primary-foreground'], fontWeight: 'bold' }}
              appearance="filled">Buy Now</Button>

            <Button
              onPress={() => addToCart(product)}
              style={{ 
                flex: 1, 
                backgroundColor: theme['color-shadcn-primary'], 
                borderRadius: 6, 
                marginRight: 8, 
                borderWidth: 0, 
                height: 45 
              }}
              textStyle={{ color: theme['color-shadcn-primary-foreground'], fontWeight: 'bold' }}
              appearance="filled"
              disabled={addingToCart}
              accessoryLeft={
                addingToCart ? () => <ActivityIndicator size="small" color={theme['color-shadcn-primary-foreground']} /> : undefined
              }
            >
              {addingToCart ? '' : addedToCart ? 'Added to Cart' : 'Add to Cart'}
            </Button>

            <Button
              onClick={() => { }}
              style={{ 
                flex: 1, 
                backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
                borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
                borderWidth: 1, 
                borderRadius: 6, 
                height: 45 
              }}
              textStyle={{ 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'], 
                fontWeight: 'bold' 
              }}
              appearance="outline">Chat</Button>
          </Layout>

          <Layout style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8, marginTop: 8 }}>
            <TouchableOpacity style={{ flex: 1, alignItems: 'center' }} onPress={() => setActiveTab('overview')}>
              <Text style={{ 
                fontWeight: 'bold', 
                color: activeTab === 'overview' 
                  ? (isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'])
                  : (isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']), 
                fontSize: 16 
              }}>Overview</Text>
              {activeTab === 'overview' && <View style={{ 
                height: 4, 
                backgroundColor: theme['color-shadcn-primary'], 
                width: 60, 
                borderRadius: 2, 
                marginTop: 2 
              }} />}
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, alignItems: 'center' }} onPress={() => setActiveTab('reviews')}>
              <Text style={{ 
                fontWeight: 'bold', 
                color: activeTab === 'reviews' 
                  ? (isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'])
                  : (isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']), 
                fontSize: 16 
              }}>Reviews</Text>
              {activeTab === 'reviews' && <View style={{ 
                height: 4, 
                backgroundColor: theme['color-shadcn-primary'], 
                width: 60, 
                borderRadius: 2, 
                marginTop: 2 
              }} />}
            </TouchableOpacity>
          </Layout>

          {activeTab === 'overview' ? (
            <Layout style={[spacingStyles.p16, { backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }]}
              level="1">
              <Text
                category="p1"
                style={{
                  marginBottom: 10,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                }}>
                Description
              </Text>
              <Text style={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}>
                {product.details}
              </Text>

              <Layout style={{ marginTop: 16 }}>
                <Text
                  category="p1"
                  style={{
                    marginBottom: 10,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                  }}>
                  Product Details
                </Text>

                <Layout style={{ flexDirection: 'row', marginBottom: 8 }}>
                  <Text style={{ flex: 1, color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], fontSize: 14 }}>Minimum Order Quantity:</Text>
                  <Text style={{ flex: 1, fontWeight: '600', color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'], fontSize: 14 }}>{product.minimum_order_qty} {product.unit}</Text>
                </Layout>

                <Layout style={{ flexDirection: 'row', marginBottom: 8 }}>
                  <Text style={{ flex: 1, color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], fontSize: 14 }}>Current Stock:</Text>
                  <Text style={{ flex: 1, fontWeight: '600', color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'], fontSize: 14 }}>{product.current_stock} {product.unit}</Text>
                </Layout>

                <Layout style={{ flexDirection: 'row', marginBottom: 8 }}>
                  <Text style={{ flex: 1, color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], fontSize: 14 }}>Featured:</Text>
                  <Text style={{ flex: 1, fontWeight: '600', color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'], fontSize: 14 }}>{product.featured ? 'Yes' : 'No'}</Text>
                </Layout>

                <Layout style={{ flexDirection: 'row', marginBottom: 8 }}>
                  <Text style={{ flex: 1, color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], fontSize: 14 }}>Product Type:</Text>
                  <Text style={{ flex: 1, fontWeight: '600', color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'], fontSize: 14 }}>{product.product_type}</Text>
                </Layout>

                <Layout style={{ flexDirection: 'row', marginBottom: 8 }}>
                  <Text style={{ flex: 1, color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], fontSize: 14 }}>Refundable:</Text>
                  <Text style={{ flex: 1, fontWeight: '600', color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'], fontSize: 14 }}>{product.refundable ? 'Yes' : 'No'}</Text>
                </Layout>

                <Layout style={{ flexDirection: 'row', marginBottom: 8 }}>
                  <Text style={{ flex: 1, color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], fontSize: 14 }}>Free Shipping:</Text>
                  <Text style={{ flex: 1, fontWeight: '600', color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'], fontSize: 14 }}>{product.free_shipping ? 'Yes' : 'No'}</Text>
                </Layout>

                <Layout style={{ marginTop: 16 }}>
                  <Text
                    category="p1"
                    style={{
                      marginBottom: 10,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                    }}>
                    Seller Location
                  </Text>
                  <Layout style={{ flexDirection: 'row', marginBottom: 8 }}>
                    <Text style={{ flex: 1, color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], fontSize: 14 }}>Address:</Text>
                    <Text style={{ flex: 1, fontWeight: '600', color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'], fontSize: 14 }}>{product.seller.shop.address}</Text>
                  </Layout>
                  <Layout style={{ flexDirection: 'row', marginBottom: 8 }}>
                    <Text style={{ flex: 1, color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], fontSize: 14 }}>City:</Text>
                    <Text style={{ flex: 1, fontWeight: '600', color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'], fontSize: 14 }}>{product.seller.city}</Text>
                  </Layout>
                  <Layout style={{ flexDirection: 'row', marginBottom: 8 }}>
                    <Text style={{ flex: 1, color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], fontSize: 14 }}>State:</Text>
                    <Text style={{ flex: 1, fontWeight: '600', color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'], fontSize: 14 }}>{product.seller.state}</Text>
                  </Layout>
                </Layout>
              </Layout>
            </Layout>
          ) : (
            <Layout style={[spacingStyles.p16, { backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }]} level="1">
              <Text
                category="p1"
                style={{
                  marginBottom: 10,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                }}>
                Reviews ({product.reviews_count})
              </Text>
              {product.reviews.length > 0 ? (
                <Layout style={{ marginTop: 8 }}>
                  {product.reviews.map((review, index) => (
                    <Layout key={index} style={{ paddingVertical: 4 }}>
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
                          style={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}
                        >
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
                      <Text style={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}>
                        {review.comment}
                      </Text>
                      <Divider style={{ marginTop: 8, backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
                    </Layout>
                  ))}
                </Layout>
              ) : (
                <Text style={{ color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }}>
                  No reviews yet
                </Text>
              )}
            </Layout>
          )}
        </Layout>

        {/* SELLER INFO CARD */}
        <View style={{ 
          backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
          borderRadius: 12, 
          marginHorizontal: 0, 
          marginBottom: 16, 
          marginTop: 4, 
          paddingVertical: 16, 
          paddingHorizontal: 20, 
          shadowColor: '#000', 
          shadowOpacity: 0.04, 
          shadowRadius: 6, 
          shadowOffset: { width: 0, height: 2 }, 
          elevation: 1, 
          borderWidth: 1, 
          borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Image
              source={{ uri: `${baseUrls['shop_image_url']}/${product.seller.shop.image}` }}
              style={{ 
                width: 48, 
                height: 48, 
                borderRadius: 24, 
                marginRight: 10, 
                backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'] 
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontWeight: 'bold', 
                fontSize: 17, 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] 
              }}>
                {product.seller.shop.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Text style={{ 
                  color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], 
                  fontSize: 13, 
                  marginRight: 2 
                }}>
                  Seller Info
                </Text>
                <Icon 
                  name="info" 
                  width={14} 
                  height={14} 
                  fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']} 
                />
              </View>
            </View>
          </View>
          <Divider style={{ 
            marginVertical: 8,
            backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
          }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ 
              flex: 1, 
              alignItems: 'center', 
              backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'], 
              borderRadius: 10, 
              marginRight: 6, 
              paddingVertical: 12 
            }}>
              <Text style={{ 
                fontWeight: 'bold', 
                fontSize: 28, 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] 
              }}>
                {product.seller.shop.products_count || 0}
              </Text>
              <Text style={{ 
                color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], 
                fontSize: 15, 
                fontWeight: '500' 
              }}>
                Products
              </Text>
            </View>
            <View style={{ 
              flex: 1, 
              alignItems: 'center', 
              backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'], 
              borderRadius: 10, 
              marginLeft: 6, 
              paddingVertical: 12 
            }}>
              <Text style={{ 
                fontWeight: 'bold', 
                fontSize: 28, 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] 
              }}>
                {product.reviews_count}
              </Text>
              <Text style={{ 
                color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], 
                fontSize: 15, 
                fontWeight: '500' 
              }}>
                Reviews
              </Text>
            </View>
          </View>
          <TouchableOpacity style={{ marginTop: 2, borderRadius: 8, overflow: 'hidden' }}>
            <LinearGradient
              colors={[theme['color-shadcn-primary'], theme['color-primary-400']]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 12, alignItems: 'center', borderRadius: 8 }}>
              <Text 
                onPress={() => { navigateToVandorDetail(product.seller.id) }} 
                style={{ color: theme['color-shadcn-primary-foreground'], fontWeight: 'bold', fontSize: 18 }}
              >
                Visit Store
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Layout level="1" style={[spacingStyles.px16, spacingStyles.py8]}>
          <View style={{ marginTop: 20, marginBottom: 80 }}>
            <ProductsList
              listTitle="Related Products"
              loading={sellerProductsLoading}
              list={parsedProducts(relatedProducts.filter(p => p.id !== product.id))}
              onProductDetail={(productId, slug) => navigateToProductDetail(productId, slug)}
            />

            <ProductsList
              listTitle="From Seller"
              loading={sellerProductsLoading}
              list={parsedProducts(sellerProducts.products.filter(p => p.id !== product.id))}
              onProductPress={(item) => navigateToProductDetail(item.id, item.slug)}
            />
          </View>
        </Layout>
      </ScrollView>
    </Layout>
  );
};



