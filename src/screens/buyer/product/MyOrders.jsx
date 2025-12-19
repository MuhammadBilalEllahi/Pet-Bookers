import {
  Layout,
  Text,
  Card,
  Divider,
  Spinner,
  Button,
  Icon,
  Input,
  Tab,
  TabView,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';
import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ScrollView,
  Platform,
  Alert,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {AppScreens} from '../../../navigators/AppNavigator';
import {useTheme} from '../../../theme/ThemeContext';
import {createSmartBuyerClient} from '../../../utils/authAxiosClient';
import {spacingStyles} from '../../../utils/globalStyles';
import Toast from 'react-native-toast-message';

import {selectBaseUrls} from '../../../store/configs';
import {useSelector} from 'react-redux';
import OrdersTab from './tabs/OrdersTab';
import RefundsTab from './tabs/RefundsTab';
import ReviewModal from './tabs/ReviewModal';
import SellerReviewModal from './tabs/SellerReviewModal';

const smartBuyerClient = createSmartBuyerClient();

// Reusable component for status badges
const StatusBadge = ({status, t}) => {
  return (
    <View
      style={[styles.statusBadge, {backgroundColor: getStatusColor(status)}]}>
      <Text style={styles.statusBadgeText}>{status}</Text>
    </View>
  );
};

// Reusable component for address display
const AddressInfo = ({address, isDark, theme, t}) => {
  if (!address) return null;

  return (
    <View
      style={[
        styles.addressContainer,
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
        category="s2"
        style={[
          styles.addressLabel,
          {
            color: isDark
              ? theme['color-shadcn-muted-foreground']
              : theme['color-basic-600'],
          },
        ]}>
        {t('myOrders.billingAddress')}:
      </Text>
      <Text
        style={[
          styles.addressText,
          {
            color: isDark
              ? theme['color-shadcn-foreground']
              : theme['color-basic-800'],
          },
        ]}>
        {address.contact_person_name}
      </Text>
      <Text
        style={[
          styles.addressText,
          {
            color: isDark
              ? theme['color-shadcn-foreground']
              : theme['color-basic-800'],
          },
        ]}>
        {address.address}
      </Text>
      <Text
        style={[
          styles.addressText,
          {
            color: isDark
              ? theme['color-shadcn-foreground']
              : theme['color-basic-800'],
          },
        ]}>
        {`${address.city}, ${address.state} ${address.zip}`}
      </Text>
      <Text
        style={[
          styles.addressText,
          {
            color: isDark
              ? theme['color-shadcn-foreground']
              : theme['color-basic-800'],
          },
        ]}>
        {address.country}
      </Text>
      <Text
        style={[
          styles.addressText,
          {
            color: isDark
              ? theme['color-shadcn-foreground']
              : theme['color-basic-800'],
          },
        ]}>
        {`Phone: ${address.phone}`}
      </Text>
    </View>
  );
};

// Collapsible Address Component
const CollapsibleAddress = ({address, isDark, theme, t}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.addressContainer}>
      <TouchableOpacity
        style={[
          styles.addressHeader,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-secondary']
              : theme['color-basic-200'],
          },
        ]}
        onPress={() => setIsExpanded(!isExpanded)}>
        <View style={styles.addressHeaderContent}>
          <Icon
            name="pin"
            width={16}
            height={16}
            fill={
              isDark
                ? theme['color-shadcn-muted-foreground']
                : theme['color-basic-600']
            }
          />
          <Text
            category="s1"
            style={[
              styles.addressTitle,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            Billing Address
          </Text>
        </View>
        <Icon
          name={isExpanded ? 'arrow-up' : 'arrow-down'}
          width={16}
          height={16}
          fill={
            isDark
              ? theme['color-shadcn-muted-foreground']
              : theme['color-basic-600']
          }
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.addressContent}>
          <Text
            style={[
              styles.addressText,
              {
                color: isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600'],
              },
            ]}>
            {address.contact_person_name}
          </Text>
          <Text
            style={[
              styles.addressText,
              {
                color: isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600'],
              },
            ]}>
            {address.phone}
          </Text>
          <Text
            style={[
              styles.addressText,
              {
                color: isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600'],
              },
            ]}>
            {address.address}
          </Text>
          <Text
            style={[
              styles.addressText,
              {
                color: isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600'],
              },
            ]}>
            {address.city}, {address.state} {address.zip}
          </Text>
          <Text
            style={[
              styles.addressText,
              {
                color: isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600'],
              },
            ]}>
            {address.country}
          </Text>
        </View>
      )}
    </View>
  );
};

// Product Details Component
const ProductDetails = ({product, isDark, theme, t}) => {
  // console.log("product in productdetails", JSON.stringify(product, null, 2));
  return (
    <View
      style={[
        styles.productDetailsContainer,
        {
          backgroundColor: isDark
            ? theme['color-shadcn-secondary']
            : theme['color-basic-200'],
        },
      ]}>
      <View style={styles.productInfo}>
        <Text
          category="s1"
          style={[
            styles.productName,
            {
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            },
          ]}>
          {product.product_details?.name || t('refund.productName')}
        </Text>
        <Text
          category="c1"
          style={[
            styles.productMeta,
            {
              color: isDark
                ? theme['color-shadcn-muted-foreground']
                : theme['color-basic-600'],
            },
          ]}>
          Qty: {product.qty} • PKR {product.price}
        </Text>
        {product.discount > 0 && (
          <Text
            category="c1"
            style={[styles.discountText, {color: theme['color-success-500']}]}>
            Discount: PKR {product.discount}
          </Text>
        )}
      </View>
    </View>
  );
};

// --- API Utility Functions ---

// --- End API Utility Functions ---

export const MyOrders = ({navigation}) => {
  const {t} = useTranslation();
  const {theme, isDark} = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [refunds, setRefunds] = useState([]);
  const [refundsLoading, setRefundsLoading] = useState(false);

  const navigateToOrderDetails = order => {
    navigation.navigate(AppScreens.OrderDetails, {order});
  };

  const navigateToSellerInfo = sellerId => {
    navigation.navigate(AppScreens.VANDOR_DETAIL, {sellerId});
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await smartBuyerClient.get('customer/order/list');
      // console.log("response in customerlist", JSON.stringify(response.data, null, 2));
      setOrders((response.data || []).slice().reverse());
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const fetchRefunds = async () => {
    setRefundsLoading(true);
    // console.log("fetchRefunds");
    try {
      const response = await smartBuyerClient.get('customer/order/all-refunds');
      // console.log("response", JSON.stringify(response.data, null, 2));
      setRefunds(response.data);
    } catch (e) {
      // console.log("error", e.response.data || e.message);
      setRefunds([]);
    }
    setRefundsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    fetchRefunds();
  }, []);

  const formatDate = useCallback(dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  // Group orders by order_group_id
  const groupedOrders = orders.reduce((acc, order) => {
    if (!acc[order.order_group_id]) {
      acc[order.order_group_id] = [];
    }
    acc[order.order_group_id].push(order);
    return acc;
  }, {});

  // Add state for modals
  const [orderProducts, setOrderProducts] = useState({});
  const [reviewModal, setReviewModal] = useState({visible: false, order: null});
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const baseUrls = useSelector(selectBaseUrls);
  const [reviewedOrders, setReviewedOrders] = useState(new Set());
  const [refundReason, setRefundReason] = useState('');

  // Seller review state
  const [sellerReviewModal, setSellerReviewModal] = useState({
    visible: false,
    sellerId: null,
    sellerName: null,
  });
  const [sellerReviewText, setSellerReviewText] = useState('');
  const [sellerReviewRating, setSellerReviewRating] = useState(5);
  const [reviewedSellers, setReviewedSellers] = useState(new Set());
  const [canReviewSeller, setCanReviewSeller] = useState({});

  // No need to fetch order products separately; use order.details from get_order_list

  const openReviewModal = order => {
    if (order.order_status !== 'delivered') {
      Toast.show({
        type: 'error',
        text1: 'Cannot Review',
        text2: 'Only delivered orders can be reviewed',
      });
      return;
    }

    if (reviewedOrders.has(order.id)) {
      Toast.show({
        type: 'info',
        text1: `Already ${t('product.reviewed', 'Reviewed')}`,
        text2: t('myOrders.alreadyReviewedOrder'),
      });
      return;
    }

    setReviewModal({visible: true, order});
    setReviewRating(5);
    setReviewText('');
  };

  const closeReviewModal = () => {
    setReviewModal({visible: false, order: null});
  };

  // Seller review functions
  const checkCanReviewSeller = async sellerId => {
    try {
      const response = await smartBuyerClient.get(
        `customer/can-review?seller_id=${sellerId}`,
      );
      // console.log('can review', response.data, sellerId);
      const canReview = response.data?.is_eligble || false;
      setCanReviewSeller(prev => ({
        ...prev,
        [sellerId]: canReview,
      }));
      return canReview;
    } catch (error) {
      console.error('Error checking if can review seller:', error);
      setCanReviewSeller(prev => ({
        ...prev,
        [sellerId]: false,
      }));
      return false;
    }
  };

  const openSellerReviewModal = async (sellerId, sellerName) => {
    if (reviewedSellers.has(sellerId)) {
      Toast.show({
        type: 'info',
        text1: t('myOrders.alreadyReviewed'),
        text2: t('myOrders.alreadyReviewedSeller'),
      });
      return;
    }

    const canReview = await checkCanReviewSeller(sellerId);
    if (!canReview) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('myOrders.cannotReviewSeller'),
      });
      return;
    }

    setSellerReviewModal({visible: true, sellerId, sellerName});
    setSellerReviewRating(5);
    setSellerReviewText('');
  };

  const closeSellerReviewModal = () => {
    setSellerReviewModal({visible: false, sellerId: null, sellerName: null});
  };

  const handleSubmitSellerReview = async () => {
    if (!sellerReviewText.trim()) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('myOrders.enterReviewComment'),
      });
      return;
    }

    try {
      const response = await smartBuyerClient.post(
        'customer/seller-reviews/submit',
        {
          seller_id: sellerReviewModal.sellerId,
          rating: sellerReviewRating,
          comment: sellerReviewText,
        },
      );

      if (response) {
        Toast.show({
          type: 'success',
          text1: t('common.success'),
          text2: t('myOrders.sellerReviewSubmitted'),
        });
        // Mark seller as reviewed
        setReviewedSellers(
          prev => new Set([...prev, sellerReviewModal.sellerId]),
        );
        closeSellerReviewModal();
        fetchOrders(); // Refresh orders to update UI
      }
    } catch (error) {
      console.error('Error submitting seller review:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('myOrders.failedSubmitSellerReview'),
      });
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('myOrders.enterReviewComment'),
      });
      return;
    }

    try {
      // console.log("reviewModal.order.id", reviewModal.order.id);
      // console.log("reviewRating", reviewRating);
      // console.log("reviewText", reviewText);
      const response = await smartBuyerClient.post(
        'customer/order/deliveryman-reviews/submit',
        {
          order_id: reviewModal.order.id,
          rating: reviewRating,
          comment: reviewText,
        },
      );

      if (response) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Review submitted successfully',
        });
        // Mark order as reviewed
        setReviewedOrders(prev => new Set([...prev, reviewModal.order.id]));
        closeReviewModal();
        fetchOrders(); // Refresh orders to update UI
      }
    } catch (error) {
      // console.log("error", error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('myOrders.failedSubmitReview'),
      });
    }
  };

  const handleRefundRequest = order => {
    if (order.order_status !== 'delivered') {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('refund.cannotRefund'),
      });
      return;
    }
    navigation.navigate(AppScreens.REFUND_SCREEN, {order});
  };

  // Filtered data for search
  const filteredOrders = Object.values(groupedOrders)
    .flat()
    .filter(order => {
      if (!searchQuery) return true;
      return (
        order.id.toString().includes(searchQuery) ||
        (order.billing_address_data?.address &&
          order.billing_address_data.address
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (order.details?.[0]?.product_details?.name &&
          order.details[0].product_details.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
      );
    });

  const filteredRefunds = refunds.filter(refund => {
    if (!searchQuery) return true;
    return (
      refund.product_details?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      refund.id?.toString().includes(searchQuery)
    );
  });

  // Fix StatusBadge style (reduce padding, set minWidth)
  const fixedStatusBadgeStyle = {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    alignSelf: 'flex-start',
  };

  // Modern order card UI
  const renderOrderGroup = ({item: groupId, onSellerReview}) => {
    const groupOrders = groupedOrders[groupId];
    const totalAmount = groupOrders.reduce(
      (sum, order) => sum + parseFloat(order.order_amount),
      0,
    );

    // If only one order in group, render as before
    if (groupOrders.length === 1) {
      const order = groupOrders[0];
      const products = order.details || [];
      const firstProduct = products[0];
      return (
        <Card
          key={order.id}
          style={[
            styles.orderCard,
            {
              backgroundColor: isDark
                ? theme['color-shadcn-card']
                : theme['color-basic-100'],
              ...Platform.select({
                ios: {
                  shadowColor: isDark ? '#000' : '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 4,
                },
                android: {elevation: 4},
              }),
            },
          ]}>
          <View style={styles.orderCardRow}>
            {firstProduct?.product_details?.thumbnail ? (
              <Image
                source={{
                  uri: `${baseUrls['product_thumbnail_url']}/${firstProduct.product_details.thumbnail}`,
                }}
                style={styles.productImage}
              />
            ) : (
              <View
                style={[
                  styles.productImage,
                  {
                    backgroundColor: '#eee',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              />
            )}
            <View style={{flex: 1, marginLeft: 8}}>
              <Text
                category="h6"
                style={[
                  styles.productName,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                    marginBottom: 2,
                  },
                ]}>
                {firstProduct?.product_details?.name || 'Product Name'}
              </Text>
              <View style={styles.orderHeader}>
                <View style={styles.orderTitleContainer}>
                  <Text
                    category="c1"
                    style={[
                      styles.orderTitle,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    {t('Order')} #{order.id}
                  </Text>
                  <Text
                    category="c1"
                    style={[
                      styles.orderDate,
                      {
                        color: isDark
                          ? theme['color-shadcn-muted-foreground']
                          : theme['color-basic-600'],
                      },
                    ]}>
                    {formatDate(order.created_at)}
                  </Text>
                </View>
                <View style={fixedStatusBadgeStyle}>
                  <StatusBadge status={order.order_status} t={t} />
                </View>
              </View>
              <View style={styles.orderDetailsRow}>
                <Text
                  style={[
                    styles.orderMeta,
                    {
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600'],
                    },
                  ]}>
                  {t('shippingDetails.payment')}: {order.payment_method}
                </Text>
                <Text
                  style={[
                    styles.orderMeta,
                    {
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600'],
                    },
                  ]}>
                  {t('common.status')}: {order.payment_status}
                </Text>
                <Text
                  style={[
                    styles.orderMeta,
                    {
                      color: isDark
                        ? theme['color-primary-500']
                        : theme['color-primary-600'],
                    },
                  ]}>
                  PKR {order.order_amount}
                </Text>
              </View>
            </View>
          </View>
          {firstProduct && (
            <ProductDetails
              product={firstProduct}
              isDark={isDark}
              theme={theme}
              t={t}
            />
          )}
          <CollapsibleAddress
            address={order.billing_address_data}
            isDark={isDark}
            theme={theme}
            t={t}
          />
          <View style={styles.actionRow}>
            <Button
              size="tiny"
              status="basic"
              style={[
                styles.sellerInfoButton,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-secondary']
                    : theme['color-basic-200'],
                  borderColor: isDark
                    ? theme['color-shadcn-border']
                    : theme['color-basic-400'],
                },
              ]}
              onPress={() => navigateToSellerInfo(order.seller_id)}>
              <Text
                style={{
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                }}>
                View Seller Info
              </Text>
            </Button>
            {/* {order.order_status === 'delivered' && (
              <Button size="tiny" status="danger" style={styles.actionBtn} onPress={() => handleRefundRequest(order)}>Refund</Button>
            )} */}
            {/* {order.order_status === 'delivered' && !reviewedOrders.has(order.id) && (
              <Button 
                size="tiny" 
                status="info" 
                style={[styles.actionBtn, {
                  backgroundColor: theme['color-info-500'],
                  borderColor: theme['color-info-600']
                }]} 
                onPress={() => openReviewModal(order)}
              >
                <Text style={{ color: '#ffffff' }}>
                  Review Delivery
                </Text>
              </Button>
            )}
            {reviewedOrders.has(order.id) && (
              <View style={[styles.reviewedBadge, {
                backgroundColor: isDark ? 'rgba(46, 204, 113, 0.2)' : '#E8F5E8'
              }]}>
                <Icon name="checkmark-circle-2" width={16} height={16} fill={theme['color-success-500']} />
                <Text category="c1" style={[styles.reviewedText, { color: theme['color-success-500'] }]}>{t('product.reviewed', 'Reviewed')}</Text>
              </View>
            )}
            {order.order_status === 'delivered' && !reviewedSellers.has(order.seller_id) && (
              <Button 
                size="tiny" 
                status="warning" 
                style={[styles.actionBtn, {
                  backgroundColor: theme['color-warning-500'],
                  borderColor: theme['color-warning-600']
                }]} 
                onPress={() => openSellerReviewModal(order.seller_id, order.seller_is || `Seller ${order.seller_id}`)}
              >
                <Text style={{ color: '#ffffff' }}>
                  Review Seller
                </Text>
              </Button>
            )}
            {reviewedSellers.has(order.seller_id) && (
              <View style={[styles.reviewedBadge, {
                backgroundColor: isDark ? 'rgba(255, 193, 7, 0.2)' : '#FFF3CD'
              }]}>
                <Icon name="star" width={16} height={16} fill={theme['color-warning-500']} />
                <Text category="c1" style={[styles.reviewedText, { color: theme['color-warning-500'] }]}>Seller Reviewed</Text>
              </View>
            )} */}
            {order.digital_product_id && (
              <Button
                size="tiny"
                status="primary"
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: theme['color-primary-500'],
                    borderColor: theme['color-primary-600'],
                  },
                ]}
                onPress={async () => {
                  await smartBuyerClient.get(
                    `customer/order/digital-product-download/${order.digital_product_id}`,
                  );
                  Toast.show({
                    type: 'success',
                    text1: t('common.download'),
                    text2: t('myOrders.digitalDownloadStarted'),
                  });
                }}>
                <Text style={{color: '#ffffff'}}>{t('common.download')}</Text>
              </Button>
            )}
          </View>
          <View
            style={[
              styles.groupTotal,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.03)',
              },
            ]}>
            <Text
              category="s1"
              style={[
                styles.groupTotalText,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('order.groupTotal', 'Group Total:')} PKR{' '}
              {totalAmount.toFixed(2)}
            </Text>
          </View>
        </Card>
      );
    }

    // Multiple orders in group: show all under one card
    return (
      <Card
        key={groupId}
        style={[
          styles.orderCard,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-card']
              : theme['color-basic-100'],
            ...Platform.select({
              ios: {
                shadowColor: isDark ? '#000' : '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 4,
              },
              android: {elevation: 4},
            }),
          },
        ]}>
        <Text
          category="h6"
          style={[
            styles.groupHeader,
            {
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            },
          ]}>
          {t('order.orderGroup', 'Order Group:')} {groupId}
        </Text>
        {groupOrders.map((order, index) => {
          const products = order.details || [];
          const firstProduct = products[0];
          return (
            <View
              key={order.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}>
              {firstProduct?.product_details?.thumbnail ? (
                <Image
                  source={{
                    uri: `${baseUrls['product_thumbnail_url']}/${firstProduct.product_details.thumbnail}`,
                  }}
                  style={styles.productImage}
                />
              ) : (
                <View
                  style={[
                    styles.productImage,
                    {
                      backgroundColor: '#eee',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  ]}
                />
              )}
              <View style={{flex: 1, marginLeft: 8}}>
                <Text
                  category="h6"
                  style={[
                    styles.productName,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                      marginBottom: 2,
                    },
                  ]}>
                  {firstProduct?.product_details?.name || 'Product Name'}
                </Text>
                <Text
                  category="c1"
                  style={[
                    styles.orderTitle,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {t('order.orderNumber', 'Order #')}
                  {order.id}
                </Text>
                <Text
                  category="c1"
                  style={[
                    styles.orderDate,
                    {
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600'],
                    },
                  ]}>
                  {formatDate(order.created_at)}
                </Text>
                <View style={fixedStatusBadgeStyle}>
                  <StatusBadge status={order.order_status} t={t} />
                </View>
                <View style={styles.orderDetailsRow}>
                  <Text
                    style={[
                      styles.orderMeta,
                      {
                        color: isDark
                          ? theme['color-shadcn-muted-foreground']
                          : theme['color-basic-600'],
                      },
                    ]}>
                    {t('shippingDetails.payment')}: {order.payment_method}
                  </Text>
                  <Text
                    style={[
                      styles.orderMeta,
                      {
                        color: isDark
                          ? theme['color-shadcn-muted-foreground']
                          : theme['color-basic-600'],
                      },
                    ]}>
                    {t('common.status')}: {order.payment_status}
                  </Text>
                  <Text
                    style={[
                      styles.orderMeta,
                      {
                        color: isDark
                          ? theme['color-primary-500']
                          : theme['color-primary-600'],
                      },
                    ]}>
                    PKR {order.order_amount}
                  </Text>
                </View>
                {/* Action Buttons for each order */}
                <View style={styles.actionRow}>
                  <Button
                    size="tiny"
                    status="basic"
                    style={[
                      styles.sellerInfoButton,
                      {
                        backgroundColor: isDark
                          ? theme['color-shadcn-secondary']
                          : theme['color-basic-200'],
                        borderColor: isDark
                          ? theme['color-shadcn-border']
                          : theme['color-basic-400'],
                      },
                    ]}
                    onPress={() => navigateToSellerInfo(order.seller_id)}>
                    <Text
                      style={{
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      }}>
                      View Seller Info
                    </Text>
                  </Button>
                  {/* {order.order_status === 'delivered' && (
                    <Button size="tiny" status="danger" style={styles.actionBtn} onPress={() => handleRefundRequest(order)}>Refund</Button>
                  )} */}
                  {order.order_status === 'delivered' &&
                    !reviewedOrders.has(order.id) && (
                      <Button
                        size="tiny"
                        status="info"
                        style={styles.actionBtn}
                        onPress={() => openReviewModal(order)}>
                        Review Delivery
                      </Button>
                    )}
                  {reviewedOrders.has(order.id) && (
                    <View style={styles.reviewedBadge}>
                      <Icon
                        name="checkmark-circle-2"
                        width={16}
                        height={16}
                        fill={theme['color-success-500']}
                      />
                      <Text
                        category="c1"
                        style={[
                          styles.reviewedText,
                          {color: theme['color-success-500']},
                        ]}>
                        {t('product.reviewed', 'Reviewed')}
                      </Text>
                    </View>
                  )}
                  {/* Seller Review Button */}
                  {order.order_status === 'delivered' &&
                    !reviewedSellers.has(order.seller_id) && (
                      <Button
                        size="tiny"
                        status="warning"
                        style={[
                          styles.actionBtn,
                          {
                            backgroundColor: theme['color-warning-500'],
                            borderColor: theme['color-warning-600'],
                          },
                        ]}
                        onPress={() =>
                          openSellerReviewModal(
                            order.seller_id,
                            order.seller_is || `Seller ${order.seller_id}`,
                          )
                        }>
                        <Text style={{color: '#ffffff'}}>Review Seller</Text>
                      </Button>
                    )}
                  {reviewedSellers.has(order.seller_id) && (
                    <View
                      style={[
                        styles.reviewedBadge,
                        {
                          backgroundColor: isDark
                            ? 'rgba(255, 193, 7, 0.2)'
                            : '#FFF3CD',
                        },
                      ]}>
                      <Icon
                        name="star"
                        width={16}
                        height={16}
                        fill={theme['color-warning-500']}
                      />
                      <Text
                        category="c1"
                        style={[
                          styles.reviewedText,
                          {color: theme['color-warning-500']},
                        ]}>
                        Seller Reviewed
                      </Text>
                    </View>
                  )}
                  {order.digital_product_id && (
                    <Button
                      size="tiny"
                      status="primary"
                      style={styles.actionBtn}
                      onPress={async () => {
                        await smartBuyerClient.get(
                          `customer/order/digital-product-download/${order.digital_product_id}`,
                        );
                        Toast.show({
                          type: 'success',
                          text1: 'Download',
                          text2: 'Digital product download started.',
                        });
                      }}>
                      Download
                    </Button>
                  )}
                </View>
              </View>
            </View>
          );
        })}
        {/* Billing Address for the group (from first order) */}
        <CollapsibleAddress
          address={groupOrders[0].billing_address_data}
          isDark={isDark}
          theme={theme}
          t={t}
        />
        <View style={styles.groupTotal}>
          <Text
            category="s1"
            style={[
              styles.groupTotalText,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            {t('order.groupTotal', 'Group Total:')} PKR {totalAmount.toFixed(2)}
          </Text>
        </View>
      </Card>
    );
  };

  // Header with Search Bar
  const renderHeader = () => (
    <View
      style={{
        padding: 8,
        backgroundColor: isDark
          ? theme['color-shadcn-background']
          : theme['color-basic-100'],
      }}>
      <Input
        placeholder={t('myOrders.searchPlaceholder')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        accessoryLeft={
          <Icon
            name="search"
            width={20}
            height={20}
            fill={theme['color-primary-500']}
          />
        }
        style={[
          {borderRadius: 8},
          {
            backgroundColor: isDark
              ? theme['color-shadcn-input']
              : theme['color-basic-200'],
            borderColor: isDark
              ? theme['color-shadcn-border']
              : theme['color-basic-400'],
          },
        ]}
        textStyle={{
          color: isDark
            ? theme['color-shadcn-foreground']
            : theme['color-basic-900'],
        }}
      />
    </View>
  );

  return (
    <Layout
      style={{
        flex: 1, 
        backgroundColor: isDark
          ? theme['color-shadcn-background']
          : theme['color-basic-100'],
      }}>
      {renderHeader()}
      <TabView
        selectedIndex={selectedTab}
        onSelect={setSelectedTab}
        style={{flex: 1}}>
        <Tab
          title={t('tabs.orders')}
          style={{
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          }}>
          <OrdersTab
            groupedOrders={groupedOrders}
            renderOrderGroup={renderOrderGroup}
            loading={loading}
            onSellerReview={openSellerReviewModal}
          />
        </Tab>
        <Tab
          title={t('order.refunds')}
          style={{
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          }}>
          <RefundsTab
            refundsLoading={refundsLoading}
            filteredRefunds={filteredRefunds}
            baseUrls={baseUrls}
          />
        </Tab>
      </TabView>
      <ReviewModal
        reviewModal={reviewModal}
        closeReviewModal={closeReviewModal}
        reviewRating={reviewRating}
        setReviewRating={setReviewRating}
        reviewText={reviewText}
        setReviewText={setReviewText}
        handleSubmitReview={handleSubmitReview}
        theme={theme}
        isDark={isDark}
      />
      <SellerReviewModal
        sellerReviewModal={sellerReviewModal}
        closeSellerReviewModal={closeSellerReviewModal}
        sellerReviewRating={sellerReviewRating}
        setSellerReviewRating={setSellerReviewRating}
        sellerReviewText={sellerReviewText}
        setSellerReviewText={setSellerReviewText}
        handleSubmitSellerReview={handleSubmitSellerReview}
        theme={theme}
        isDark={isDark}
      />
    </Layout>
  );
};

export const OrderDetails = ({route, navigation}) => {
  const {order} = route.params;
  const {t} = useTranslation();
  const {theme, isDark} = useTheme();

  const renderField = (label, value) => {
    if (value === null || value === undefined || value === '') return null;

    return (
      <View style={styles.detailRow}>
        <Text
          category="label"
          style={[
            styles.detailLabel,
            {
              color: isDark
                ? theme['color-shadcn-muted-foreground']
                : theme['color-basic-600'],
            },
          ]}>
          {label}:
        </Text>
        <Text
          style={[
            styles.detailValue,
            {
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-800'],
            },
          ]}>
          {value.toString()}
        </Text>
      </View>
    );
  };

  const renderAddress = (addressData, title) => {
    if (!addressData) return null;

    return (
      <Card
        style={[
          styles.addressCard,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-card']
              : theme['color-basic-100'],
            ...Platform.select({
              ios: {
                shadowColor: isDark ? '#000' : '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 4,
              },
              android: {
                elevation: 3,
              },
            }),
          },
        ]}>
        <View style={styles.addressHeader}>
          <Icon
            name="pin-outline"
            width={20}
            height={20}
            fill={theme['color-primary-500']}
            style={styles.addressIcon}
          />
          <Text
            category="h6"
            style={[
              styles.sectionTitle,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-800'],
              },
            ]}>
            {title}
          </Text>
        </View>
        <Divider
          style={[
            styles.divider,
            {
              backgroundColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
            },
          ]}
        />
        {renderField(t('shippingDetails.address'), addressData.address)}
        {renderField(t('addAddressScreen.addressTypeLabel'), addressData.address_type)}
        {renderField(t('product.city'), addressData.city)}
        {renderField(t('shippingDetails.contactPersonName'), addressData.contact_person_name)}
        {renderField(t('addAddressScreen.countryLabel'), addressData.country)}
        {renderField(t('phone'), addressData.phone)}
        {renderField(t('state'), addressData.state)}
        {renderField(t('shippingDetails.zipCode'), addressData.zip)}
        {addressData.latitude &&
          renderField(t('shippingDetails.latitude'), addressData.latitude)}
        {addressData.longitude &&
          renderField(t('shippingDetails.longitude'), addressData.longitude)}
      </Card>
    );
  };

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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card
          style={[
            styles.mainCard,
            {
              backgroundColor: isDark
                ? theme['color-shadcn-card']
                : theme['color-basic-100'],
              padding: 16,
              ...Platform.select({
                ios: {
                  shadowColor: isDark ? '#000' : '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 4,
                },
                android: {
                  elevation: 4,
                },
              }),
            },
          ]}>
          <Text
            category="h5"
            style={[
              styles.orderTitle,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            {t('Order')} #{order.id}
          </Text>

          <View style={styles.statusContainer}>
            <Text category="s1" style={styles.statusLabel}>
              {t('Status')}:
            </Text>
            <StatusBadge status={order.order_status} t={t} />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon
                name="shopping-bag-outline"
                width={20}
                height={20}
                fill={theme['color-primary-500']}
                style={styles.sectionIcon}
              />
              <Text
                category="h6"
                style={[
                  styles.sectionTitle,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-800'],
                  },
                ]}>
                {t('Order Information')}
              </Text>
            </View>
            {renderField(t('Order Group ID'), order.order_group_id)}
            {renderField(t('Order Type'), order.order_type)}
            {renderField(
              t('Created At'),
              new Date(order.created_at).toLocaleString(),
            )}
            {renderField(
              t('Updated At'),
              new Date(order.updated_at).toLocaleString(),
            )}
            {renderField(t('Verification Code'), order.verification_code)}
            {renderField(t('Order Note'), order.order_note)}
            {renderField(
              t('Is Paused'),
              order.is_pause === '1' ? t('Yes') : t('No'),
            )}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon
                name="credit-card-outline"
                width={20}
                height={20}
                fill={theme['color-primary-500']}
                style={styles.sectionIcon}
              />
              <Text
                category="h6"
                style={[
                  styles.sectionTitle,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-800'],
                  },
                ]}>
                {t('Financial Information')}
              </Text>
            </View>
            {renderField(t('Order Amount'), `PKR ${order.order_amount}`)}
            {renderField(
              t('Admin Commission'),
              `PKR ${order.admin_commission}`,
            )}
            {renderField(t('Shipping Cost'), `PKR ${order.shipping_cost}`)}
            {renderField(t('Discount Amount'), `PKR ${order.discount_amount}`)}
            {renderField(t('Discount Type'), order.discount_type)}
            {renderField(t('Extra Discount'), `PKR ${order.extra_discount}`)}
            {renderField(t('Extra Discount Type'), order.extra_discount_type)}
            {renderField(t('Coupon Code'), order.coupon_code)}
            {renderField(
              t('Coupon Discount Bearer'),
              order.coupon_discount_bearer,
            )}
            {renderField(
              t('Deliveryman Charge'),
              `PKR ${order.deliveryman_charge}`,
            )}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon
                name="credit-card-outline"
                width={20}
                height={20}
                fill={theme['color-primary-500']}
                style={styles.sectionIcon}
              />
              <Text
                category="h6"
                style={[
                  styles.sectionTitle,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-800'],
                  },
                ]}>
                {t('Payment Information')}
              </Text>
            </View>
            {renderField(t('Payment Method'), order.payment_method)}
            {renderField(t('Payment Status'), order.payment_status)}
            {renderField(t('Payment By'), order.payment_by)}
            {renderField(t('Payment Note'), order.payment_note)}
            {renderField(t('Transaction Reference'), order.transaction_ref)}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon
                name="car-outline"
                width={20}
                height={20}
                fill={theme['color-primary-500']}
                style={styles.sectionIcon}
              />
              <Text
                category="h6"
                style={[
                  styles.sectionTitle,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-800'],
                  },
                ]}>
                {t('Delivery Information')}
              </Text>
            </View>
            {renderField(t('Delivery Type'), order.delivery_type)}
            {renderField(t('Delivery Service'), order.delivery_service_name)}
            {renderField(t('Delivery Man ID'), order.delivery_man_id)}
            {renderField(t('Driver Phone'), order.driver_phone)}
            {renderField(
              t('Expected Delivery Date'),
              order.expected_delivery_date,
            )}
            {renderField(t('Shipping Method ID'), order.shipping_method_id)}
            {renderField(t('Shipping Type'), order.shipping_type)}
            {renderField(
              t('Third Party Tracking ID'),
              order.third_party_delivery_tracking_id,
            )}
            {renderField(t('Cause'), order.cause)}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon
                name="person-outline"
                width={20}
                height={20}
                fill={theme['color-primary-500']}
                style={styles.sectionIcon}
              />
              <Text
                category="h6"
                style={[
                  styles.sectionTitle,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-800'],
                  },
                ]}>
                {t('Seller Information')}
              </Text>
            </View>
            {renderField(t('Seller ID'), order.seller_id)}
            {renderField(t('Seller Is'), order.seller_is)}
            {renderField(t('Customer ID'), order.customer_id)}
            {renderField(t('Customer Type'), order.customer_type)}
            {renderField(
              t('Checked'),
              order.checked === 1 ? t('Yes') : t('No'),
            )}
          </View>
        </Card>

        {renderAddress(order.billing_address_data, t('Billing Address'))}
        {renderAddress(order.shipping_address_data, t('Shipping Address'))}

        <Button
          style={[
            styles.backButton,
            {
              backgroundColor: theme['color-primary-500'],
              borderColor: theme['color-primary-600'],
            },
          ]}
          status="primary"
          accessoryLeft={props => <Icon {...props} name="arrow-back-outline" />}
          onPress={() => navigation.goBack()}>
          <Text style={{color: '#ffffff'}}>
            {t('product.back', 'Back to Orders')}
          </Text>
        </Button>
      </ScrollView>
    </Layout>
  );
};

const getStatusColor = status => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return '#f39c12';
    case 'processing':
      return '#3498db';
    case 'delivered':
      return '#2ecc71';
    case 'returned':
      return '#e74c3c';
    case 'failed':
      return '#e74c3c';
    case 'canceled':
      return '#95a5a6';
    case 'out_for_delivery':
      return '#9b59b6';
    default:
      return '#95a5a6';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  mainCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  orderTitle: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  divider: {
    marginVertical: 12,
    height: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    flex: 1,
    fontWeight: '500',
  },
  detailValue: {
    flex: 2,
    textAlign: 'right',
  },
  addressCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressIcon: {
    marginRight: 8,
  },
  backButton: {
    marginTop: 24,
    marginBottom: 16,
    alignSelf: 'flex-start',
    borderRadius: 8,
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  orderDate: {
    fontSize: 12,
    marginTop: 4,
  },
  orderDetails: {
    marginTop: 8,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderInfoLabel: {
    flex: 1,
  },
  orderInfoValue: {
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  totalValue: {
    fontWeight: 'bold',
    textAlign: 'right',
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
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptySubtext: {
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    minWidth: 140,
    borderRadius: 8,
  },
  orderGroupContainer: {
    marginBottom: 16,
    padding: 8,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  groupHeader: {
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  groupTotal: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    marginTop: 4,
  },
  groupTotalText: {
    fontWeight: 'bold',
  },
  addressContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8F9FA',
  },
  addressHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTitle: {
    marginLeft: 8,
    fontWeight: '600',
  },
  addressContent: {
    padding: 8,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 2,
  },
  productDetailsContainer: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  productMeta: {
    marginBottom: 2,
  },
  discountText: {
    fontWeight: '500',
  },
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  reviewedText: {
    marginLeft: 4,
    fontWeight: '500',
  },
  deliverymanInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
  },
  deliverymanText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  orderCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  orderDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  orderMeta: {
    fontSize: 12,
    marginRight: 8,
    flex: 1,
    minWidth: 0,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  actionBtn: {
    marginLeft: 8,
    marginTop: 0,
  },
  sellerInfoButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {width: 320, borderRadius: 16, padding: 24},
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  productCount: {fontSize: 12, marginTop: 4},
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  ratingText: {marginLeft: 12, fontSize: 16, fontWeight: 'bold'},
  modalLabel: {marginTop: 16, marginBottom: 8, fontWeight: '600'},
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingLabel: {
    marginBottom: 10,
    textAlign: 'center',
  },
  ratingText: {
    marginTop: 8,
    color: '#666',
  },
  reviewInput: {
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  cancelButton: {
    borderColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
});

export const MyOrderList = MyOrders;
