import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Layout,
  Text,
  Button,
  Select,
  SelectItem,
  IndexPath,
  Icon,
} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {AppScreens} from '../../../navigators/AppNavigator';
import {useNavigation} from '@react-navigation/native';
import {axiosBuyerClient} from '../../../utils/axiosClient';
import {useTheme} from '../../../theme/ThemeContext';
import {useSelector} from 'react-redux';
import {BASE_URLS, selectBaseUrls} from '../../../store/configs';
import {createShimmerPlaceholder} from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {
  selectIsBuyerAuthenticated,
  selectIsSellerAuthenticated,
} from '../../../store/user';
import {
  loadWishlist,
  addToWishlist,
  removeFromWishlist,
  selectIsInWishlist,
  selectWishlistLoading,
} from '../../../store/wishlist';
import {setCartCount} from '../../../store/cart';
import {useDispatch} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';

const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

// Cart Loading Shimmer Component
const CartShimmer = ({isDark, theme}) => {
  const renderCartItemShimmer = index => (
    <View
      key={index}
      style={[
        styles.cartRow,
        {
          borderBottomColor: isDark
            ? theme['color-shadcn-border']
            : theme['color-basic-400'],
        },
      ]}>
      {/* Sr# */}
      <View style={styles.srCell}>
        <ShimmerPlaceHolder
          style={{width: 20, height: 16, borderRadius: 4}}
          shimmerColors={[
            isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'],
            isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
            isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'],
          ]}
        />
      </View>

      {/* Product Details */}
      <View style={styles.productCell}>
        {/* Product Image */}
        <ShimmerPlaceHolder
          style={[styles.productImage, {borderRadius: 8}]}
          shimmerColors={[
            isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'],
            isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
            isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'],
          ]}
        />

        <View style={{flex: 1, paddingLeft: 12}}>
          {/* Product Name */}
          <ShimmerPlaceHolder
            style={{width: '80%', height: 18, borderRadius: 4, marginBottom: 8}}
            shimmerColors={[
              isDark
                ? theme['color-shadcn-secondary']
                : theme['color-basic-200'],
              isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
              isDark
                ? theme['color-shadcn-secondary']
                : theme['color-basic-200'],
            ]}
          />

          {/* Quantity Row */}
          <View style={styles.quantityRow}>
            <ShimmerPlaceHolder
              style={{width: 28, height: 28, borderRadius: 14}}
              shimmerColors={[
                isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-200'],
                isDark
                  ? theme['color-shadcn-accent']
                  : theme['color-basic-300'],
                isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-200'],
              ]}
            />
            <ShimmerPlaceHolder
              style={{
                width: 20,
                height: 16,
                borderRadius: 4,
                marginHorizontal: 12,
              }}
              shimmerColors={[
                isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-200'],
                isDark
                  ? theme['color-shadcn-accent']
                  : theme['color-basic-300'],
                isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-200'],
              ]}
            />
            <ShimmerPlaceHolder
              style={{width: 28, height: 28, borderRadius: 14}}
              shimmerColors={[
                isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-200'],
                isDark
                  ? theme['color-shadcn-accent']
                  : theme['color-basic-300'],
                isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-200'],
              ]}
            />
          </View>

          {/* Price */}
          <ShimmerPlaceHolder
            style={{width: '60%', height: 16, borderRadius: 4}}
            shimmerColors={[
              isDark
                ? theme['color-shadcn-secondary']
                : theme['color-basic-200'],
              isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
              isDark
                ? theme['color-shadcn-secondary']
                : theme['color-basic-200'],
            ]}
          />
        </View>

        {/* Remove Button */}
        <ShimmerPlaceHolder
          style={{width: 24, height: 24, borderRadius: 12}}
          shimmerColors={[
            isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'],
            isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
            isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'],
          ]}
        />
      </View>
    </View>
  );

  const renderFarmShimmer = index => (
    <View
      key={index}
      style={[
        styles.cartBox,
        {
          borderColor: isDark
            ? theme['color-shadcn-border']
            : theme['color-basic-400'],
          backgroundColor: isDark
            ? theme['color-shadcn-card']
            : theme['color-basic-100'],
        },
      ]}>
      {/* Farm Header */}
      <View style={styles.farmHeader}>
        <ShimmerPlaceHolder
          style={{width: '60%', height: 18, borderRadius: 4}}
          shimmerColors={[
            isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'],
            isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
            isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'],
          ]}
        />
        <ShimmerPlaceHolder
          style={{width: 80, height: 14, borderRadius: 4}}
          shimmerColors={[
            isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'],
            isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
            isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'],
          ]}
        />
      </View>

      {/* Table Header */}
      <View
        style={[
          styles.tableHeader,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-secondary']
              : theme['color-basic-200'],
          },
        ]}>
        <ShimmerPlaceHolder
          style={{width: 30, height: 16, borderRadius: 4}}
          shimmerColors={[
            isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
            isDark ? theme['color-shadcn-card'] : theme['color-basic-400'],
            isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
          ]}
        />
        <ShimmerPlaceHolder
          style={{width: 120, height: 16, borderRadius: 4, marginLeft: 12}}
          shimmerColors={[
            isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
            isDark ? theme['color-shadcn-card'] : theme['color-basic-400'],
            isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
          ]}
        />
      </View>

      {/* Cart Items */}
      {[0, 1].map(itemIndex => renderCartItemShimmer(`${index}-${itemIndex}`))}

      {/* Farm Summary */}
      <View
        style={[
          styles.farmSummary,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-secondary']
              : theme['color-basic-200'],
            borderTopColor: isDark
              ? theme['color-shadcn-border']
              : theme['color-basic-400'],
          },
        ]}>
        <View style={styles.summaryRow}>
          <ShimmerPlaceHolder
            style={{width: 100, height: 16, borderRadius: 4}}
            shimmerColors={[
              isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
              isDark ? theme['color-shadcn-card'] : theme['color-basic-400'],
              isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
            ]}
          />
          <ShimmerPlaceHolder
            style={{width: 80, height: 16, borderRadius: 4}}
            shimmerColors={[
              isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
              isDark ? theme['color-shadcn-card'] : theme['color-basic-400'],
              isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
            ]}
          />
        </View>
        <View style={styles.summaryRow}>
          <ShimmerPlaceHolder
            style={{width: 90, height: 16, borderRadius: 4}}
            shimmerColors={[
              isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
              isDark ? theme['color-shadcn-card'] : theme['color-basic-400'],
              isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
            ]}
          />
          <ShimmerPlaceHolder
            style={{width: 70, height: 16, borderRadius: 4}}
            shimmerColors={[
              isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
              isDark ? theme['color-shadcn-card'] : theme['color-basic-400'],
              isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
            ]}
          />
        </View>
      </View>
    </View>
  );

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
      <ScrollView
        style={{
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
        }}
        contentContainerStyle={{
          paddingBottom: 160,
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
        }}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ShimmerPlaceHolder
          style={{width: 200, height: 24, borderRadius: 6, marginBottom: 16}}
          shimmerColors={[
            isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'],
            isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
            isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'],
          ]}
        />

        {/* Farm Boxes */}
        {[0, 1].map(index => renderFarmShimmer(index))}

        {/* Shipping Method Select */}
        <ShimmerPlaceHolder
          style={{height: 56, borderRadius: 8, marginBottom: 16}}
          shimmerColors={[
            isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'],
            isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
            isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'],
          ]}
        />

        {/* Order Note Input */}
        <ShimmerPlaceHolder
          style={{height: 80, borderRadius: 8, marginBottom: 16}}
          shimmerColors={[
            isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'],
            isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
            isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'],
          ]}
        />

        {/* Summary Box */}
        <View
          style={[
            styles.summaryBox,
            {
              borderColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
              backgroundColor: isDark
                ? theme['color-shadcn-card']
                : theme['color-basic-100'],
            },
          ]}>
          <ShimmerPlaceHolder
            style={{width: 150, height: 20, borderRadius: 4, marginBottom: 16}}
            shimmerColors={[
              isDark
                ? theme['color-shadcn-secondary']
                : theme['color-basic-200'],
              isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
              isDark
                ? theme['color-shadcn-secondary']
                : theme['color-basic-200'],
            ]}
          />

          {/* Summary Rows */}
          {[0, 1, 2, 3, 4].map(index => (
            <View key={index} style={styles.summaryRow}>
              <ShimmerPlaceHolder
                style={{width: 80, height: 16, borderRadius: 4}}
                shimmerColors={[
                  isDark
                    ? theme['color-shadcn-secondary']
                    : theme['color-basic-200'],
                  isDark
                    ? theme['color-shadcn-accent']
                    : theme['color-basic-300'],
                  isDark
                    ? theme['color-shadcn-secondary']
                    : theme['color-basic-200'],
                ]}
              />
              <ShimmerPlaceHolder
                style={{width: 100, height: 16, borderRadius: 4}}
                shimmerColors={[
                  isDark
                    ? theme['color-shadcn-secondary']
                    : theme['color-basic-200'],
                  isDark
                    ? theme['color-shadcn-accent']
                    : theme['color-basic-300'],
                  isDark
                    ? theme['color-shadcn-secondary']
                    : theme['color-basic-200'],
                ]}
              />
            </View>
          ))}

          {/* Coupon Row */}
          <View style={styles.couponRow}>
            <ShimmerPlaceHolder
              style={{flex: 1, height: 48, borderRadius: 8, marginRight: 12}}
              shimmerColors={[
                isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-200'],
                isDark
                  ? theme['color-shadcn-accent']
                  : theme['color-basic-300'],
                isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-200'],
              ]}
            />
            <ShimmerPlaceHolder
              style={{width: 100, height: 48, borderRadius: 8}}
              shimmerColors={[
                isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-200'],
                isDark
                  ? theme['color-shadcn-accent']
                  : theme['color-basic-300'],
                isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-200'],
              ]}
            />
          </View>

          {/* Total Row */}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <ShimmerPlaceHolder
              style={{width: 60, height: 18, borderRadius: 4}}
              shimmerColors={[
                isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-200'],
                isDark
                  ? theme['color-shadcn-accent']
                  : theme['color-basic-300'],
                isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-200'],
              ]}
            />
            <ShimmerPlaceHolder
              style={{width: 120, height: 18, borderRadius: 4}}
              shimmerColors={[
                isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-200'],
                isDark
                  ? theme['color-shadcn-accent']
                  : theme['color-basic-300'],
                isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-200'],
              ]}
            />
          </View>
        </View>

        {/* Features Row */}
        <View style={styles.featuresRow}>
          {[0, 1, 2, 3].map(index => (
            <View key={index} style={styles.feature}>
              <ShimmerPlaceHolder
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  marginBottom: 8,
                }}
                shimmerColors={[
                  isDark
                    ? theme['color-shadcn-secondary']
                    : theme['color-basic-200'],
                  isDark
                    ? theme['color-shadcn-accent']
                    : theme['color-basic-300'],
                  isDark
                    ? theme['color-shadcn-secondary']
                    : theme['color-basic-200'],
                ]}
              />
              <ShimmerPlaceHolder
                style={{width: '80%', height: 14, borderRadius: 4}}
                shimmerColors={[
                  isDark
                    ? theme['color-shadcn-secondary']
                    : theme['color-basic-200'],
                  isDark
                    ? theme['color-shadcn-accent']
                    : theme['color-basic-300'],
                  isDark
                    ? theme['color-shadcn-secondary']
                    : theme['color-basic-200'],
                ]}
              />
            </View>
          ))}
        </View>

        {/* Footer Buttons */}
        <View
          style={[
            styles.footerButtonRow,
            {
              backgroundColor: isDark
                ? theme['color-shadcn-card']
                : theme['color-basic-100'],
              borderTopColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
            },
          ]}>
          <ShimmerPlaceHolder
            style={[styles.continueBtn, {borderRadius: 8}]}
            shimmerColors={[
              isDark
                ? theme['color-shadcn-secondary']
                : theme['color-basic-200'],
              isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
              isDark
                ? theme['color-shadcn-secondary']
                : theme['color-basic-200'],
            ]}
          />
          <ShimmerPlaceHolder
            style={[styles.checkoutBtn, {borderRadius: 8}]}
            shimmerColors={[
              isDark
                ? theme['color-shadcn-secondary']
                : theme['color-basic-200'],
              isDark ? theme['color-shadcn-accent'] : theme['color-basic-300'],
              isDark
                ? theme['color-shadcn-secondary']
                : theme['color-basic-200'],
            ]}
          />
        </View>
      </ScrollView>
    </Layout>
  );
};

export const MyCartScreen = () => {
  const {t} = useTranslation();
  const [selectedPayment, setSelectedPayment] = useState(new IndexPath(0));
  const [selectedShipping, setSelectedShipping] = useState(new IndexPath(0));
  const [orderNote, setOrderNote] = useState('');
  const [coupon, setCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const {theme, isDark} = useTheme();
  const baseUrls = useSelector(selectBaseUrls);
  const navigation = useNavigation();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const isBuyerAuthenticated = useSelector(selectIsBuyerAuthenticated);
  const isSellerAuthenticated = useSelector(selectIsSellerAuthenticated);
  const dispatch = useDispatch();
  const wishlist = useSelector(state => state.wishlist.wishlist);
  const wishlistLoading = useSelector(selectWishlistLoading);

  // COD and EasyPaisa
  const getPaymentMethods = async () => {
    try {
      const response = await axiosBuyerClient.get(
        'shipping-method/payment-methods',
      );
      // console.log('Shipping method response:', response.data);
      setPaymentMethods(response.data);
    } catch (error) {
      console.error('Error getting shipping method:', error);
    }
  };

  // Get shipping cost from API
  const getShippingCost = async () => {
    try {
      const response = await axiosBuyerClient.get('cart/shipping-cost');
      // console.log('Shipping cost response:', response.data);
      // Assuming the API returns the shipping cost in response.data.shipping_cost or similar
      const cost = response.data?.shipping_cost || response.data?.cost || 0;
      setShippingCost(cost);
    } catch (error) {
      console.error('Error getting shipping cost:', error);
      setShippingCost(0);
    }
  };

  // Filter payment methods based on cart contents
  const getFilteredPaymentMethods = () => {
    // Check if cart contains any living products (is_living = 1)
    const hasLivingProducts = cartData.some(
      item => item.product?.is_living === 1,
    );

    if (hasLivingProducts) {
      // If cart has living products, only show EasyPaisa
      return paymentMethods.filter(method =>
        method.title.toLowerCase().includes('easypaisa'),
      );
    }

    // If no physical products, show all payment methods
    return paymentMethods;
  };
  useEffect(() => {
    getPaymentMethods();
    // Load wishlist when component mounts
    dispatch(loadWishlist());
  }, [dispatch]);

  // Reload wishlist when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      dispatch(loadWishlist());
    }, [dispatch]),
  );

  // Group cart items by seller/farm
  const groupedCartData = cartData.reduce((groups, item) => {
    const sellerId = item.seller_id;
    if (!groups[sellerId]) {
      groups[sellerId] = {
        seller_id: sellerId,
        shop_info: item.shop_info,
        seller_is: item.seller_is,
        items: [],
      };
    }
    groups[sellerId].items.push(item);
    return groups;
  }, {});

  const cartGroups = Object.values(groupedCartData);

  // Calculate totals from real cart data
  const subtotal = cartData.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = cartData.reduce((sum, item) => sum + item.tax * item.quantity, 0);

  // Use shipping cost from API instead of calculating from cart data
  const cartShippingPrice = shippingCost;

  // Add selected shipping method cost from filtered methods
  const filteredPaymentMethods = getFilteredPaymentMethods();
  const selectedShippingMethod =
    filteredPaymentMethods[selectedShipping.row] || {};
  const shippingMethodCost = selectedShippingMethod.cost || 0;
  const totalShippingPrice = cartShippingPrice + shippingMethodCost;

  const discount = cartData.reduce(
    (sum, item) => sum + item.discount * item.quantity,
    0,
  );
  const totalBeforeCoupon = subtotal + tax + totalShippingPrice - discount;
  const total = totalBeforeCoupon - couponDiscount;

  const fetchCartData = async () => {
    try {
      setLoading(true);
      const response = await axiosBuyerClient.get('cart');
      // console.log('Cart Response:', JSON.stringify(response.data, null, 2));
      const cartItems = response.data || [];
      setCartData(cartItems);
      // Update Redux cart count
      dispatch(setCartCount(cartItems.length));
      // Fetch shipping cost after cart data is loaded
      if (cartItems.length > 0) {
        await getShippingCost();
      } else {
        setShippingCost(0);
      }
    } catch (error) {
      // console.log('Cart Error:', error.toString() || error.response?.data || error.message);
      if (error.response?.status === 401) {
        // console.log('Authentication required');
      }
      setCartData([]);
      setShippingCost(0);
      // Update Redux cart count to 0 on error
      dispatch(setCartCount(0));
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) {
      Alert.alert(t('common.error'), t('cart.couponCode'));
      return;
    }

    try {
      const response = await axiosBuyerClient.get('coupon/apply', {
        params: {
          code: coupon,
        },
      });

      // console.log('Coupon response:', response.data);
      // Coupon response: {"coupon_discount": 508}

      if (response.data && response.data.coupon_discount) {
        setCouponDiscount(response.data.coupon_discount);
        setAppliedCouponCode(coupon);
        Alert.alert(
          t('common.success'),
          t('cart.couponApplied', {
            code: coupon,
            amount: response.data.coupon_discount,
          }),
        );
      } else {
        Alert.alert(t('common.error'), t('cart.invalidCoupon'));
      }
    } catch (error) {
      console.error(
        'Error applying coupon:',
        error?.response?.data?.message || error?.message || error,
      );
      Alert.alert(
        t('common.error'),
        error?.response?.data?.message || t('cart.applyCouponFailed'),
      );
    }
  };

  const removeCoupon = () => {
    setCouponDiscount(0);
    setAppliedCouponCode('');
    setCoupon('');
  };

  const removeFromCart = async cartItemId => {
    try {
      setRemoving(prev => ({...prev, [cartItemId]: true}));

      const response = await axiosBuyerClient.delete('cart/remove', {
        data: {key: cartItemId},
      });

      // console.log('Remove response:', response.data);

      // Remove item from local state
      const updatedCart = cartData.filter(item => item.id !== cartItemId);
      setCartData(updatedCart);
      
      // Update Redux cart count
      dispatch(setCartCount(updatedCart.length));

      // Refresh shipping cost after removing item
      await getShippingCost();
    } catch (error) {
      console.error('Error removing from cart:', error);
      Alert.alert(t('common.error'), t('cart.removeItemFailed'));
    } finally {
      setRemoving(prev => ({...prev, [cartItemId]: false}));
    }
  };

  const updateQuantity = async (cartItemId, newQuantity, item) => {
    const minQuantity = item.product.minimum_order_qty || 1;
    const maxQuantity =
      item.product.current_stock || item.product.total_current_stock;

    // Check minimum quantity
    if (newQuantity < minQuantity) {
      Alert.alert(t('common.error'), t('cart.minQuantityError', {minQuantity}));
      return;
    }

    // Check maximum quantity (current stock)
    if (newQuantity > maxQuantity) {
      Alert.alert(t('common.error'), t('cart.maxQuantityError', {maxQuantity}));
      return;
    }

    try {
      const response = await axiosBuyerClient.put('cart/update', {
        key: cartItemId,
        quantity: newQuantity,
      });

      // console.log('Update response:', response.data);

      // Update local state
      const updatedCart = cartData.map(cartItem =>
          cartItem.id === cartItemId
            ? {...cartItem, quantity: newQuantity}
            : cartItem,
      );
      setCartData(updatedCart);
      
      // Cart count remains the same when updating quantity, but ensure it's synced
      dispatch(setCartCount(updatedCart.length));
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert(t('common.error'), t('cart.updateQuantityFailed'));
    }
  };

  const navigateToProductDetail = product => {
    navigation.navigate('ProductDetail', {
      productId: product.product_id,
      slug: product.slug,
    });
  };

  const handleCheckout = () => {
    if (cartData.length === 0) {
      Alert.alert(t('cart.cartEmpty'), t('cart.addItemsFirst'));
      return;
    }

    const selectedMethod = filteredPaymentMethods[selectedShipping.row];

    if (!selectedMethod) {
      Alert.alert(t('common.error'), t('cart.selectShippingFirst'));
      return;
    }

    // Pass cart data and selected payment method to shipping details
    const checkoutData = {
      cartData,
      selectedPaymentMethod: selectedMethod,
      orderNote,
      couponCode: appliedCouponCode,
      couponDiscount,
      totals: {
        subtotal,
        tax,
        shipping: totalShippingPrice,
        discount,
        total,
      },
    };

    navigation.navigate(AppScreens.SHIPING_DETAILS, {checkoutData});
  };

  const removeFarmFromCart = async (sellerId, farmName) => {
    try {
      setRemoving(prev => ({...prev, [`farm_${sellerId}`]: true}));

      const response = await axiosBuyerClient.delete('cart/remove-farm', {
        data: {seller_id: sellerId},
      });

      // console.log('Remove farm response:', response.data);

      if (response.data.status === 1) {
        // Remove all items from this farm from local state
        const updatedCart = cartData.filter(item => item.seller_id !== sellerId);
        setCartData(updatedCart);
        
        // Update Redux cart count
        dispatch(setCartCount(updatedCart.length));
        Alert.alert(
          t('common.success'),
          t('cart.removeFarmSuccess', {farmName}),
        );
      } else {
        Alert.alert(
          t('common.error'),
          response.data.message || t('cart.removeFarmFailed'),
        );
      }
    } catch (error) {
      console.error('Error removing farm from cart:', error);
      Alert.alert(t('common.error'), t('cart.removeFarmFailed'));
    } finally {
      setRemoving(prev => ({...prev, [`farm_${sellerId}`]: false}));
    }
  };

  const confirmRemove = (cartItemId, productName) => {
    Alert.alert(t('cart.removeItem'), t('cart.removeConfirm', {productName}), [
      {text: t('common.cancel'), style: 'cancel'},
      {
        text: t('common.removed'),
        style: 'destructive',
        onPress: () => removeFromCart(cartItemId),
      },
    ]);
  };

  const confirmRemoveFarm = (sellerId, farmName, itemsCount) => {
    Alert.alert(
      t('cart.removeFarmProducts'),
      t('cart.removeFarmConfirm', {itemsCount, farmName}),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('cart.removeAll'),
          style: 'destructive',
          onPress: () => removeFarmFromCart(sellerId, farmName),
        },
      ],
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Reset coupon when refreshing
    setCouponDiscount(0);
    setAppliedCouponCode('');
    setCoupon('');
    await fetchCartData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  // Reset selected shipping when filtered methods change
  useEffect(() => {
    const filteredMethods = getFilteredPaymentMethods();
    if (
      filteredMethods.length > 0 &&
      selectedShipping.row >= filteredMethods.length
    ) {
      setSelectedShipping(new IndexPath(0));
    }
  }, [cartData, paymentMethods]);

  // If not authenticated as buyer, show auth state UI
  if (!isBuyerAuthenticated) {
    return (
      <Layout
        style={[
          styles.container,
          {
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          },
        ]}>
        <Text
          style={[
            styles.emptyTitle,
            {
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
              textAlign: 'center',
              marginBottom: 24,
            },
          ]}>
          {isSellerAuthenticated
            ? t('cart.sellerToBuyerAuth')
            : t('cart.authRequired')}
        </Text>
        <Button
          onPress={() =>
            navigation.navigate(AppScreens.LOGIN, {isItSeller: false})
          }
          style={[
            styles.browseBtn,
            {backgroundColor: theme['color-shadcn-primary'], minWidth: 200},
          ]}>
          {t('auth.signInAsBuyer')}
        </Button>
      </Layout>
    );
  }

  const renderCartItem = (item, index) => {
    // Get wishlist status for this product
    const isInWishlist = wishlist.some(w => w.product_id === item.product_id);

    // Handle wishlist toggle
    const handleWishlistToggle = e => {
      e.stopPropagation(); // Prevent navigation

      // Check if user is authenticated as buyer
      if (!isBuyerAuthenticated) {
        const message = isSellerAuthenticated
          ? t('wishlist.managementAuthRequired')
          : t('wishlist.addToWishlistAuthRequired');

        Alert.alert(t('product.buyerAuthRequired'), message, [
          {text: t('common.ok'), style: 'default'},
        ]);
        return;
      }

      if (isInWishlist) {
        // Remove from wishlist
        dispatch(removeFromWishlist({productId: item.product_id}));
      } else {
        // Add to wishlist with product data
        const productData = {
          id: item.product_id,
          name: item.name,
          slug: item.slug,
          unit_price: item.price,
          discount: item.discount || 0,
          discount_type: item.discount_type || 'percent',
          current_stock: item.current_stock || 1,
          thumbnail: item.thumbnail,
        };
        dispatch(addToWishlist({productId: item.product_id, productData}));
      }
    };

    return (
      <View
        key={item.id}
        style={[
          styles.cartRow,
          {
            borderBottomColor: isDark
              ? theme['color-shadcn-border']
              : theme['color-basic-400'],
          },
        ]}>
        <Text
          style={[
            styles.srCell,
            {
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            },
          ]}>
          {index + 1}
        </Text>
        <TouchableOpacity
          style={styles.productCell}
          onPress={() => navigateToProductDetail(item)}>
          <Image
            source={{
              uri: `${BASE_URLS.product_thumbnail_url}/${item.thumbnail}`,
            }}
            style={styles.productImage}
          />
          <View style={{flex: 1, paddingLeft: 12}}>
            <Text
              style={[
                styles.productName,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {item.name}
            </Text>
            {/* <Text style={[styles.productDesc, {
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>{item.shop_info}</Text> */}
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={[
                  styles.quantityBtn,
                  {
                    backgroundColor: isDark
                      ? theme['color-shadcn-secondary']
                      : theme['color-basic-200'],
                    opacity:
                      item.quantity <= (item.product.minimum_order_qty || 1)
                        ? 0.5
                        : 1,
                  },
                ]}
                onPress={() => updateQuantity(item.id, item.quantity - 1, item)}
                disabled={
                  item.quantity <= (item.product.minimum_order_qty || 1)
                }>
                <Icon
                  name="minus"
                  fill={
                    isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900']
                  }
                  style={styles.quantityIcon}
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.quantityText,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {item.quantity}
              </Text>
              {item.quantity <
                (item.product.current_stock ||
                  item.product.total_current_stock) && (
                <TouchableOpacity
                  style={[
                    styles.quantityBtn,
                    {
                      backgroundColor: isDark
                        ? theme['color-shadcn-secondary']
                        : theme['color-basic-200'],
                    },
                  ]}
                  onPress={() =>
                    updateQuantity(item.id, item.quantity + 1, item)
                  }>
                  <Icon
                    name="plus"
                    fill={
                      isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900']
                    }
                    style={styles.quantityIcon}
                  />
                </TouchableOpacity>
              )}
            </View>
            <Text
              style={[
                styles.productPrice,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              Rs {(item.price * item.quantity).toLocaleString()}
            </Text>
          </View>

          {/* Wishlist Button */}
          <TouchableOpacity
            onPress={handleWishlistToggle}
            disabled={wishlistLoading}
            style={styles.wishlistBtn}>
            <Icon
              name={isInWishlist ? 'heart' : 'heart-outline'}
              fill={
                isInWishlist
                  ? '#FF512F'
                  : isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600']
              }
              style={[
                styles.wishlistIcon,
                {opacity: wishlistLoading ? 0.6 : 1},
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => confirmRemove(item.id, item.name)}
            disabled={removing[item.id]}
            style={styles.removeBtn}>
            {removing[item.id] ? (
              <Icon
                name="loader-outline"
                fill={theme['color-shadcn-destructive']}
                style={styles.removeIcon}
              />
            ) : (
              <Icon
                name="close-circle-outline"
                fill={theme['color-shadcn-destructive']}
                style={styles.removeIcon}
              />
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFarmCartBox = (group, groupIndex) => {
    // Calculate group subtotal
    const groupSubtotal = group.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const groupCartShipping = group.items.reduce(
      (sum, item) => sum + (item.shipping_cost || 0),
      0,
    );
    const groupShippingMethodCost = shippingMethodCost / cartGroups.length; // Distribute shipping method cost across farms
    const groupTotalShipping = groupCartShipping + groupShippingMethodCost;

    return (
      <View
        key={group.seller_id}
        style={[
          styles.cartBox,
          {
            borderColor: isDark
              ? theme['color-shadcn-border']
              : theme['color-basic-400'],
            backgroundColor: isDark
              ? theme['color-shadcn-card']
              : theme['color-basic-100'],
          },
        ]}>
        <View style={styles.farmHeader}>
          <Text
            style={[
              styles.farmName,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            <Text style={{fontWeight: 'bold'}}>{t('cart.farmLabel')}</Text>{' '}
            {group.shop_info}
          </Text>
          <TouchableOpacity
            style={[
              styles.removeFarmBtn,
              {
                // backgroundColor: isDark ? theme['color-shadcn-destructive'] : theme['color-danger-default']
              },
            ]}
            onPress={() =>
              confirmRemoveFarm(
                group.seller_id,
                group.shop_info,
                group.items.length,
              )
            }
            disabled={removing[`farm_${group.seller_id}`]}>
            {/* {removing[`farm_${group.seller_id}`] ? (
              <Icon name="loader-outline" fill={theme['color-basic-100']} style={styles.removeFarmIcon} />
            )
             : (
              <Icon name="trash-2-outline" fill={theme['color-basic-100']} style={styles.removeFarmIcon} />
            )
            } */}
            <Text
              style={[
                styles.removeFarmText,
                {
                  color: isDark
                    ? theme['color-shadcn-destructive']
                    : theme['color-danger-default'],
                },
              ]}>
              {t('cart.removeAll')}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.tableHeader,
            {
              backgroundColor: isDark
                ? theme['color-shadcn-secondary']
                : theme['color-basic-200'],
            },
          ]}>
          <Text
            style={[
              styles.srHeader,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            {t('cart.srNumber')}
          </Text>
          <Text
            style={[
              styles.productHeader,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            {t('cart.productDetails')}
          </Text>
        </View>

        {group.items.map((item, index) => renderCartItem(item, index))}

        {/* Farm subtotal */}
        <View
          style={[
            styles.farmSummary,
            {
              backgroundColor: isDark
                ? theme['color-shadcn-secondary']
                : theme['color-basic-200'],
              borderTopColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
            },
          ]}>
          <View style={styles.summaryRow}>
            <Text
              style={[
                styles.summaryLabel,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('cart.farmSubtotal')}
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              Rs {groupSubtotal.toLocaleString()}
            </Text>
          </View>
          {groupTotalShipping > 0 && (
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {t('cart.farmShipping')}
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                Rs {groupTotalShipping.toLocaleString()}
              </Text>
            </View>
          )}
          {groupShippingMethodCost > 0 && (
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                    fontSize: 12,
                  },
                ]}>
                └ {selectedShippingMethod.title} (
                {selectedShippingMethod.duration})
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                    fontSize: 12,
                  },
                ]}>
                Rs {groupShippingMethodCost.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return <CartShimmer isDark={isDark} theme={theme} />;
  }

  if (cartData.length === 0) {
    return (
      <Layout
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}>
        <Icon
          name="shopping-cart-outline"
          fill={
            isDark
              ? theme['color-shadcn-muted-foreground']
              : theme['color-basic-600']
          }
          style={{width: 80, height: 80, marginBottom: 16}}
        />
        <Text
          style={[
            styles.emptyTitle,
            {
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            },
          ]}>
          {t('cart.empty')}
        </Text>
        <Text
          style={[
            styles.emptyDesc,
            {
              color: isDark
                ? theme['color-shadcn-muted-foreground']
                : theme['color-basic-600'],
            },
          ]}>
          {t('cart.emptyDesc')}
        </Text>
        <Button
          style={[
            styles.browseBtn,
            {
              backgroundColor: theme['color-shadcn-primary'],
            },
          ]}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{name: AppScreens.BUYER_HOME_MAIN}],
            })
          }>
          {t('cart.browseProducts')}
        </Button>
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
      <ScrollView
        style={{
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
        }}
        contentContainerStyle={{
          paddingBottom: 160,
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme['color-primary-500']]}
            tintColor={theme['color-primary-500']}
            progressBackgroundColor={
              isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
            }
          />
        }>
        <Text
          style={[
            styles.header,
            {
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            },
          ]}>
          {t('cart.title')} ({cartData.length})
        </Text>

        {/* Render cart boxes grouped by farm */}
        {cartGroups.map((group, index) => renderFarmCartBox(group, index))}
        {/* Show payment method restriction notice for physical products */}
        {cartData.some(item => item.is_living === 1 || item.is_living === null) && (
          <View
            style={[
              styles.paymentNotice,
              {
                backgroundColor: isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-200'],
                borderColor: isDark
                  ? theme['color-shadcn-border']
                  : theme['color-basic-400'],
              },
            ]}>
            <Icon
              name="info-outline"
              fill={
                isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900']
              }
              style={styles.paymentNoticeIcon}
            />
            <Text
              style={[
                styles.paymentNoticeText,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('cart.physicalProductsEasypaisaOnly')}
            </Text>
          </View>
        )}

        <Select
          style={[
            styles.select,
            {
              backgroundColor: isDark
                ? theme['color-shadcn-card']
                : theme['color-basic-100'],
              borderColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
            },
          ]}
          value={
            filteredPaymentMethods[selectedShipping.row]?.title ||
            t('cart.chooseShippingMethod')
          }
          selectedIndex={selectedShipping}
          onSelect={index => setSelectedShipping(index)}
          placeholder={t('cart.chooseShippingMethod')}>
          {filteredPaymentMethods.map((method, i) => (
            <SelectItem
              key={i}
              title={`${method.title} - Rs ${method.cost} (${method.duration})`}
            />
          ))}
        </Select>

        <TextInput
          style={[
            styles.noteInput,
            {
              backgroundColor: isDark
                ? theme['color-shadcn-card']
                : theme['color-basic-100'],
              borderColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            },
          ]}
          placeholder={t('cart.orderNote')}
          placeholderTextColor={
            isDark
              ? theme['color-shadcn-muted-foreground']
              : theme['color-basic-600']
          }
          value={orderNote}
          onChangeText={setOrderNote}
          multiline
        />

        <View
          style={[
            styles.summaryBox,
            {
              borderColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
              backgroundColor: isDark
                ? theme['color-shadcn-card']
                : theme['color-basic-100'],
            },
          ]}>
          <Text
            style={[
              styles.summaryTitle,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            {t('cart.orderSummary')}
          </Text>

          <View style={styles.summaryRow}>
            <Text
              style={[
                styles.summaryLabel,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('cart.subTotal')}
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              Rs {subtotal.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text
              style={[
                styles.summaryLabel,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('cart.tax')}
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              Rs {tax.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text
              style={[
                styles.summaryLabel,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('cart.shipping')}
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              Rs {totalShippingPrice.toLocaleString()}
            </Text>
          </View>
          {cartShippingPrice >= 0 && (
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                    fontSize: 12,
                    paddingLeft: 16,
                  },
                ]}>
                └ {t('cart.productShipping')}
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                    fontSize: 12,
                  },
                ]}>
                Rs {shippingCost.toLocaleString()}
              </Text>
            </View>
          )}
          {shippingMethodCost > 0 && (
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                    fontSize: 12,
                    paddingLeft: 16,
                  },
                ]}>
                └ {selectedShippingMethod.title} (
                {selectedShippingMethod.duration})
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                    fontSize: 12,
                  },
                ]}>
                Rs {shippingMethodCost.toLocaleString()}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text
              style={[
                styles.summaryLabel,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('cart.discount')}
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              - Rs {discount.toLocaleString()}
            </Text>
          </View>

          {/* Coupon Discount Section */}
          {couponDiscount > 0 && (
            <View style={styles.summaryRow}>
              <View style={styles.couponDiscountRow}>
                <Text
                  style={[
                    styles.summaryLabel,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {t('cart.coupon')} ({appliedCouponCode})
                </Text>
                <TouchableOpacity
                  onPress={removeCoupon}
                  style={styles.removeCouponBtn}>
                  <Icon
                    name="close-circle-outline"
                    fill={theme['color-shadcn-destructive']}
                    style={styles.removeCouponIcon}
                  />
                </TouchableOpacity>
              </View>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color: theme['color-success-default'],
                  },
                ]}>
                - Rs {couponDiscount.toLocaleString()}
              </Text>
            </View>
          )}
          {/* Hide coupon input when coupon is already applied */}
          {couponDiscount === 0 && (
            <View style={styles.couponRow}>
              <TextInput
                style={[
                  styles.couponInput,
                  {
                    backgroundColor: isDark
                      ? theme['color-shadcn-card']
                      : theme['color-basic-100'],
                    borderColor: isDark
                      ? theme['color-shadcn-border']
                      : theme['color-basic-400'],
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}
                placeholder={t('cart.couponCode')}
                placeholderTextColor={
                  isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600']
                }
                value={coupon}
                onChangeText={setCoupon}
              />
              <Button
                onPress={handleApplyCoupon}
                style={[
                  styles.couponBtn,
                  {
                    backgroundColor: theme['color-shadcn-primary'],
                  },
                ]}>
                {t('cart.applyCoupon')}
              </Button>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text
              style={[
                styles.summaryLabel,
                {
                  fontWeight: 'bold',
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('cart.total')}
            </Text>
            <View style={styles.totalPriceContainer}>
              {couponDiscount > 0 ? (
                <>
                  <Text
                    style={[
                      styles.originalTotal,
                      {
                        color: isDark
                          ? theme['color-shadcn-muted-foreground']
                          : theme['color-basic-600'],
                      },
                    ]}>
                    Rs {totalBeforeCoupon.toLocaleString()}
                  </Text>
                  <Text
                    style={[
                      styles.discountedTotal,
                      {
                        color: theme['color-shadcn-primary'],
                        fontWeight: 'bold',
                      },
                    ]}>
                    Rs {total.toLocaleString()}
                  </Text>
                </>
              ) : (
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      fontWeight: 'bold',
                      color: theme['color-shadcn-primary'],
                    },
                  ]}>
                  Rs {total.toLocaleString()}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.featuresRow}>
          <View style={styles.feature}>
            <Icon
              name="car-outline"
              fill={
                isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900']
              }
              style={styles.featureIcon}
            />
            <Text
              style={[
                styles.featureText,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('cart.features.freeDelivery')}
            </Text>
          </View>
          <View style={styles.feature}>
            <Icon
              name="award-outline"
              fill={
                isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900']
              }
              style={styles.featureIcon}
            />
            <Text
              style={[
                styles.featureText,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('cart.features.originalProducts')}
            </Text>
          </View>
          <View style={styles.feature}>
            <Icon
              name="credit-card-outline"
              fill={
                isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900']
              }
              style={styles.featureIcon}
            />
            <Text
              style={[
                styles.featureText,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('cart.features.moneyBack')}
            </Text>
          </View>
          <View style={styles.feature}>
            <Icon
              name="shield-outline"
              fill={
                isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900']
              }
              style={styles.featureIcon}
            />
            <Text
              style={[
                styles.featureText,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('cart.features.safePayments')}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.footerButtonRow,
            {
              backgroundColor: isDark
                ? theme['color-shadcn-card']
                : theme['color-basic-100'],
              borderTopColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
            },
          ]}>
          <Button
            style={[
              styles.continueBtn,
              {
                backgroundColor: isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-100'],
                borderColor: isDark
                  ? theme['color-shadcn-border']
                  : theme['color-basic-400'],
              },
            ]}
            status="basic"
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [{name: AppScreens.BUYER_HOME_MAIN}],
              })
            }>
            <Text
              style={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
                fontWeight: 'bold',
                fontSize: 11,
              }}>
              « {t('cart.continueShopping')}
            </Text>
          </Button>
          <Button
            onPress={handleCheckout}
            style={[
              styles.checkoutBtn,
              {
                backgroundColor: theme['color-shadcn-primary'],
              },
            ]}>
            {t('cart.checkout')} »
          </Button>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 16,
  },
  farmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 4,
    marginBottom: 4,
  },
  farmName: {
    fontSize: 16,

    flex: 1,
  },
  removeFarmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: 12,
    // paddingVertical: 6,
    // borderRadius: 6,
    // gap: 4
  },
  removeFarmIcon: {
    width: 16,
    height: 16,
  },
  removeFarmText: {
    opacity: 0.7,
    fontSize: 10,
    fontWeight: 'light',
  },
  cartBox: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  srHeader: {
    width: 40,
    fontWeight: 'bold',
    fontSize: 14,
  },
  productHeader: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 14,
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 12,
    // paddingHorizontal: 12
  },
  srCell: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
  },
  productCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 13,
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityIcon: {
    width: 16,
    height: 16,
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  removeBtn: {
    padding: 8,
  },
  removeIcon: {
    width: 24,
    height: 24,
  },
  wishlistBtn: {
    padding: 8,
    marginRight: 4,
  },
  wishlistIcon: {
    width: 24,
    height: 24,
  },
  farmSummary: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  select: {
    marginBottom: 16,
    borderRadius: 8,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    marginBottom: 16,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  summaryBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 8,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  couponBtn: {
    borderRadius: 8,
    borderWidth: 0,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  feature: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  footerButtonRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  continueBtn: {
    flex: 1,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  checkoutBtn: {
    flex: 1,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 0,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  browseBtn: {
    borderRadius: 8,
    borderWidth: 0,
    paddingHorizontal: 32,
  },
  couponDiscountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  removeCouponBtn: {
    marginLeft: 8,
    padding: 4,
  },
  removeCouponIcon: {
    width: 16,
    height: 16,
  },
  totalPriceContainer: {
    alignItems: 'flex-end',
  },
  originalTotal: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  discountedTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  paymentNoticeIcon: {
    width: 20,
    height: 20,
  },
  paymentNoticeText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});
