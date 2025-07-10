import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
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
import {
  loadWishlist, 
  removeFromWishlist, 
  selectWishlist, 
  selectWishlistLoading, 
  selectWishlistError
} from '../../../store/wishlist';
import { 
  selectIsBuyerAuthenticated, 
  selectIsSellerAuthenticated 
} from '../../../store/user';
import { smartBuyerClient, handleAuthError, setAuthModalHandlers } from '../../../utils/authAxiosClient';
import { BuyerAuthModal } from '../../../components/modals';
import Toast from 'react-native-toast-message';

const {width: windowWidth, height: windowHeight} = Dimensions.get('screen');

export const MyWishlistScreen = ({navigation}) => {
  const {theme, isDark} = useTheme();
  const uiKittenTheme = useUIKittenTheme();
  const dispatch = useDispatch();

  // Get wishlist state from Redux using new selectors
  const wishlistItems = useSelector(selectWishlist); // This returns the array directly
  const wishlistLoading = useSelector(selectWishlistLoading);
  const wishlistError = useSelector(selectWishlistError);
  
  // Get authentication states
  const isBuyerAuthenticated = useSelector(selectIsBuyerAuthenticated);
  const isSellerAuthenticated = useSelector(selectIsSellerAuthenticated);
  
  const [refreshing, setRefreshing] = useState(false);
  const [removingItems, setRemovingItems] = useState(new Set());
  const [showBuyerAuthModal, setShowBuyerAuthModal] = useState(false);

  // Set up auth modal handlers
  useEffect(() => {
    setAuthModalHandlers({
      showBuyerAuthModal: () => setShowBuyerAuthModal(true),
    });
  }, []);

  const fetchWishlist = useCallback(async (isRefresh = false) => {
    // Check if user is authenticated as buyer
    if (!isBuyerAuthenticated) {
      if (isRefresh) {
        setRefreshing(false);
      }
      return;
    }

    try {
      await dispatch(loadWishlist());
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      handleAuthError(error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  }, [dispatch, isBuyerAuthenticated]);

  const removeFromWishlistLocal = async (wishlistItem) => {
    // Check if user is authenticated as buyer
    if (!isBuyerAuthenticated) {
      const message = isSellerAuthenticated 
        ? 'You are signed in as a seller. Please also sign in as a buyer to manage your wishlist.'
        : 'Please sign in as a buyer to manage your wishlist.';
      
      Alert.alert(
        'Buyer Authentication Required',
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign in as Buyer', onPress: () => setShowBuyerAuthModal(true) }
        ]
      );
      return;
    }

    const productId = wishlistItem.product_id || wishlistItem.id;
    
    try {
      setRemovingItems(prev => new Set([...prev, wishlistItem.id]));

      dispatch(removeFromWishlist({productId}));
      
      Toast.show({
        type: 'success',
        text1: 'Removed',
        text2: 'Item removed from wishlist'
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      handleAuthError(error);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(wishlistItem.id);
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

  // Check authentication and fetch wishlist when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isBuyerAuthenticated) {
        fetchWishlist();
      } else {
        // Show different message based on auth state
        if (isSellerAuthenticated) {
          Alert.alert(
            'Buyer Authentication Required',
            'You are currently signed in as a seller. To view your wishlist, please also sign in as a buyer.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign in as Buyer', onPress: () => setShowBuyerAuthModal(true) }
            ]
          );
        } else {
          setShowBuyerAuthModal(true);
        }
      }
    }, [fetchWishlist, isBuyerAuthenticated, isSellerAuthenticated])
  );

  const handleAuthSuccess = () => {
    setShowBuyerAuthModal(false);
    // Fetch wishlist after successful authentication
    fetchWishlist();
  };

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

  const renderAuthState = () => (
    <>
      <View style={[styles.authContainer, { backgroundColor: isDark ? theme['color-basic-800'] : theme['color-basic-100'] }]}>
        <Text style={[styles.authMessage, { color: isDark ? theme['color-basic-100'] : theme['color-basic-900'] }]}>
          {isSellerAuthenticated 
            ? 'Please sign in as a buyer to view your wishlist'
            : 'Please sign in to view your wishlist'
          }
        </Text>
        <Button
          onPress={() => setShowBuyerAuthModal(true)}
          style={styles.authButton}
        >
          Sign in as Buyer
        </Button>
      </View>
      
      <BuyerAuthModal
        visible={showBuyerAuthModal}
        onClose={() => setShowBuyerAuthModal(false)}
        onSuccess={handleAuthSuccess}
        title="Sign in as Buyer"
      />
    </>
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
      <ActivityIndicator size="large" color={theme['color-primary-500']} />
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

  // Return auth state if not authenticated
  if (!isBuyerAuthenticated) {
    return renderAuthState();
  }

  const renderHeader = () => (
    <Layout
      level="2"
      style={[
        styles.headerContainer,
        {
          backgroundColor: isDark
            ? theme['color-basic-800']
            : theme['color-basic-100'],
        },
      ]}>
      {wishlistItems.length > 0 && (
        <View style={styles.headerContent}>
          <Text
            category="h6"
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
        </View>
      )}
    </Layout>
  );

  // Loading state
  if (wishlistLoading && (!wishlistItems || wishlistItems.length === 0)) {
    return (
      <Layout
        level="3"
        style={[
          flexeStyles.flex1,
          {
            backgroundColor: isDark
              ? theme['color-basic-800']
              : theme['color-basic-100'],
          },
        ]}>
        {renderLoadingState()}
      </Layout>
    );
  }

  // Error state
  if (wishlistError && (!wishlistItems || wishlistItems.length === 0)) {
    return (
      <Layout
        level="3"
        style={[
          flexeStyles.flex1,
          {
            backgroundColor: isDark
              ? theme['color-basic-800']
              : theme['color-basic-100'],
          },
        ]}>
        {renderErrorState()}
      </Layout>
    );
  }

  return (
    <Layout
      level="3"
      style={[
        flexeStyles.flex1,
        {
          backgroundColor: isDark
            ? theme['color-basic-800']
            : theme['color-basic-100'],
        },
      ]}>
      <FlatList
        data={wishlistItems || []} // Ensure it's always an array
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderWishlistItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={wishlistItems.length > 0 ? renderHeader : null}
        ListEmptyComponent={
          !wishlistLoading ? renderEmptyState : null
        }
        contentContainerStyle={[
          styles.listContainer,
          wishlistItems.length === 0 && styles.emptyListContainer,
        ]}
        // Add some padding for better UX
        contentInsetAdjustmentBehavior="automatic"
      />
      
      {/* Buyer Authentication Modal */}
      <BuyerAuthModal
        visible={showBuyerAuthModal}
        onClose={() => setShowBuyerAuthModal(false)}
        onSuccess={handleAuthSuccess}
        title="Sign in as Buyer"
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 8,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(151, 151, 151, 0.2)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '600',
  },
  headerSubtitle: {
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  browseButton: {
    borderRadius: 25,
    paddingHorizontal: 32,
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
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  errorTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    borderRadius: 25,
    paddingHorizontal: 24,
  },
});
