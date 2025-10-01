import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import {
  Layout,
  Text,
  Input,
  Icon,
  Card,
  Spinner,
  Divider,
} from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { selectBaseUrls } from '../../store/configs';
import { selectProductCategories } from '../../store/productCategories';
import { axiosBuyerClient } from '../../utils/axiosClient';
import { calculateDiscountedPrice } from '../../utils/products';
import { MainScreensHeader } from '../../components/buyer';
import { ProductListCard } from '../../components/product';
import { AppScreens } from '../../navigators/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');

const RECENT_SEARCHES_KEY = '@recent_searches';
const MAX_RECENT_SEARCHES = 10;

export const ProductsSearchScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const dispatch = useDispatch();
  const baseUrls = useSelector(selectBaseUrls);
  const { categories, categoriesLoading } = useSelector(selectProductCategories);
  
  const [searchQuery, setSearchQuery] = useState(route?.params?.initialQuery || '');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Animated placeholder text
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const placeholderAnim = useRef(new Animated.Value(0)).current;
  const placeholderTexts = [
    t('search.searchProducts', 'Search for products'),
    t('search.searchPets', 'Search for pets'),
    t('search.searchDoctors', 'Search for doctors'),
    t('search.searchServices', 'Search for services'),
    t('search.searchItems', 'Search for items')
  ];

  // Load recent searches from AsyncStorage
  const loadRecentSearches = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, []);

  // Save search to recent searches
  const saveRecentSearch = useCallback(async (query) => {
    if (!query.trim()) return;
    
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      let searches = stored ? JSON.parse(stored) : [];
      
      // Remove existing occurrence
      searches = searches.filter(item => item.toLowerCase() !== query.toLowerCase());
      
      // Add to beginning
      searches.unshift(query.trim());
      
      // Limit to MAX_RECENT_SEARCHES
      searches = searches.slice(0, MAX_RECENT_SEARCHES);
      
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
      setRecentSearches(searches);
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  }, []);

  // Clear all recent searches
  const clearRecentSearches = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  }, []);

  // Parse products function
  const parseProducts = useCallback((productList) => {
    if (!Array.isArray(productList)) {
      console.log("ProductList is not array:", typeof productList);
      return [];
    }
    
    return productList.map((productItem, index) => {
      try {
        const safePrice = Number(productItem?.unit_price) || 0;
        const safeDiscount = Number(productItem?.discount) || 0;
        
        let discountedPrice = safePrice;
        if (safeDiscount > 0 && typeof calculateDiscountedPrice === 'function') {
          try {
            discountedPrice = calculateDiscountedPrice(safePrice, safeDiscount, productItem?.discount_type);
          } catch (discountError) {
            console.warn('Discount calculation error:', discountError);
            discountedPrice = safePrice;
          }
        }

  return {
          id: productItem?.id ? String(productItem.id) : `temp_${index}_${Date.now()}`,
          name: productItem?.name ? String(productItem.name).trim() : 'Unnamed Product',
          image: `${baseUrls['product_thumbnail_url'] || ''}/${productItem?.thumbnail || 'default.png'}`,
          price: Number(discountedPrice) || 0,
          oldPrice: safeDiscount > 0 ? safePrice : 0,
          isSoldOut: Number(productItem?.current_stock || 0) === 0,
          discountType: String(productItem?.discount_type || 'flat'),
          discount: safeDiscount,
          rating: Number(productItem?.average_review || 0),
          slug: productItem?.slug ? String(productItem.slug) : '',
          current_stock: Number(productItem?.current_stock || 0),
          unit: productItem?.unit ? String(productItem.unit) : 'pc',
          seller: (productItem?.user || productItem?.seller) ? {} : {},
          shop: (productItem?.user?.shop || productItem?.seller?.shop) ? {
            name: String((productItem?.user?.shop?.name || productItem?.seller?.shop?.name) || 'Unknown Shop')
          } : null
        };
      } catch (parseError) {
        console.error(`Error parsing product ${index}:`, parseError, productItem);
        return null;
      }
    }).filter(Boolean);
  }, [baseUrls]);

  // Perform search function
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setLoading(true);
      setShowResults(true);
      
      const response = await axiosBuyerClient.get(
        `products/search?name=${encodeURIComponent(query)}&limit=20&offset=0`
      );
      
      const rawProducts = response.data.products || [];
      const results = parseProducts(rawProducts);
      
      setSearchResults(results);
      
      // Save to recent searches
      await saveRecentSearch(query);
      
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [parseProducts, saveRecentSearch]);

  // Handle search input change with debouncing
  const handleSearchInputChange = useCallback((text) => {
    setSearchQuery(text);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (text.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(text);
      }, 500);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [performSearch]);

  // Handle search submit
  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  }, [searchQuery, performSearch]);

  // Handle recent search tap
  const handleRecentSearchTap = useCallback((query) => {
    setSearchQuery(query);
    performSearch(query);
  }, [performSearch]);

  // Handle category tap
  const handleCategoryTap = useCallback((category) => {
    navigation.navigate(AppScreens.ALL_PRODUCTS, { 
      categoryId: category.id,
      categoryName: category.name 
    });
  }, [navigation]);

  // Handle product tap
  const handleProductTap = useCallback((product) => {
    navigation.navigate(AppScreens.PRODUCT_DETAIL_BUYER, { 
      productId: product.id, 
      slug: product.slug 
    });
  }, [navigation]);


  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  // Animated placeholder effect
  useEffect(() => {
    if (searchQuery.trim()) return; // Don't animate if user is typing
    
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % placeholderTexts.length;
        
        // Animate out current text
        Animated.timing(placeholderAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          // Animate in next text
          Animated.timing(placeholderAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        });
        
        return nextIndex;
      });
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, [searchQuery, placeholderAnim, placeholderTexts.length]);

  // Focus input on mount
  useEffect(() => {
    loadRecentSearches();
    
    // Start slide-in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Focus input after animation completes
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 350);
    
    // If there's an initial query, perform search
    if (route?.params?.initialQuery) {
      performSearch(route.params.initialQuery);
    }

    return () => {
      clearTimeout(timer);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [loadRecentSearches, performSearch, route?.params?.initialQuery, slideAnim, fadeAnim]);

  // Handle back navigation with slide-out animation
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Prevent default behavior
      e.preventDefault();

      // Start slide-out animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenWidth,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Navigate back after animation completes
        navigation.dispatch(e.data.action);
      });
    });

    return unsubscribe;
  }, [navigation, slideAnim, fadeAnim]);

  // Render animated placeholder
  const renderAnimatedPlaceholder = () => {
    if (searchQuery.trim()) return null;
    
    return (
      <View style={styles.placeholderContainer}>
        <Animated.Text
          style={[
            styles.animatedPlaceholder,
            {
              opacity: placeholderAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
              transform: [{
                translateY: placeholderAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                }),
              }],
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }
          ]}
        >
          {placeholderTexts[currentPlaceholderIndex]}
        </Animated.Text>
      </View>
    );
  };

  // Render search icon
  const renderSearchIcon = (props) => {
    if (loading) {
      return <Spinner size="small" />;
    }
    if (searchQuery.trim()) {
      return (
        <TouchableOpacity onPress={clearSearch}>
          <Icon {...props} name="close-outline" />
        </TouchableOpacity>
      );
    }
    return <Icon {...props} name="search-outline" />;
  };

  // Render recent search item
  const renderRecentSearchItem = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.recentSearchItem, {
        backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
        borderBottomColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-300'],
        borderBottomWidth: index < recentSearches.length - 1 ? 1 : 0
      }]}
      onPress={() => handleRecentSearchTap(item)}
    >
      <Icon
        name="clock-outline"
        width={20}
        height={20}
        fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']}
        style={styles.recentSearchIcon}
      />
      <Text
        style={[styles.recentSearchText, {
          color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
        }]}
        numberOfLines={1}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  // Render category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryItem, {
        backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
        borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-300'],
      }]}
      onPress={() => handleCategoryTap(item)}
    >
      <Text
        style={[styles.categoryText, {
          color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
        }]}
        numberOfLines={1}
      >
        {item.name}
      </Text>
      <Icon
        name="arrow-forward-outline"
        width={16}
        height={16}
        fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']}
      />
    </TouchableOpacity>
  );

  // Render product item
  const renderProductItem = ({ item, index }) => {
    return (
      <ProductListCard
        id={item.id}
        name={item.name}
        rating={item.rating}
        discount={item.discount}
        discountType={item.discountType}
        isSoldOut={item.isSoldOut}
        price={item.price}
        oldPrice={item.oldPrice}
        image={item.image}
        onProductDetail={(id, slug) => handleProductTap(item)}
        slug={item.slug}
        isDark={isDark}
      />
    );
  };

  return (
    <Layout style={[styles.container, {
      backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']
    }]}>
      <Animated.View 
        style={[
          styles.animatedContainer,
          {
            transform: [{ translateX: slideAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <MainScreensHeader
          navigation={navigation}
          title={t('search.title', 'Search')}
          hideSearch={true}
          activateGoBack={true}
        />
        
        {/* Search Input */}
        <View style={[styles.searchContainer, {
          backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'],
          borderBottomColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-300']
        }]}>
          <View style={styles.inputWrapper}>
            <Input
              ref={inputRef}
              value={searchQuery}
              onChangeText={handleSearchInputChange}
              placeholder=""
              accessoryRight={renderSearchIcon}
              onSubmitEditing={handleSearchSubmit}
              style={[styles.searchInput, {
                backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
                borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-300']
              }]}
              textStyle={{
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }}
              placeholderTextColor="transparent"
              returnKeyType="search"
              blurOnSubmit={false}
            />
            {renderAnimatedPlaceholder()}
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showResults ? (
          // Search Results
          <View style={styles.resultsContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Spinner size="large" />
                <Text style={[styles.loadingText, {
                  
                  color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                }]}>
                  {t('search.searching', 'Searching...')}
                </Text>
              </View>
            ) : searchResults.length > 0 ? (
              <>
                <Text style={[styles.sectionTitle, {
                  paddingTop:8 ,
                  paddingHorizontal:16,
                  color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                }]}>
                  {t('search.searchResults', 'Search Results')} ({searchResults.length})
                </Text>
                <View style={styles.productsList}>
                  {searchResults.map((item, index) => 
                    renderProductItem({ item, index })
                  )}
                </View>
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Icon
                  name="search-outline"
                  width={64}
                  height={64}
                  fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-400']}
                />
                <Text style={[styles.emptyTitle, {
                  color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                }]}>
                  {t('search.noResults', 'No products found')}
                </Text>
                <Text style={[styles.emptySubtitle, {
                  color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                }]}>
                  Try searching with different keywords
                </Text>
              </View>
            )}
          </View>
        ) : (
          // Default Content (Recent + Categories)
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, {
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                  }]}>
                    {t('search.recentSearches', 'Recent Searches')}
                  </Text>
                  <TouchableOpacity onPress={clearRecentSearches}>
                    <Text style={[styles.clearButton, {
                      color: theme['color-primary-500']
                    }]}>
                      {t('search.clear', 'Clear')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.recentSearchList, {
                  backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
                  borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-300']
                }]}>
                  {recentSearches.map((item, index) => 
                    renderRecentSearchItem({ item, index })
                  )}
                </View>
              </View>
            )}

            {/* Popular Categories */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {
                paddingHorizontal: 16,
                paddingVertical: 6,
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>
                {t('search.popularCategories', 'Popular Categories')}
              </Text>
              {categoriesLoading ? (
                <View style={styles.categoriesLoading}>
                  <Spinner size="small" />
                </View>
              ) : (
                <View style={styles.categoriesList}>
                  {categories.map((item) => 
                    renderCategoryItem({ item })
                  )}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
      </Animated.View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  inputWrapper: {
    position: 'relative',
  },
  searchInput: {
    borderRadius: 12,
    borderWidth: 1,
  },
  placeholderContainer: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  animatedPlaceholder: {
    fontSize: 15,
    fontWeight: '400',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  recentSearchList: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  recentSearchIcon: {
    marginRight: 12,
  },
  recentSearchText: {
    fontSize: 16,
    flex: 1,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 16,
    flex: 1,
  },
  categoriesLoading: {
    alignItems: 'center',
    padding: 20,
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  productsList: {
    paddingVertical: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});