import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FlatList, View, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { Text, Input, Button, Layout } from '@ui-kitten/components';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ProductCard } from '../../components/product/ProductCard';
import { ThemedIcon } from '../../components/Icon';
import { selectBaseUrls } from '../../store/configs';
import { loadWishlist } from '../../store/wishlist';
import { useFocusEffect } from '@react-navigation/native';
import { calculateDiscountedPrice } from '../../utils/products';
import { 
  loadFeaturedProducts, 
  loadLatestProducts, 
  loadPopularProducts 
} from '../../store/buyersHome';
import { loadProductsByCategory } from '../../store/productCategories';
import { createSmartBuyerClient } from '../../utils/authAxiosClient';
import { ProductCardShimmer } from '../../components/ProductCardShimmer';

const smartBuyerClient = createSmartBuyerClient();

export const AllProductsScreen = ({ route, navigation }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const baseUrls = useSelector(selectBaseUrls);
  
  // Get parameters from route
  const { productType, categoryId, title } = route.params;
  
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalSize, setTotalSize] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const limit = 5; // Number of products per page
  const searchTimeoutRef = useRef(null);

  // Parse products to match ProductCard expectations
  const parseProducts = useCallback((productList) => {
    if (!Array.isArray(productList)) return [];
    return productList.map(productItem => ({
      id: productItem.id,
      name: productItem.name,
      image: `${baseUrls['product_thumbnail_url']}/${productItem.thumbnail}`,
      price: productItem.discount > 0
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
      rating: productItem.average_review || 0,
      slug: productItem.slug,
    }));
  }, [baseUrls]);

  // Fetch products based on type
  const fetchProducts = useCallback(async (isRefresh = false) => {
    try {
      const currentOffset = isRefresh ? 0 : offset;
      setLoadingMore(!isRefresh);
      console.log('fetching products', productType, categoryId, offset, currentOffset, limit);
      
      let response;
      
      if (categoryId) {
        // Fetch products by category
        response = await smartBuyerClient.get(
          `products/category/${categoryId}?limit=${limit}&offset=${currentOffset}`
        );
      } else {
        // Fetch products by type
        switch (productType) {
          case 'featured':
            response = await smartBuyerClient.get(
              `products/featured/?limit=${limit}&offset=${currentOffset}`
            );
            break;
          case 'latest':
            response = await smartBuyerClient.get(
              `products/latest/?limit=${limit}&offset=${currentOffset}`
            );
            break;
          case 'popular':
            response = await smartBuyerClient.get(
              `products/top-rated/?limit=${limit}&offset=${currentOffset}`
            );
            break;
          default:
            throw new Error('Invalid product type');
        }
      }
      
      const newProducts = response.data.products || [];
      const parsedNewProducts = parseProducts(newProducts);
      
      if (isRefresh) {
        setProducts(parsedNewProducts);
        setOriginalProducts(parsedNewProducts);
        setOffset(limit);
      } else {
        setProducts(prev => [...prev, ...parsedNewProducts]);
        setOriginalProducts(prev => [...prev, ...parsedNewProducts]);
        setOffset(prev => prev + limit);
      }
      
      setTotalSize(response.data.total_size || 0);
      setHasMore(parsedNewProducts.length === limit);
      
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [productType, categoryId, offset, limit, parseProducts]);

  // Load products on mount
  useEffect(() => {
    fetchProducts(true);
  }, [productType, categoryId]);

  // Load wishlist
  useEffect(() => {
    dispatch(loadWishlist());
  }, [dispatch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Reload wishlist on focus
  useFocusEffect(
    useCallback(() => {
      dispatch(loadWishlist());
    }, [dispatch])
  );

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setOffset(0);
    fetchProducts(true);
  }, [fetchProducts]);

  // Handle load more
  const onLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !isSearchMode) {
      fetchProducts(false);
    }
  }, [loadingMore, hasMore, isSearchMode, fetchProducts]);

  // Handle product detail navigation
  const onProductDetail = useCallback((productId, slug) => {
    navigation.navigate('ProductDetail', { productId, slug });
  }, [navigation]);

  // Perform search function
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      // Clear search and restore original products
      setIsSearchMode(false);
      setProducts(originalProducts);
      setTotalSize(originalProducts.length);
      setHasMore(originalProducts.length < totalSize);
      setOffset(originalProducts.length);
      return;
    }

    try {
      setSearchLoading(true);
      setIsSearchMode(true);
      
      // First, search in original products list
      const localSearchResults = originalProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase())
      );
      
      // Then search from API
      const apiResponse = await smartBuyerClient.get(
        `products/search?name=${encodeURIComponent(query)}&limit=20&offset=0`
      );
      
      const apiSearchResults = parseProducts(apiResponse.data.products || []);
      
      // Combine and deduplicate results
      const combinedResults = [...localSearchResults];
      const existingIds = new Set(localSearchResults.map(p => p.id));
      
      apiSearchResults.forEach(product => {
        if (!existingIds.has(product.id)) {
          combinedResults.push(product);
          existingIds.add(product.id);
        }
      });
      
      setProducts(combinedResults);
      setTotalSize(combinedResults.length);
      setHasMore(false); // Disable pagination for search results
      setOffset(0);
      
    } catch (error) {
      console.error('Error searching products:', error);
      // Fallback to local search only
      const localSearchResults = originalProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase())
      );
      setProducts(localSearchResults);
      setTotalSize(localSearchResults.length);
      setHasMore(false);
    } finally {
      setSearchLoading(false);
    }
  }, [originalProducts, parseProducts, totalSize]);

  // Handle search input change with debouncing
  const handleSearchInputChange = useCallback((text) => {
    setSearchQuery(text);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(text);
    }, 500); // 500ms delay
  }, [performSearch]);

  // Handle search button press
  const handleSearch = useCallback(() => {
    // Clear any pending debounced search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    // Perform immediate search
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  // Render product item
  const renderProduct = useCallback(({ item }) => (
    <ProductCard 
      {...item} 
      cardWidth={(Dimensions.get('window').width - 48) / 2}
      onProductDetail={onProductDetail}
      isDark={isDark}
    />
  ), [onProductDetail, isDark]);

  // Render footer for loading more
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingHorizontal: 16,
        paddingVertical: 20 
      }}>
        {[...Array(2)].map((_, idx) => (
          <ProductCardShimmer 
            key={idx}
            shimmerColors={isDark ? 
              [theme['color-shadcn-card'], theme['color-shadcn-secondary'], theme['color-shadcn-card']] :
              [theme['color-basic-200'], theme['color-basic-300'], theme['color-basic-200']]
            }
          />
        ))}
      </View>
    );
  }, [loadingMore, theme, isDark]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (loading) return null;
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingVertical: 50 
      }}>
        <ThemedIcon 
          name="info-outline" 
          fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']}
          style={{ width: 64, height: 64, marginBottom: 16 }}
        />
        <Text style={{ 
          color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'],
          fontSize: 16,
          textAlign: 'center'
        }}>
          {t('No products found')}
        </Text>
      </View>
    );
  }, [loading, isDark, theme, t]);

  return (
    <Layout style={{ 
      flex: 1, 
      backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] 
    }}>
      {/* Header */}
      <View style={{ 
        padding: 16, 
        borderBottomWidth: 1, 
        borderBottomColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] 
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: 'bold',
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'],
          }}>
            {isSearchMode ? t('Search Results') : (title || t('Products'))}
          </Text>
          {isSearchMode && (
            <Text style={{ 
              fontSize: 14,
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'],
            }}>
              {products.length} {t('results')}
            </Text>
          )}
        </View>
        
        {/* Search Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Input
            placeholder={t('Search products...')}
            value={searchQuery}
            onChangeText={handleSearchInputChange}
            style={{ 
              flex: 1, 
              marginRight: 8,
              backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
            }}
            textStyle={{ 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] 
            }}
          />
          {searchQuery.trim() ? (
            <Button
              size="small"
              onPress={() => {
                setSearchQuery('');
                // Clear any pending debounced search
                if (searchTimeoutRef.current) {
                  clearTimeout(searchTimeoutRef.current);
                }
                // Restore original products
                setIsSearchMode(false);
                setProducts(originalProducts);
                setTotalSize(originalProducts.length);
                setHasMore(originalProducts.length < totalSize);
                setOffset(originalProducts.length);
              }}
              style={{ 
                backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-300'],
                marginRight: 8
              }}
            >
              {t('Clear')}
            </Button>
          ) : null}
          <Button
            size="small"
            onPress={handleSearch}
            disabled={searchLoading}
            style={{ backgroundColor: theme['color-shadcn-primary'] }}
          >
            {searchLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              t('Search')
            )}
          </Button>
        </View>
      </View>

      {/* Products List */}
      {loading && products.length === 0 ? (
        <View style={{ 
          flex: 1, 
          paddingHorizontal: 16,
          paddingVertical: 16
        }}>
          {/* Shimmer loading for initial load */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            marginBottom: 16
          }}>
            {[...Array(2)].map((_, idx) => (
              <ProductCardShimmer 
                key={idx}
                shimmerColors={isDark ? 
                  [theme['color-shadcn-card'], theme['color-shadcn-secondary'], theme['color-shadcn-card']] :
                  [theme['color-basic-200'], theme['color-basic-300'], theme['color-basic-200']]
                }
              />
            ))}
          </View>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            marginBottom: 16
          }}>
            {[...Array(2)].map((_, idx) => (
              <ProductCardShimmer 
                key={`second-${idx}`}
                shimmerColors={isDark ? 
                  [theme['color-shadcn-card'], theme['color-shadcn-secondary'], theme['color-shadcn-card']] :
                  [theme['color-basic-200'], theme['color-basic-300'], theme['color-basic-200']]
                }
              />
            ))}
          </View>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between'
          }}>
            {[...Array(2)].map((_, idx) => (
              <ProductCardShimmer 
                key={`third-${idx}`}
                shimmerColors={isDark ? 
                  [theme['color-shadcn-card'], theme['color-shadcn-secondary'], theme['color-shadcn-card']] :
                  [theme['color-basic-200'], theme['color-basic-300'], theme['color-basic-200']]
                }
              />
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ 
            justifyContent: 'space-between', 
            paddingHorizontal: 16 
          }}
          contentContainerStyle={{ 
            paddingVertical: 16,
            flexGrow: 1
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme['color-shadcn-primary']]}
            />
          }
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Layout>
  );
}; 