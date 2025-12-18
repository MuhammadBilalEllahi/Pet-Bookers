import React, {useState} from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Text, Button, Layout} from '@ui-kitten/components';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {ThemedIcon} from '../Icon';
import {Price} from '../Price';
import {flexeStyles} from '../../utils/globalStyles';
import {useTheme} from '../../theme/ThemeContext';
import {BASE_URLS, selectBaseUrls} from '../../store/configs';
import FastImage from '@d11/react-native-fast-image';
import {WishlistButton} from '../product/WishlistButton';
import FastImageWithFallback from '../common/FastImageWithFallback';
const {width: windowWidth} = Dimensions.get('screen');

export const WishlistItemCard = ({
  item,
  onRemove,
  onProductDetail,
  isRemoving = false,
}) => {
  const {theme, isDark} = useTheme();
  const {t} = useTranslation();
  const baseUrls = useSelector(selectBaseUrls);

  const handleRemove = () => {
    Alert.alert(
      t('wishlist.removeTitle', 'Remove from Wishlist'),
      t(
        'wishlist.removeMessage',
        'Are you sure you want to remove this item from your wishlist?',
      ),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('wishlist.remove', 'Remove'),
          style: 'destructive',
          onPress: () => onRemove(item),
        },
      ],
    );
  };

  const handleProductPress = () => {
    if (onProductDetail && item.product) {
      onProductDetail(item.product.id, item.product.slug);
    }
  };

  const renderRemoveIcon = props => (
    <ThemedIcon
      {...props}
      name="heart"
      fill={theme['color-danger-default']}
      style={{width: 20, height: 20}}
    />
  );

  if (!item.product) {
    return null;
  }
  // console.log("item.product", item.product);
  const product = item.product;

  return (
    <Layout
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
      ]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleProductPress}
        style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <FastImageWithFallback
            source={{
              uri: product?.thumbnail
                ? product?.thumbnail?.startsWith('http')
                  ? product?.thumbnail
                  : `${BASE_URLS.product_thumbnail_url}/${product?.thumbnail}`
                : product?.image
                ? product?.image?.startsWith('http')
                  ? product?.image
                  : `${baseUrls['product_image_url']}/${product?.image}`
                : 'https://via.placeholder.com/120x120?text=No+Image',
              priority: FastImage.priority.high,
            }}
            fallbackSource={{
              uri: 'https://via.placeholder.com/120x120?text=No+Image',
            }}
            resizeMode={FastImage.resizeMode.cover}
            style={styles.image}
          />
        </View>

        <View style={styles.productInfo}>
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
            {product.name ||
              (product.slug
                ? product.slug
                    .split('-')
                    .slice(0, -1) // Remove the last segment (random ID)
                    .join(' ')
                    .replace(/\b\w/g, l => l.toUpperCase())
                : 'Product Name')}
          </Text>

          {product.brand && (
            <Text
              category="c1"
              style={[
                styles.brand,
                {
                  color: isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600'],
                },
              ]}>
              {product.brand}
            </Text>
          )}

          {(product.unit_price || product.price) && (
            <View
              style={[
                flexeStyles.row,
                flexeStyles.itemsCenter,
                styles.priceRow,
              ]}>
              <Text
                category="h6"
                style={[styles.price, {color: theme['color-shadcn-primary']}]}>
                Rs {product.unit_price || product.price || '0'}
              </Text>
              {product.discount > 0 && product.unit_price && (
                <Text
                  style={[
                    styles.oldPrice,
                    {
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-500'],
                    },
                  ]}>
                  Rs{' '}
                  {(product.unit_price / (1 - product.discount / 100)).toFixed(
                    0,
                  )}
                </Text>
              )}
            </View>
          )}

          {product.current_stock !== undefined && (
            <Text
              category="c2"
              style={[
                styles.stock,
                {
                  color:
                    product.current_stock > 0
                      ? theme['color-success-default']
                      : theme['color-danger-default'],
                },
              ]}>
              {product.current_stock > 0
                ? t('product.inStock', 'In Stock')
                : t('product.outOfStock')}
            </Text>
          )}

          <Text
            category="c2"
            style={[
              styles.addedDate,
              {
                color: isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-500'],
              },
            ]}>
            {t('wishlist.addedOn', 'Added {{date}}', {
              date: new Date(item.created_at).toLocaleDateString(),
            })}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actionContainer}>
      <WishlistButton product={product}  />

        {/* <Button
          appearance="ghost"
          accessoryLeft={renderRemoveIcon}
          onPress={handleRemove}
          disabled={isRemoving}
          style={styles.removeButton}>
          {isRemoving ? t('common.loading') : ''}
        </Button> */}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 140, // Ensure minimum height for proper card display
    // Remove elevation for shadcn style
    elevation: 0,
    shadowOpacity: 0,
  },
  contentContainer: {
    flexDirection: 'row',
    padding: 16,
    flex: 1,
    minHeight: 120, // Ensure minimum content height
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  brand: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  priceRow: {
    marginBottom: 4,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  oldPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    fontWeight: '400',
  },
  stock: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  reviews: {
    fontSize: 11,
    fontWeight: '400',
    marginBottom: 2,
  },
  addedDate: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  actionContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});
