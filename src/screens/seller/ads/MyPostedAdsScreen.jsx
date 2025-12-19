import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import {Button} from '@ui-kitten/components';
import {
  authSellerClient,
  handleAuthError,
  setAuthModalHandlers,
} from '../../../utils/authAxiosClient';
import {useDispatch, useSelector} from 'react-redux';
import {
  selectIsSellerAuthenticated,
  selectIsBuyerAuthenticated,
} from '../../../store/user';
import {useTheme} from '../../../theme/ThemeContext';
import {useTranslation} from 'react-i18next';
import Toast from 'react-native-toast-message';
import {AppScreens} from '../../../navigators/AppNavigator';
import {Image} from 'react-native';
import {BASE_URLS} from '../../../store/configs';
import {
  selectProductCategories,
  loadProductCategories,
} from '../../../store/productCategories';

const MyPostedAdsScreen = ({navigation}) => {
  const {t} = useTranslation();
  const {theme, isDark} = useTheme();
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get authentication states
  const isSellerAuthenticated = useSelector(selectIsSellerAuthenticated);
  const isBuyerAuthenticated = useSelector(selectIsBuyerAuthenticated);

  // Get categories for mapping
  const {categories} = useSelector(selectProductCategories);

  // Set up auth modal handlers
  useEffect(() => {
    setAuthModalHandlers({
      showSellerAuthModal: () =>
        navigation.navigate(AppScreens.LOGIN, {isItSeller: true}),
    });
  }, [navigation]);

  // Load categories when component mounts
  useEffect(() => {
    dispatch(loadProductCategories());
  }, [dispatch]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await authSellerClient.get(`products/list`);
      // console.log('Seller Products:', response.data);
      setProducts(response.data || []);

      const checking = await authSellerClient.get(`products/details/49`);
      // console.log('Product details check:', checking.data);
    } catch (error) {
      console.error('Error loading products:', error);
      handleAuthError(error, err => {
        // Don't show error toast for auth errors, they're handled by handleAuthError
        if (err.type !== 'SELLER_NOT_AUTHENTICATED') {
          Toast.show({
            type: 'error',
            text1: t('common.error'),
            text2: t('vendor.failedToLoadProducts'),
          });
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = product => {
    navigation.navigate('ProductDetail', {
      productId: product.id,
      product: product,
    });
  };

  const handleAddProduct = () => {
    if (!isSellerAuthenticated) {
      navigation.navigate(AppScreens.LOGIN, {isItSeller: true});
      return;
    }
    navigation.navigate(AppScreens.SELLER_ADD_PRODUCT);
  };

  // Helper function to get category names from category_ids
  const getCategoryNames = categoryIds => {
    if (!categoryIds || !categories) return [];

    try {
      // Parse category_ids if it's a string (from JSON response)
      const parsedIds =
        typeof categoryIds === 'string' ? JSON.parse(categoryIds) : categoryIds;

      if (!Array.isArray(parsedIds)) return [];

      return parsedIds
        .map(categoryItem => {
          // Handle object format: {"id":"21","position":1}
          const categoryId =
            typeof categoryItem === 'object' ? categoryItem.id : categoryItem;
          const category = categories.find(cat => cat.id == categoryId); // Use == for string/number comparison
          return category ? category.name : null;
        })
        .filter(Boolean);
    } catch (error) {
      console.error('Error parsing category_ids:', error);
      return [];
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    if (isSellerAuthenticated) {
      loadProducts();
    } else {
      // Show different message based on auth state
      if (isBuyerAuthenticated) {
        Alert.alert(
          t('auth.sellerAuthRequired'),
          t('profile.sellerAuthRequired'),
          [
            {text: t('buttons.cancel'), style: 'cancel'},
            {
              text: t('auth.signInAsSeller'),
              onPress: () => {
                // For now, navigate to login with seller mode
                navigation.navigate('Login', {isItSeller: true});
              },
            },
          ],
        );
      } else {
        Alert.alert(
          t('chatScreen.authRequired.title'),
          t('profile.sellerAuthRequired'),
          [
            {text: t('buttons.cancel'), style: 'cancel'},
            {
              text: t('auth.signInAsSeller'),
              onPress: () => {
                navigation.navigate('Login', {isItSeller: true});
              },
            },
          ],
        );
      }
    }
  }, [isSellerAuthenticated, isBuyerAuthenticated]);

  if (!isSellerAuthenticated) {
    return (
      <View
        style={[
          styles.authContainer,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          },
        ]}>
        <Text
          style={[
            styles.authMessage,
            {
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            },
          ]}>
          {isBuyerAuthenticated
            ? 'Please sign in as a seller to manage your products'
            : 'Please sign in as a seller to view your posted ads'}
        </Text>
        <Button
          onPress={() => navigation.navigate('Login', {isItSeller: true})}
          style={styles.authButton}>
          {t('auth.signInAsSeller')}
        </Button>
      </View>
    );
  }

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          },
        ]}>
        <ActivityIndicator size="large" color={theme['color-primary-500']} />
        <Text
          style={[
            styles.loadingText,
            {
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            },
          ]}>
          Loading your products...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
        },
      ]}>
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            {
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            },
          ]}>
          {t('myAds.header')} ({products.length})
        </Text>
        <Button
          onPress={handleAddProduct}
          style={styles.addButton}
          size="small">
          {t('pagesTitles.AddProduct')}
        </Button>
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text
            style={[
              styles.emptyText,
              {
                color: isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600'],
              },
            ]}>
            You haven't posted any ads yet
          </Text>
          <Button onPress={handleAddProduct} style={styles.addFirstButton}>
            {t('addProduct.submitAd')}
          </Button>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => {
            const categoryNames = getCategoryNames(item.category_ids);

            return (
              <View style={{marginBottom: 18}}>
                <TouchableOpacity
                  style={[
                    {
                      backgroundColor: isDark
                        ? theme['color-shadcn-card']
                        : theme['color-basic-100'],
                      borderRadius: 14,
                      padding: 16,
                      shadowColor: '#000',
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      shadowOffset: {width: 0, height: 2},
                      elevation: 2,
                    },
                  ]}
                  onPress={() => handleProductPress(item)}
                  activeOpacity={0.92}>
                  {/* Header Row with Image and Basic Info */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      marginBottom: 12,
                    }}>
                    {/* Product Image */}
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        backgroundColor: isDark
                          ? theme['color-shadcn-secondary']
                          : theme['color-basic-200'],
                        marginRight: 14,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Image
                        source={{
                          uri: item.thumbnail
                            ? `${BASE_URLS.product_thumbnail_url}/${item.thumbnail}`
                            : item.images && item.images.length > 0
                            ? `${BASE_URLS.product_image_url}/${
                                JSON.parse(item.images)[0]
                              }`
                            : 'https://via.placeholder.com/120x120?text=No+Image',
                        }}
                        style={{width: 60, height: 60, borderRadius: 8}}
                      />
                    </View>

                    {/* Product Basic Info */}
                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          color: isDark
                            ? theme['color-shadcn-foreground']
                            : theme['color-basic-900'],
                          fontSize: 16,
                          fontWeight: 'bold',
                          marginBottom: 4,
                        }}
                        numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          color: theme['color-shadcn-primary'],
                          fontSize: 16,
                          fontWeight: 'bold',
                          marginBottom: 4,
                        }}>
                        Rs {item.unit_price?.toLocaleString()}
                      </Text>

                      {/* Status and Featured Badges */}
                      <View
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          marginBottom: 4,
                        }}>
                        {/* Status Badge */}
                        <View
                          style={{
                            backgroundColor:
                              item.status === 1
                                ? theme['color-success-default']
                                : theme['color-warning-default'],
                            borderRadius: 6,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            marginRight: 6,
                            marginBottom: 4,
                          }}>
                          <Text
                            style={{
                              color: theme['color-basic-100'],
                              fontSize: 10,
                              fontWeight: 'bold',
                            }}>
                            {item.status === 1 ? t('productDetails.active') : t('productDetails.inactive')}
                          </Text>
                        </View>

                        {/* Featured Badge */}
                        {item.featured_status === 1 && (
                          <View
                            style={{
                              backgroundColor: theme['color-primary-500'],
                              borderRadius: 6,
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                              marginRight: 6,
                              marginBottom: 4,
                            }}>
                            <Text
                              style={{
                                color: theme['color-basic-100'],
                                fontSize: 10,
                                fontWeight: 'bold',
                              }}>
                              {t('featured')}
                            </Text>
                          </View>
                        )}

                        {/* Request Status Badge */}
                        {item.request_status !== null && (
                          <View
                            style={{
                              backgroundColor:
                                item.request_status === 1
                                  ? theme['color-success-default']
                                  : item.request_status === 0
                                  ? theme['color-warning-default']
                                  : theme['color-danger-default'],
                              borderRadius: 6,
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                              marginRight: 6,
                              marginBottom: 4,
                            }}>
                            <Text
                              style={{
                                color: theme['color-basic-100'],
                                fontSize: 10,
                                fontWeight: 'bold',
                              }}>
                              {t('common.status')}:{' '}
                              {item.request_status === 1
                                ? t('common.approved')
                                : item.request_status === 0
                                ? t('common.pending')
                                : t('common.rejected')}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Ellipsis icon */}
                    <View style={{marginLeft: 8}}>
                      <Text
                        style={{
                          color: isDark
                            ? theme['color-shadcn-muted-foreground']
                            : theme['color-basic-600'],
                          fontSize: 22,
                        }}>
                        ⋮
                      </Text>
                    </View>
                  </View>

                  {/* Denied Note */}
                  {item.denied_note && (
                    <View
                      style={{
                        backgroundColor: theme['color-danger-100'],
                        borderRadius: 8,
                        padding: 8,
                        marginBottom: 8,
                        borderLeftWidth: 3,
                        borderLeftColor: theme['color-danger-default'],
                      }}>
                      <Text
                        style={{
                          color: theme['color-danger-700'],
                          fontSize: 12,
                          fontWeight: '600',
                          marginBottom: 2,
                        }}>
                        {t('common.rejectionNote')}:
                      </Text>
                      <Text
                        style={{
                          color: theme['color-danger-600'],
                          fontSize: 11,
                          lineHeight: 16,
                        }}>
                        {item.denied_note}
                      </Text>
                    </View>
                  )}

                  {/* Categories */}
                  {categoryNames.length > 0 && (
                    <View style={{marginBottom: 8}}>
                      <Text
                        style={{
                          color: isDark
                            ? theme['color-shadcn-muted-foreground']
                            : theme['color-basic-600'],
                          fontSize: 12,
                          fontWeight: '600',
                          marginBottom: 4,
                        }}>
                        {t('product.categories')}:
                      </Text>
                      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                        {categoryNames.map((categoryName, index) => (
                          <Text
                            key={index}
                            style={{
                              backgroundColor: isDark
                                ? theme['color-shadcn-secondary']
                                : theme['color-basic-200'],
                              color: isDark
                                ? theme['color-shadcn-foreground']
                                : theme['color-basic-900'],
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 12,
                              fontSize: 10,
                              fontWeight: '500',
                              marginRight: 6,
                              marginBottom: 4,
                            }}>
                            {categoryName}
                          </Text>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Product Description */}
                  {item.details && (
                    <View style={{marginBottom: 8}}>
                      <Text
                        style={{
                          color: isDark
                            ? theme['color-shadcn-muted-foreground']
                            : theme['color-basic-600'],
                          fontSize: 12,
                          fontWeight: '600',
                          marginBottom: 4,
                        }}>
                        {t('productDetails.description')}:
                      </Text>
                      <Text
                        style={{
                          color: isDark
                            ? theme['color-shadcn-foreground']
                            : theme['color-basic-900'],
                          fontSize: 11,
                          lineHeight: 16,
                        }}
                        numberOfLines={2}>
                        {item.details}
                      </Text>
                    </View>
                  )}

                  {/* Product Details Row */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 8,
                    }}>
                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          color: isDark
                            ? theme['color-shadcn-muted-foreground']
                            : theme['color-basic-600'],
                          fontSize: 12,
                        }}>
                        {t('productDetails.stock')}: {item.current_stock} {item.unit}
                      </Text>
                      <Text
                        style={{
                          color: isDark
                            ? theme['color-shadcn-muted-foreground']
                            : theme['color-basic-600'],
                          fontSize: 12,
                        }}>
                        {t('productDetails.minOrder')}: {item.minimum_order_qty} {item.unit}
                      </Text>
                      <Text
                        style={{
                          color: isDark
                            ? theme['color-shadcn-muted-foreground']
                            : theme['color-basic-600'],
                          fontSize: 12,
                        }}>
                        {t('product.productType')}: {item.product_type || 'Physical'}
                      </Text>
                      {item.is_living === 1 && (
                        <Text
                          style={{
                            color: theme['color-success-default'],
                            fontSize: 12,
                            fontWeight: '600',
                          }}>
                          {t('addProduct.living')}
                        </Text>
                      )}
                    </View>
                    <View style={{flex: 1, alignItems: 'flex-end'}}>
                      <Text
                        style={{
                          color: isDark
                            ? theme['color-shadcn-muted-foreground']
                            : theme['color-basic-600'],
                          fontSize: 12,
                        }}>
                        {t('product.reviews')}: {item.reviews_count || 0}
                      </Text>
                      <Text
                        style={{
                          color: isDark
                            ? theme['color-shadcn-muted-foreground']
                            : theme['color-basic-600'],
                          fontSize: 12,
                        }}>
                        {t('product.freeShipping')}:{' '}
                        {item.free_shipping
                          ? t('product.free')
                          : `Rs ${item.shipping_cost || 0}`}
                      </Text>
                      <Text
                        style={{
                          color: isDark
                            ? theme['color-shadcn-muted-foreground']
                            : theme['color-basic-600'],
                          fontSize: 12,
                        }}>
                        {t('product.published')}: {item.published === 1 ? t('product.yes') : t('product.no')}
                      </Text>
                      {item.code && (
                        <Text
                          style={{
                            color: isDark
                              ? theme['color-shadcn-muted-foreground']
                              : theme['color-basic-600'],
                            fontSize: 12,
                          }}>
                          {t('editProduct.code')}: {item.code}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Footer Row */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 8,
                      borderTopWidth: 1,
                      borderTopColor: isDark
                        ? theme['color-shadcn-border']
                        : theme['color-basic-300'],
                    }}>
                    <Text
                      style={{
                        color: isDark
                          ? theme['color-shadcn-muted-foreground']
                          : theme['color-basic-600'],
                        fontSize: 11,
                      }}>
                      {t('myAds.createdOn')}:{' '}
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : 'N/A'}
                    </Text>
                    <Text
                      style={{
                        color: isDark
                          ? theme['color-shadcn-muted-foreground']
                          : theme['color-basic-600'],
                        fontSize: 11,
                      }}>
                      {t('product.updated')}:{' '}
                      {item.updated_at
                        ? new Date(item.updated_at).toLocaleDateString()
                        : 'N/A'}
                    </Text>
                  </View>
                </TouchableOpacity>
                {/* Try Featured Ads Button */}
                {/* <TouchableOpacity
                style={{
                  backgroundColor: theme['color-shadcn-primary'],
                  borderRadius: 8,
                  marginTop: 8,
                  paddingVertical: 10,
                  alignItems: 'center',
                }}
                onPress={() =>
                  Toast.show({
                    type: 'info',
                    text1: 'Feature Coming Soon',
                    text2: 'Try Featured Ads functionality coming soon!',
                  })
                }>
                <Text
                  style={{
                    color: theme['color-shadcn-primary-foreground'],
                    fontWeight: 'bold',
                    fontSize: 16,
                  }}>
                  {t('myAds.tryFeatured')}
                </Text>
              </TouchableOpacity> */}
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  addButton: {
    minWidth: 100,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  authMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    minWidth: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  addFirstButton: {
    minWidth: 200,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 14,
  },
  productActions: {
    alignItems: 'flex-end',
  },
  productStatus: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default MyPostedAdsScreen;
