import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Text, Button, Icon, Layout, useTheme as useUIKittenTheme} from '@ui-kitten/components';
import {useSelector} from 'react-redux';
import {ThemedIcon} from '../Icon';
import {Price} from '../Price';
import {flexeStyles} from '../../utils/globalStyles';
import {useTheme} from '../../theme/ThemeContext';
import {selectBaseUrls} from '../../store/configs';

const {width: windowWidth} = Dimensions.get('screen');

export const WishlistItemCard = ({
  item,
  onRemove,
  onProductDetail,
  isRemoving = false,
}) => {
  const {theme, isDark} = useTheme();
  const uiKittenTheme = useUIKittenTheme();
  const baseUrls = useSelector(selectBaseUrls);

  const handleRemove = () => {
    Alert.alert(
      'Remove from Wishlist',
      'Are you sure you want to remove this item from your wishlist?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
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
      fill={uiKittenTheme['color-danger-default']}
      style={{width: 20, height: 20}}
    />
  );

  if (!item.product) {
    return null;
  }

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
          <Image
            source={{
              uri: product.thumbnail 
                ? (product.thumbnail.startsWith('http') 
                   ? product.thumbnail 
                   : `${baseUrls['product_thumbnail_url']}/${product.thumbnail}`)
                : product.image
                ? (product.image.startsWith('http')
                   ? product.image
                   : `${baseUrls['product_image_url']}/${product.image}`)
                : 'https://via.placeholder.com/120x120?text=No+Image',
            }}
            style={[
              styles.image,
              {
                backgroundColor: isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-200'],
              },
            ]}
            resizeMode="cover"
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
            {product.name || product.slug?.replace(/-/g, ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Product Name'}
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
            <View style={[flexeStyles.row, flexeStyles.itemsCenter, styles.priceRow]}>
              <Text
                category="h6"
                style={[
                  styles.price,
                  {color: theme['color-shadcn-primary']},
                ]}>
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
                  Rs {(product.unit_price / (1 - product.discount / 100)).toFixed(0)}
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
                  color: product.current_stock > 0
                    ? uiKittenTheme['color-success-default']
                    : uiKittenTheme['color-danger-default'],
                },
              ]}>
              {product.current_stock > 0 ? 'In Stock' : 'Out of Stock'}
            </Text>
          )}

          {product.reviews_count !== undefined && (
            <Text
              category="c2"
              style={[
                styles.reviews,
                {
                  color: isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-500'],
                },
              ]}>
              {product.reviews_count} {product.reviews_count === 1 ? 'review' : 'reviews'}
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
            Added {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actionContainer}>
        <Button
          appearance="ghost"
          accessoryLeft={renderRemoveIcon}
          onPress={handleRemove}
          disabled={isRemoving}
          style={styles.removeButton}>
          {isRemoving ? 'Removing...' : ''}
        </Button>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentContainer: {
    flexDirection: 'row',
    padding: 12,
    flex: 1,
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