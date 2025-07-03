import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  Layout,
  Text,
  Button,
  Spinner,
  useTheme as useUIKittenTheme,
} from '@ui-kitten/components';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import {WishlistItemCard} from '../../../components/buyer';
import {ThemedIcon} from '../../../components/Icon';
import {useTheme} from '../../../theme/ThemeContext';
import {flexeStyles} from '../../../utils/globalStyles';
import {AppScreens} from '../../../navigators/AppNavigator';
import {loadWishlist, removeFromWishlist, selectWishlist} from '../../../store/wishlist';

const {width: windowWidth, height: windowHeight} = Dimensions.get('screen');

export const MyWishlistScreen = ({navigation}) => {
  const {theme, isDark} = useTheme();
  const uiKittenTheme = useUIKittenTheme();
  const dispatch = useDispatch();

  // Get wishlist state from Redux
  const {wishlistItems, wishlistLoading, wishlistError, isInitialized} = useSelector(selectWishlist);
  
  const [refreshing, setRefreshing] = useState(false);
  const [removingItems, setRemovingItems] = useState(new Set());

  const fetchWishlist = useCallback(async (isRefresh = false) => {
    try {
      await dispatch(loadWishlist()).unwrap();
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  }, [dispatch]);

  const removeFromWishlistLocal = async (wishlistItem) => {
    const wishlistItemId = wishlistItem.id;
    const productId = wishlistItem.product_id;
    
    try {
      setRemovingItems(prev => new Set([...prev, wishlistItemId]));

      dispatch(removeFromWishlist({productId, wishlistItemId}));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(wishlistItemId);
        return newSet;
      });
    }
  };

  const handleProductDetail = (productId, slug) => {
    // Navigate to product details screen
    navigation?.navigate(AppScreens.PRODUCT_DETAIL_BUYER, {productId, slug});
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWishlist(true);
  };

  const retryFetch = () => {
    fetchWishlist();
  };

  // Fetch wishlist when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchWishlist();
    }, [fetchWishlist])
  );

  // Also fetch on mount if not initialized
  useEffect(() => {
    if (!isInitialized) {
      fetchWishlist();
    }
  }, [fetchWishlist, isInitialized]);

  const renderWishlistItem = ({item}) => (
    <WishlistItemCard
      item={item}
      onRemove={removeFromWishlistLocal}
      onProductDetail={handleProductDetail}
      isRemoving={removingItems.has(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <ThemedIcon
        name="heart-outline"
        style={[
          styles.emptyIcon,
          {
            fill: isDark
              ? theme['color-shadcn-muted-foreground']
              : theme['color-basic-400'],
          },
        ]}
      />
      <Text
        category="h5"
        style={[
          styles.emptyTitle,
          {
            color: isDark
              ? theme['color-shadcn-foreground']
              : theme['color-basic-900'],
          },
        ]}>
        Your Wishlist is Empty
      </Text>
      <Text
        category="s1"
        style={[
          styles.emptySubtitle,
          {
            color: isDark
              ? theme['color-shadcn-muted-foreground']
              : theme['color-basic-600'],
          },
        ]}>
        Save items you love for later. Start browsing and add products to your
        wishlist!
      </Text>
      <Button
        style={styles.browseButton}
        onPress={() => navigation?.navigate(AppScreens.BUYER_HOME_MAIN)}>
        Browse Products
      </Button>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <ThemedIcon
        name="alert-circle-outline"
        style={[
          styles.errorIcon,
          {fill: uiKittenTheme['color-danger-default']},
        ]}
      />
      <Text
        category="h6"
        style={[
          styles.errorTitle,
          {color: uiKittenTheme['color-danger-default']},
        ]}>
        Something went wrong
      </Text>
      <Text
        category="s1"
        style={[
          styles.errorMessage,
          {
            color: isDark
              ? theme['color-shadcn-muted-foreground']
              : theme['color-basic-600'],
          },
        ]}>
        {wishlistError}
      </Text>
      <Button appearance="outline" onPress={retryFetch} style={styles.retryButton}>
        Try Again
      </Button>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <Spinner size="large" />
      <Text
        category="s1"
        style={[
          styles.loadingText,
          {
            color: isDark
              ? theme['color-shadcn-muted-foreground']
              : theme['color-basic-600'],
          },
        ]}>
        Loading your wishlist...
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text
        category="h4"
        style={[
          styles.headerTitle,
          {
            color: isDark
              ? theme['color-shadcn-foreground']
              : theme['color-basic-900'],
          },
        ]}>
        My Wishlist
      </Text>
      {wishlistItems.length > 0 && (
        <Text
          category="s2"
          style={[
            styles.headerSubtitle,
            {
              color: isDark
                ? theme['color-shadcn-muted-foreground']
                : theme['color-basic-600'],
            },
          ]}>
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
        </Text>
      )}
    </View>
  );

  if (wishlistLoading && !isInitialized) {
    return (
      <Layout
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          },
        ]}>
        {renderLoadingState()}
      </Layout>
    );
  }

  if (wishlistError && wishlistItems.length === 0 && isInitialized) {
    return (
      <Layout
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          },
        ]}>
        {renderErrorState()}
      </Layout>
    );
  }

  return (
    <Layout
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
        },
      ]}>
      <FlatList
        data={wishlistItems}
        renderItem={renderWishlistItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[uiKittenTheme['color-primary-default']]}
            tintColor={uiKittenTheme['color-primary-default']}
          />
        }
        ListHeaderComponent={wishlistItems.length > 0 ? renderHeader : null}
        ListEmptyComponent={!wishlistLoading ? renderEmptyState : null}
        contentContainerStyle={[
          styles.listContainer,
          wishlistItems.length === 0 && styles.emptyListContainer,
        ]}
        ItemSeparatorComponent={() => <View style={{height: 4}} />}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 20,
  },
  emptyListContainer: {
    justifyContent: 'center',
    minHeight: windowHeight * 0.7,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  emptyTitle: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  browseButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    width: 64,
    height: 64,
    marginBottom: 20,
  },
  errorTitle: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorMessage: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
});
