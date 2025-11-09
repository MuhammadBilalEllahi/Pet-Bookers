import React, {useState} from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Text, Button} from '@ui-kitten/components';
import {useTheme} from '../../theme/ThemeContext';
import {useDispatch, useSelector} from 'react-redux';
import {
  addToWishlist,
  removeFromWishlist,
  selectIsInWishlist,
  selectWishlistLoading,
} from '../../store/wishlist';
import {incrementCartCount} from '../../store/cart';
import {
  selectIsBuyerAuthenticated,
  selectIsSellerAuthenticated,
} from '../../store/user';
import {smartBuyerClient, handleAuthError} from '../../utils/authAxiosClient';
import Toast from 'react-native-toast-message';
import {ThemedIcon} from '../Icon';
import FastImage from '@d11/react-native-fast-image';
import {useTranslation} from 'react-i18next';

const {width: windowWidth} = Dimensions.get('screen');

export const ProductListCard = ({
  id,
  name,
  rating,
  discount,
  discountType,
  isSoldOut,
  price,
  oldPrice,
  image,
  onProductDetail,
  slug,
  isDark,
  onAddToCart,
}) => {
  const dispatch = useDispatch();
  const {theme} = useTheme();
  const {t} = useTranslation();

  // Cart state
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Get wishlist status from Redux
  const isInWishlist = useSelector(state => selectIsInWishlist(state, id));
  const wishlistLoading = useSelector(selectWishlistLoading);

  // Get authentication states
  const isBuyerAuthenticated = useSelector(selectIsBuyerAuthenticated);
  const isSellerAuthenticated = useSelector(selectIsSellerAuthenticated);

  const toggleWishlist = e => {
    e.stopPropagation(); // Prevent navigation
    if (!id) return;

    // Check if user is authenticated as buyer
    if (!isBuyerAuthenticated) {
      const message = isSellerAuthenticated
        ? t('product.wishlistAuth')
        : t('product.addToWishlistAuth');

      Alert.alert(t('product.buyerAuthRequired'), message, [
        {text: t('common.ok'), style: 'default'},
      ]);
      return;
    }

    if (isInWishlist) {
      // Remove from wishlist
      dispatch(removeFromWishlist({productId: id}));
    } else {
      // Add to wishlist with product data
      const productData = {
        id,
        name,
        slug,
        unit_price: price,
        discount,
        discount_type: discountType,
        current_stock: isSoldOut ? 0 : 1,
        thumbnail: image,
      };
      dispatch(addToWishlist({productId: id, productData}));
    }
  };

  const handleAddToCart = async e => {
    e.stopPropagation(); // Prevent navigation

    // Check if user is authenticated as buyer
    if (!isBuyerAuthenticated) {
      const message = isSellerAuthenticated
        ? t('product.cartAuth')
        : t('product.addToCartAuth');

      Alert.alert(t('product.buyerAuthRequired'), message, [
        {text: t('common.ok'), style: 'default'},
      ]);
      return;
    }

    try {
      setAddingToCart(true);

      const response = await smartBuyerClient.post('cart/add', {
        id: id,
        quantity: 1,
      });

      setAddingToCart(false);
      setAddedToCart(true);

      // Update Redux cart count
      dispatch(incrementCartCount());

      Toast.show({
        type: 'success',
        text1: t('cart.addedToCart'),
        text2: t('cart.addedSuccess'),
      });

      // Reset added state after 2 seconds
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);

      setAddingToCart(false);

      // Handle auth errors with proper modal display
      handleAuthError(error, err => {
        const errorMessage =
          err?.response?.data?.message || err?.message || t('cart.addFailed');
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: errorMessage,
        });
      });
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={[
        styles.card,
        {
          backgroundColor: isDark
            ? theme['color-shadcn-card']
            : theme['color-basic-100'],
          borderColor: isDark
            ? theme['color-shadcn-border']
            : theme['color-basic-300'],
        },
      ]}
      onPress={() => onProductDetail && onProductDetail(id, slug)}>
      {/* Image Container - Left Side */}
      <View style={styles.imageContainer}>
        <FastImage
          onLoadStart={() => console.log('🟡 FastImage loading started')}
          // onLoad={() => console.log('✅ FastImage loaded successfully')}
          // onError={(error) => console.log('❌ FastImage load error:', error)}
          // onLoadEnd={() => console.log('⚪ FastImage load ended')}
          source={{
            uri: image,
            priority: FastImage.priority.high,
          }}
          style={[
            styles.image,
            {
              backgroundColor: isDark
                ? theme['color-shadcn-secondary']
                : theme['color-basic-200'],
            },
          ]}
          resizeMode={FastImage.resizeMode.cover}
        />
        {isSoldOut && (
          <View style={styles.soldOutContainer}>
            <Text style={styles.soldOutText}>Out Of Stock</Text>
          </View>
        )}
        {discount > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>
              -{discount}
              {discountType === 'percent' && '%'}
            </Text>
          </View>
        )}
      </View>

      {/* Content Container - Right Side */}
      <View style={styles.contentContainer}>
        {/* Top Row: Title and Wishlist */}
        <View style={styles.topRow}>
          <Text
            category="s1"
            numberOfLines={2}
            style={[
              styles.title,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            {name}
          </Text>
          <TouchableOpacity
            onPress={toggleWishlist}
            style={styles.heartButton}
            disabled={wishlistLoading}>
            <ThemedIcon
              name={isInWishlist ? 'heart' : 'heart-outline'}
              fill={
                isInWishlist
                  ? '#FF512F'
                  : isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600']
              }
              style={[styles.heartIcon, {opacity: wishlistLoading ? 0.6 : 1}]}
            />
          </TouchableOpacity>
        </View>

        {/* Bottom Row: Price and Add to Cart */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text
              category="h6"
              style={[styles.price, {color: theme['color-shadcn-primary']}]}>
              Rs {price}
            </Text>
            {oldPrice > 0 && (
              <Text
                style={[
                  styles.oldPrice,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                Rs {oldPrice}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleAddToCart}
            style={[
              styles.cartButton,
              {
                backgroundColor: theme['color-shadcn-primary'],
                borderColor: theme['color-shadcn-primary'],
                opacity: isSoldOut ? 0.5 : 1,
              },
            ]}
            disabled={addingToCart || isSoldOut}>
            {addingToCart ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : addedToCart ? (
              <ThemedIcon
                name="checkmark-outline"
                fill="#FFFFFF"
                style={styles.cartIcon}
              />
            ) : (
              <>
                <ThemedIcon
                  name="shopping-cart-outline"
                  fill="#FFFFFF"
                  style={styles.cartIcon}
                />
                <ThemedIcon
                  name="plus-outline"
                  fill="#FFFFFF"
                  style={styles.plusIcon}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  soldOutContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10,
  },
  soldOutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#FF512F',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 11,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  heartButton: {
    padding: 4,
    marginTop: 2,
  },
  heartIcon: {
    width: 20,
    height: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  oldPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 60,
  },
  cartIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  plusIcon: {
    width: 14,
    height: 14,
  },
});
