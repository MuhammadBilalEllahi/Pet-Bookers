import React, {useEffect, useState} from 'react';
import {View, Image, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {Layout, Divider, Icon} from '@ui-kitten/components';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../theme/ThemeContext';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {loadSellerInfo, selectSellerInfo} from '../../store/sellerDetails';
import {BASE_URLS} from '../../store/configs';
import {AppScreens} from '../../navigators/AppNavigator';
import {SellerInfoCardShimmer} from './SellerInfoCardShimmer';

/**
 * Safely access nested seller properties with fallback to shop properties
 * @param {Object} sellerData - The seller data object
 * @param {string} propertyPath - Dot-separated property path (e.g., 'shop.name')
 * @param {*} fallback - Default value if property doesn't exist
 * @returns {*} The property value or fallback
 */
const getSellerProperty = (sellerData, propertyPath, fallback = '') => {
  if (!sellerData) return fallback;

  const pathParts = propertyPath.split('.');
  let current = sellerData;

  for (const part of pathParts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return fallback;
    }
  }

  return current || fallback;
};

/**
 * Get seller ID from product or seller data
 * @param {Object} product - The product object
 * @param {Object} sellerInfo - The seller info from API
 * @returns {number|null} Seller ID or null if not available
 */
const getSellerId = (product, sellerInfo) => {
  return (
    sellerInfo?.id ||
    product?.seller?.id ||
    product?.user_id ||
    null
  );
};

/**
 * Get shop name with fallback
 */
const getShopName = (product, sellerInfo) => {
  return (
    getSellerProperty(sellerInfo, 'shop.name') ||
    getSellerProperty(product, 'shop.name') ||
    getSellerProperty(product, 'seller.shop.name') ||
    'Unknown Farm'
  );
};

/**
 * Get shop image with fallback
 */
const getShopImage = (product, sellerInfo) => {
  return (
    getSellerProperty(sellerInfo, 'shop.image') ||
    getSellerProperty(product, 'shop.image') ||
    getSellerProperty(product, 'seller.shop.image') ||
    ''
  );
};

/**
 * Get shop products count with fallback
 */
const getShopProductsCount = (product, sellerInfo) => {
  return (
    getSellerProperty(sellerInfo, 'shop.products_count', 0) ||
    getSellerProperty(product, 'shop.products_count', 0) ||
    getSellerProperty(product, 'seller.shop.products_count', 0) ||
    0
  );
};

/**
 * Get reviews count with fallback
 */
const getReviewsCount = (product, sellerInfo) => {
  return (
    sellerInfo?.shop?.reviews_count ||
    product?.reviews_count ||
    product?.shop?.reviews_count ||
    product?.seller?.shop?.reviews_count ||
    0
  );
};

export const SellerInfoCard = ({product, navigation}) => {
  const {theme, isDark} = useTheme();
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {sellerInfo, sellerInfoLoading, sellerInfoError} = useSelector(selectSellerInfo);
  const [sellerId, setSellerId] = useState(null);

  // Get seller ID from product
  useEffect(() => {
    const id =
      product?.seller?.id ||
      product?.user_id ||
      null;
    setSellerId(id);
  }, [product]);

  // Load seller info independently
  useEffect(() => {
    if (sellerId) {
      dispatch(loadSellerInfo(sellerId));
    }
  }, [sellerId, dispatch]);

  if (!product) {
    return null;
  }

  // Show shimmer while loading
  if (sellerInfoLoading) {
    return <SellerInfoCardShimmer />;
  }

  // Show message if seller info is not available (error or empty response)
  // Check if there's an error, or if sellerInfo is null/empty, or if there's no shop data anywhere
  const hasNoShopData = 
    !sellerInfo?.shop && 
    !product?.seller?.shop && 
    !product?.shop;
  
  if (sellerInfoError || !sellerInfo || hasNoShopData) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-card']
              : theme['color-basic-100'],
            borderColor: isDark
              ? theme['color-shadcn-border']
              : theme['color-basic-400'],
          },
        ]}>
        <View style={styles.emptyStateContainer}>
          <Icon
            name="alert-circle-outline"
            width={48}
            height={48}
            fill={
              isDark
                ? theme['color-shadcn-muted-foreground']
                : theme['color-basic-600']
            }
            style={styles.emptyStateIcon}
          />
          <Text
            style={[
              styles.emptyStateTitle,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            {t('product.shopUnavailable') || 'Shop Unavailable'}
          </Text>
          <Text
            style={[
              styles.emptyStateMessage,
              {
                color: isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600'],
              },
            ]}>
            {t('product.shopUnavailableMessage') ||
              'This shop has either been abandoned or closed. The seller information is no longer available.'}
          </Text>
        </View>
      </View>
    );
  }

  const shopName = getShopName(product, sellerInfo);
  const shopImage = getShopImage(product, sellerInfo);
  const productsCount = getShopProductsCount(product, sellerInfo);
  const reviewsCount = getReviewsCount(product, sellerInfo);
  const currentSellerId = getSellerId(product, sellerInfo);
  const vacationStatus = sellerInfo?.shop?.vacation_status || product?.seller?.shop?.vacation_status;

  const navigateToVandorDetail = vandorId => {
    if (vandorId) {
      navigation.navigate(AppScreens.VANDOR_DETAIL, {sellerId: vandorId});
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme['color-shadcn-card']
            : theme['color-basic-100'],
          borderColor: isDark
            ? theme['color-shadcn-border']
            : theme['color-basic-400'],
        },
      ]}>
      <View style={styles.header}>
        <Image
          source={{
            uri:
              BASE_URLS.shop_image_url && shopImage
                ? `${BASE_URLS.shop_image_url}/${shopImage}`
                : undefined,
          }}
          style={[
            styles.shopImage,
            {
              backgroundColor: isDark
                ? theme['color-shadcn-secondary']
                : theme['color-basic-200'],
            },
          ]}
        />
        <View style={styles.headerText}>
          <View style={styles.shopNameRow}>
            <Text
              style={[
                styles.shopName,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {shopName}
            </Text>
            {vacationStatus === 1 && (
              <View style={styles.vacationBadge}>
                <Text style={styles.vacationText}>VACATION</Text>
              </View>
            )}
          </View>
          <View style={styles.sellerInfoRow}>
            <Text
              style={[
                styles.sellerInfoText,
                {
                  color: isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600'],
                },
              ]}>
              {t('product.sellerInfo')}
            </Text>
            <Icon
              name="info"
              width={14}
              height={14}
              fill={
                isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600']
              }
            />
          </View>
        </View>
      </View>

      <Divider
        style={{
          marginVertical: 8,
          backgroundColor: isDark
            ? theme['color-shadcn-border']
            : theme['color-basic-400'],
        }}
      />

      <View style={styles.statsRow}>
        <View
          style={[
            styles.statBox,
            {
              backgroundColor: isDark
                ? theme['color-shadcn-secondary']
                : theme['color-basic-200'],
            },
          ]}>
          <Text
            style={[
              styles.statNumber,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            {productsCount}
          </Text>
          <Text
            style={[
              styles.statLabel,
              {
                color: isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600'],
              },
            ]}>
            {t('product.products')}
          </Text>
        </View>
        <View
          style={[
            styles.statBox,
            {
              backgroundColor: isDark
                ? theme['color-shadcn-secondary']
                : theme['color-basic-200'],
            },
          ]}>
          <Text
            style={[
              styles.statNumber,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            {reviewsCount}
          </Text>
          <Text
            style={[
              styles.statLabel,
              {
                color: isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600'],
              },
            ]}>
            {t('product.reviews')}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.visitStoreButton}
        onPress={() => navigateToVandorDetail(currentSellerId)}>
        <LinearGradient
          colors={[
            theme['color-shadcn-primary'],
            theme['color-primary-400'],
          ]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.gradient}>
          <Text
            style={[
              styles.visitStoreText,
              {color: theme['color-shadcn-primary-foreground']},
            ]}>
            {t('product.visitStore')}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: 0,
    marginBottom: 16,
    marginTop: 4,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  shopImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  shopName: {
    fontWeight: 'bold',
    fontSize: 17,
    flex: 1,
  },
  vacationBadge: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  vacationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sellerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  sellerInfoText: {
    fontSize: 13,
    marginRight: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 10,
    marginRight: 6,
    paddingVertical: 12,
  },
  statNumber: {
    fontWeight: 'bold',
    fontSize: 28,
  },
  statLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  visitStoreButton: {
    marginTop: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  visitStoreText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

