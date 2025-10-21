import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Modal,
  Text,
  Alert,
} from 'react-native';
import {Input, Icon, Card, Spinner} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../../theme/ThemeContext';
import {useSelector, useDispatch} from 'react-redux';
import {selectBaseUrls} from '../../store/configs';
import {axiosBuyerClient} from '../../utils/axiosClient';
import {calculateDiscountedPrice} from '../../utils/products';
import {Price} from '../Price';
import {AirbnbRating} from 'react-native-ratings';
import {ThemedIcon} from '../Icon';
import {AppScreens} from '../../navigators/AppNavigator';

const {width: screenWidth} = Dimensions.get('window');

export const SearchDropdown = ({
  navigation,
  style,
  placeholder,
  onProductSelect,
}) => {
  const {t, i18n} = useTranslation();
  const {theme, isDark} = useTheme();
  const baseUrls = useSelector(selectBaseUrls);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Parse products function
  const parseProducts = useCallback(
    productList => {
      if (!Array.isArray(productList)) {
        // console.log('ProductList is not array:', typeof productList);
        return [];
      }

      return productList
        .map((productItem, index) => {
          try {
            // Ensure safe parsing of all fields with extensive logging
            const safePrice = Number(productItem?.unit_price) || 0;
            const safeDiscount = Number(productItem?.discount) || 0;

            let discountedPrice = safePrice;
            if (
              safeDiscount > 0 &&
              typeof calculateDiscountedPrice === 'function'
            ) {
              try {
                discountedPrice = calculateDiscountedPrice(
                  safePrice,
                  safeDiscount,
                  productItem?.discount_type,
                );
              } catch (discountError) {
                console.warn('Discount calculation error:', discountError);
                discountedPrice = safePrice;
              }
            }

            const parsedProduct = {
              id: productItem?.id
                ? String(productItem.id)
                : `temp_${index}_${Date.now()}`,
              name: productItem?.name
                ? String(productItem.name).trim()
                : 'Unnamed Product',
              image: `${baseUrls['product_thumbnail_url'] || ''}/${
                productItem?.thumbnail || 'default.png'
              }`,
              price: Number(discountedPrice) || 0,
              oldPrice: safeDiscount > 0 ? safePrice : 0,
              isSoldOut: Number(productItem?.current_stock || 0) === 0,
              discountType: String(productItem?.discount_type || 'flat'),
              discount: safeDiscount,
              rating: Number(productItem?.average_review || 0),
              slug: productItem?.slug ? String(productItem.slug) : '',
              current_stock: Number(productItem?.current_stock || 0),
              unit: productItem?.unit ? String(productItem.unit) : 'pc',
              seller: productItem?.user || productItem?.seller ? {} : {},
              shop:
                productItem?.user?.shop || productItem?.seller?.shop
                  ? {
                      name: String(
                        productItem?.user?.shop?.name ||
                          productItem?.seller?.shop?.name ||
                          'Unknown Shop',
                      ),
                    }
                  : null,
            };

            // console.log(`Parsed product ${index}:`, parsedProduct);
            return parsedProduct;
          } catch (parseError) {
            console.error(
              `Error parsing product ${index}:`,
              parseError,
              productItem,
            );
            return null;
          }
        })
        .filter(Boolean); // Remove any null results
    },
    [baseUrls],
  );

  // Perform search function
  const performSearch = useCallback(
    async query => {
      if (!query.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      try {
        setLoading(true);

        // Search from API
        const response = await axiosBuyerClient.get(
          `products/search?name=${encodeURIComponent(query)}&limit=10&offset=0`,
        );
        // console.log('DATA', response.data.products);

        const rawProducts = response.data.products || [];
        // console.log('Raw products length:', rawProducts.length);

        const results = parseProducts(rawProducts);
        // console.log('Parsed results:', results);

        // Ensure all results are safe before setting
        const safeResults = results.filter(
          item => item && item.id && item.name,
        );
        setSearchResults(safeResults);
        setShowDropdown(true); // Always show dropdown when there are results or loading
      } catch (error) {
        console.error('Error searching products:', error);
        setSearchResults([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    },
    [parseProducts],
  );

  // Handle search input change with debouncing
  const handleSearchInputChange = useCallback(
    text => {
      setSearchQuery(text);

      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(text);
      }, 300); // 300ms delay
    },
    [performSearch],
  );

  // Handle product selection
  const handleProductSelect = product => {
    // console.log('Product selected:', product);

    // Immediately hide dropdown and clear search
    setShowDropdown(false);
    setSearchQuery('');
    setSearchResults([]);

    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (onProductSelect) {
      onProductSelect(product);
    } else if (navigation) {
      navigation.navigate(AppScreens.PRODUCT_DETAIL_BUYER, {
        productId: product.id,
        slug: product.slug,
      });
    }
  };

  // Handle focus - navigate to search screen
  const handleFocus = () => {
    if (navigation) {
      navigation.navigate(AppScreens.PRODUCTS_SEARCH, {
        initialQuery: searchQuery,
      });
    }
  };

  // Handle blur - don't hide dropdown immediately to allow item selection
  const handleBlur = () => {
    // Use longer delay to allow for item selection
    setTimeout(() => {
      setShowDropdown(false);
    }, 500);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  // Render search icon or clear icon
  const renderIcon = props => {
    if (loading) {
      return <Spinner size="small" />;
    }
    if (searchQuery.trim()) {
      return (
        <TouchableOpacity onPress={clearSearch}>
          <ThemedIcon {...props} name="close-outline" />
        </TouchableOpacity>
      );
    }
    return <ThemedIcon {...props} name="search-outline" />;
  };

  // Render product item in dropdown - simplified for debugging
  const renderProductItem = ({item, index}) => {
    // console.log('Rendering item:', item);

    if (!item || !item.id || !item.name) {
      console.warn('Invalid item:', item);
      return null;
    }

    return (
      <TouchableOpacity
        style={[
          styles.productItem,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-card']
              : theme['color-basic-100'],
            borderBottomColor: isDark
              ? theme['color-shadcn-border']
              : theme['color-basic-300'],
            borderBottomWidth: index < searchResults.length - 1 ? 1 : 0,
          },
        ]}
        onPress={() => {
          // console.log('Item touched:', item.name);
          handleProductSelect(item);
        }}
        activeOpacity={0.8}
        delayPressIn={0}
        delayPressOut={0}>
        {/* Product Details - Simplified */}
        <View style={styles.productDetails}>
          <Text
            style={[
              styles.productName,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}
            numberOfLines={2}>
            {String(item.name)}
          </Text>

          {/* Price - Simplified */}
          <View style={styles.priceContainer}>
            <Text style={{fontSize: 13, color: isDark ? '#ffffff' : '#000000'}}>
              PKR {String(Number(item.price) || 0)}
            </Text>
          </View>

          {/* Stock - Simplified */}
          {Number(item.current_stock) > 0 && (
            <Text
              style={[
                styles.stockText,
                {
                  color: isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600'],
                },
              ]}>
              {String(Number(item.current_stock))} in stock
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View
      style={[
        styles.emptyState,
        {
          backgroundColor: isDark
            ? theme['color-shadcn-card']
            : theme['color-basic-100'],
        },
      ]}>
      <ThemedIcon
        name="search-outline"
        style={styles.emptyIcon}
        fill={
          isDark
            ? theme['color-shadcn-muted-foreground']
            : theme['color-basic-400']
        }
      />
      <Text
        style={[
          styles.emptyText,
          {
            color: isDark
              ? theme['color-shadcn-muted-foreground']
              : theme['color-basic-600'],
          },
        ]}>
        {t('allProducts.noProductsFound') || 'No products found'}
      </Text>
    </View>
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, style]}>
      {/* Search Input */}
      <Input
        ref={inputRef}
        value={searchQuery}
        onChangeText={handleSearchInputChange}
        placeholder={placeholder || t('search.searchProducts')}
        accessoryRight={renderIcon}
        onFocus={handleFocus}
        editable={false}
        style={[
          styles.searchInput,
          {
            direction: i18n.dir(),
            backgroundColor: isDark
              ? theme['color-shadcn-card']
              : theme['color-basic-100'],
            borderColor: showDropdown
              ? theme['color-primary-500']
              : isDark
              ? theme['color-shadcn-border']
              : theme['color-basic-300'],
          },
        ]}
        textStyle={[
          styles.searchInputText,
          {
            color: isDark
              ? theme['color-shadcn-foreground']
              : theme['color-basic-900'],
          },
        ]}
        placeholderTextColor={
          isDark
            ? theme['color-shadcn-muted-foreground']
            : theme['color-basic-600']
        }
        size="medium"
        blurOnSubmit={false}
        returnKeyType="search"
      />

      {/* Dropdown Results */}
      {(showDropdown || loading) && searchQuery.trim() !== '' && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: isDark
                ? theme['color-shadcn-card']
                : theme['color-basic-100'],
              borderColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-300'],
              shadowColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
            },
          ]}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Spinner size="small" />
              <Text
                style={[
                  styles.loadingText,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                {t('common.loading') || 'Loading...'}
              </Text>
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderProductItem}
              keyExtractor={(item, index) =>
                item.id ? item.id.toString() : index.toString()
              }
              showsVerticalScrollIndicator={true}
              style={styles.resultsList}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              bounces={true}
              keyboardShouldPersistTaps="always"
              removeClippedSubviews={false}
            />
          ) : (
            renderEmptyState()
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    zIndex: 1000,
  },
  searchInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 4,
    minHeight: 32,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInputText: {
    fontSize: 15,
    paddingVertical: 1,
  },
  dropdown: {
    position: 'absolute',
    top: 38, // Just below the search input
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 300,
    elevation: 8,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 2000,
    overflow: 'hidden', // Ensure proper clipping
  },
  resultsList: {
    maxHeight: 280,
    minHeight: 50, // Ensure minimum height for scrolling
  },
  productItem: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  productImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  soldOutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldOutText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  productDetails: {
    flex: 1,
    paddingRight: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 4,
  },
  priceContainer: {
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    marginLeft: 4,
  },
  stockText: {
    fontSize: 11,
  },
  shopText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },
  arrowIcon: {
    width: 16,
    height: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
