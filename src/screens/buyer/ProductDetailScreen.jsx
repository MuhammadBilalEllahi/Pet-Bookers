import { Button, Divider, Layout, Text, useTheme } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { FlatList, Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { AirbnbRating } from 'react-native-ratings';
import { ProductsList } from '../../components/buyer/ProductsList';
import { ThemedIcon } from '../../components/Icon';
import { Price } from '../../components/Price';
import { ProductImagesSlider } from '../../components/product';
import { flexeStyles, spacingStyles } from '../../utils/globalStyles';
import React, { useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { axiosBuyerClient } from '../../utils/axiosClient';
import { useSelector } from 'react-redux';
import { selectBaseUrls } from '../../store/configs';

const relatedProducts = Array.from({ length: 7 }).map((_, i) => {
  return {
    id: i,
    title: 'Lorem ipsum dolor sit amet',
    rating: Math.random() * 5,
    discountPercentage: Math.floor(Math.random() * 25),
    isSoldOut: Math.floor(Math.random() * 250) % 3 === 0,
    price: Math.floor(Math.random() * 250 + 75),
    oldPrice: Math.floor(Math.random() * 250) * 1.25,
    image:
      'https://petbookie.com/storage/app/public/product/thumbnail/2023-05-07-645829a70c659.png',
  };
});

const featuredImagesDummy = Array.from({ length: 3 }).map((_, i) => {
  return {
    id: i,
    image:
      'https://petbookie.com/storage/app/public/product/thumbnail/2023-05-07-645829a70c659.png',
  };
});

export const ProductDetailScreen = ({ route }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const baseUrls = useSelector(selectBaseUrls);
  const { productId, slug } = route.params || {};

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        console.error('No slug provided for product details');
        return;
      }
      try {
        setLoading(true);
        const response = await axiosBuyerClient.get(`products/details/${slug}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product [fetchProduct]:', error || error?.message || error?.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const addToCart = (product) => {
    console.log("[addToCart]", product);
  };

  if (loading || !product) {
    return (
      <Layout level="3" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </Layout>
    );
  }

  const productImages = product.images.map(image => ({
    id: image,
    image: `${baseUrls['product_image_url']}/${image}`
  }));

  return (
    <Layout level="3" style={{ flex: 1 }}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-start',
          paddingTop: 10,
        }}>

        <ProductImagesSlider slideList={productImages} />
        <Layout level="1">
          <Layout
            style={[
              spacingStyles.px16,
              spacingStyles.py8,
              flexeStyles.row,
              flexeStyles.itemsCenter,
              flexeStyles.contentBetween,
            ]}>
            <Layout>
              <Price amount={product.unit_price} />
              {product.discount > 0 && (
                <Layout style={flexeStyles.row}>
                  <Price amount={product.unit_price} cross={true} />
                  <Text style={{ marginLeft: 4 }}>-{product.discount}{product.discount_type === 'percent' ? '%' : ''}</Text>
                </Layout>
              )}
            </Layout>
            <Button
              accessoryLeft={<ThemedIcon name="heart" status="primary" />}
              size="small"
              appearance="ghost"
            />
          </Layout>
          <Divider />
          <Text style={[spacingStyles.px16, { marginTop: 10 }]} category="h6">
            {product.name}
          </Text>
          <Layout
            style={[
              spacingStyles.px16,
              flexeStyles.row,
              flexeStyles.itemsCenter,
              {
                marginTop: 4,
              },
            ]}>
            <AirbnbRating
              count={5}
              defaultRating={product.average_review}
              showRating={false}
              size={18}
              isDisabled={true}
              selectedColor={theme['color-primary-default']}
            />
            <Text category="h6" style={{ marginLeft: 4 }}>
              {product.average_review}
            </Text>
          </Layout>
          <Divider />
          <Layout style={{ flexDirection: 'row', marginTop: 18, marginBottom: 8, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
            <Button
              onClick={() => {}}
              style={{ flex: 1, backgroundColor: '#E65100', borderRadius: 6, marginRight: 8, borderWidth: 0, height: 40 }} 
              textStyle={{ color: '#fff', fontWeight: 'bold' }} 
              appearance="filled">Buy Now</Button>
            <Button
              onClick={() => addToCart(product)}
              style={{ flex: 1, backgroundColor: '#388E3C', borderRadius: 6, marginRight: 8, borderWidth: 0, height: 40 }} 
              textStyle={{ color: '#fff', fontWeight: 'bold' }} 
              appearance="filled">Add to cart</Button>
            <Button 
              onClick={() => {}}
              style={{ flex: 1, backgroundColor: '#fff', borderColor: '#222', borderWidth: 1, borderRadius: 6, height: 40 }} 
              textStyle={{ color: '#222', fontWeight: 'bold' }} 
              appearance="outline">Chat</Button>
          </Layout>
          <Layout style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8, marginTop: 8 }}>
            <TouchableOpacity style={{ flex: 1, alignItems: 'center' }} onPress={() => setActiveTab('overview')}>
              <Text style={{ fontWeight: 'bold', color: activeTab === 'overview' ? '#222' : '#888', fontSize: 16 }}>Overview</Text>
              {activeTab === 'overview' && <View style={{ height: 4, backgroundColor: '#222', width: 60, borderRadius: 2, marginTop: 2 }} />}
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, alignItems: 'center' }} onPress={() => setActiveTab('reviews')}>
              <Text style={{ fontWeight: 'bold', color: activeTab === 'reviews' ? '#222' : '#888', fontSize: 16 }}>Reviews</Text>
              {activeTab === 'reviews' && <View style={{ height: 4, backgroundColor: '#222', width: 60, borderRadius: 2, marginTop: 2 }} />}
            </TouchableOpacity>
          </Layout>
          {activeTab === 'overview' ? (
            <Layout style={spacingStyles.p16} level="1">
              <Text
                category="p1"
                style={{
                  marginBottom: 10,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}>
                Description
              </Text>
              <Text>{product.details}</Text>
            </Layout>
          ) : (
            <Layout style={spacingStyles.p16} level="1">
              <Text
                category="p1"
                style={{
                  marginBottom: 10,
                  fontWeight: '700',
                  textTransform: 'uppercase',
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
                        <Text category="s1">{review.user?.name || 'Anonymous'}</Text>
                        <AirbnbRating
                          count={5}
                          defaultRating={review.rating}
                          showRating={false}
                          size={14}
                          isDisabled={true}
                          selectedColor={theme['color-primary-default']}
                        />
                      </Layout>
                      <Text>{review.comment}</Text>
                      <Divider style={{ marginTop: 8 }} />
                    </Layout>
                  ))}
                </Layout>
              ) : (
                <Text>No reviews yet</Text>
              )}
            </Layout>
          )}
        </Layout>

        {/* SELLER INFO CARD */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 0, marginBottom: 16, marginTop: 4, paddingVertical: 16, paddingHorizontal: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1, borderWidth: 1, borderColor: '#eee' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Image 
              source={{ uri: `${baseUrls['shop_image_url']}/${product.seller.shop.image}` }} 
              style={{ width: 48, height: 48, borderRadius: 24, marginRight: 10, backgroundColor: '#eee' }} 
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 17, color: '#222' }}>{product.seller.shop.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Text style={{ color: '#888', fontSize: 13, marginRight: 2 }}>Seller Info</Text>
                <ThemedIcon name="info" width={14} height={14} fill="#888" />
              </View>
            </View>
          </View>
          <Divider style={{ marginVertical: 8 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#f7f7f7', borderRadius: 10, marginRight: 6, paddingVertical: 12 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 28, color: '#222' }}>{product.seller.shop.products_count || 0}</Text>
              <Text style={{ color: '#888', fontSize: 15, fontWeight: '500' }}>Products</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#f7f7f7', borderRadius: 10, marginLeft: 6, paddingVertical: 12 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 28, color: '#222' }}>{product.reviews_count}</Text>
              <Text style={{ color: '#888', fontSize: 15, fontWeight: '500' }}>Reviews</Text>
            </View>
          </View>
          <TouchableOpacity style={{ marginTop: 2, borderRadius: 8, overflow: 'hidden' }}>
            <LinearGradient
              colors={["#FF512F", "#F09819"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 12, alignItems: 'center', borderRadius: 8 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Visit Store</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Layout level="1" style={[spacingStyles.px16, spacingStyles.py8]}>
          <Text
            style={{
              fontSize: 16,
              textTransform: 'uppercase',
              marginBottom: 4,
              fontWeight: '700',
            }}>
            From the same seller
          </Text>
          <FlatList
            data={[1, 2, 3, 4]}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Layout
                level="1"
                style={{ width: 130, marginHorizontal: 4, paddingBottom: 4 }}>
                <Image
                  source={{
                    uri: 'https://petbookie.com/storage/app/public/product/thumbnail/2023-05-07-645829a70c659.png',
                  }}
                  style={{
                    width: 130,
                    height: 80,
                    resizeMode: 'cover',
                  }}
                />
                <Text category="p1" style={{ fontSize: 16, marginVertical: 8 }}>
                  Lorem ipsum dolor sit amet consectetur.
                </Text>
                <Price amount={230} />
              </Layout>
            )}
          />
        </Layout>

        <ProductsList
          list={relatedProducts}
          hideHeader={true}
          listTitle="Related Products"
          hideViewAllBtn={true}
          containerStyle={{ marginVertical: 16 }}
        />
      </ScrollView>
      <Layout
        level="1"
        style={[
          spacingStyles.px16,
          flexeStyles.row,
          flexeStyles.itemsCenter,
          {
            paddingTop: 10,
          },
        ]}>
        <Button
          appearance="outline"
          style={{ paddingHorizontal: 30, height: 45 }}>
          Buy
        </Button>
        <Button
          accessoryLeft={
            <ThemedIcon name="shopping-cart-outline" fill="#fff" />
          }
          style={{ height: 45, flexGrow: 1, marginLeft: 8 }}>
          Add to Cart
        </Button>
      </Layout>
    </Layout>
  );
};
