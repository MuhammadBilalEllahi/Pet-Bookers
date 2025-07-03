import React from 'react';
import {Dimensions, Image, StyleSheet, View, TouchableOpacity} from 'react-native';
import {Text, useTheme} from '@ui-kitten/components';
import {Price} from '../Price';
import {AirbnbRating} from 'react-native-ratings';
import {spacingStyles, flexeStyles} from '../../utils/globalStyles';
import {ThemedIcon} from '../Icon';
import {useDispatch, useSelector} from 'react-redux';
import {addToWishlist, removeFromWishlist, selectIsInWishlist} from '../../store/wishlist';

const {width: windowWidth} = Dimensions.get('screen');

export const ProductCard = ({
  id,
  name,
  rating,
  discount,
  discountType,
  isSoldOut,
  price,
  oldPrice,
  image,
  cardWidth,
  onProductDetail,
  slug,
  isDark,
  theme,
}) => {
  const dispatch = useDispatch();
  const uiKittenTheme = useTheme();
  
  // Get wishlist status from Redux
  const isInWishlist = useSelector(state => selectIsInWishlist(state, id));

  const toggleWishlist = (e) => {
    e.stopPropagation(); // Prevent navigation
    if (!id) return;
    
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
        current_stock: isSoldOut ? 0 : 1, // Basic stock info
        thumbnail: image,
      };
      dispatch(addToWishlist({productId: id, productData}));
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={[
        styles.card,
        {
          width: cardWidth || windowWidth * 0.45,
          // backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
        }
      ]}
      onPress={() => onProductDetail && onProductDetail(id, slug)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image }}
          style={[
            styles.image,
            { backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'] }
          ]}
          resizeMode="cover"
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
      <View style={styles.content}>
        <Text
          category="s1"
          numberOfLines={2}
          style={[
            styles.title,
            { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }
          ]}
        >
          {name}
        </Text>
        <View style={[flexeStyles.row, flexeStyles.itemsCenter, flexeStyles.contentBetween, styles.priceRow]}>
          <View style={[flexeStyles.row, flexeStyles.itemsCenter]}>
            <Text
              category="h6"
              style={[
                styles.price,
                { color: theme['color-shadcn-primary'] }
              ]}
            >
              Rs {price}
            </Text>
            {oldPrice > 0 && (
              <Text style={styles.oldPrice}>Rs {oldPrice}</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={toggleWishlist}
            style={styles.heartButton}
          >
            <ThemedIcon
              name={isInWishlist ? "heart" : "heart-outline"}
              fill={isInWishlist ? uiKittenTheme['color-danger-default'] : (isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'])}
              style={styles.heartIcon}
            />
          </TouchableOpacity>
        </View>
        {/* Optionally show rating */}
        {/* <View style={styles.ratingRow}>
          <AirbnbRating
            count={5}
            defaultRating={rating}
            showRating={false}
            size={14}
            isDisabled={true}
            selectedColor={theme['color-primary-default']}
            starContainerStyle={{marginTop: 2}}
          />
        </View> */}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    // backgroundColor: '#fff',
    borderRadius: 14,
    // shadowColor: '#000',
    // shadowOpacity: 0.06,
    // shadowRadius: 8,
    // shadowOffset: { width: 0, height: 2 },
    // elevation: 2,
    marginHorizontal: 4,
    marginVertical: 4,
    overflow: 'hidden',
    
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 14,
    
    borderTopRightRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  soldOutContainer: {
    position: 'absolute',
    width: '90%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  soldOutText: {
    color: '#FF512F',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  badgeContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF512F',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 11,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    padding: 8,
    paddingLeft: 2,
    
  },
  title: {
    fontWeight: '700',
    color: '#121212',
    fontSize: 16,
    // marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  price: {
    fontWeight: 'bold',
    color: 'grey',
    fontSize: 16,
    marginRight: 8,
  },
  oldPrice: {
    color: '#888',
    fontSize: 13,
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  heartButton: {
    padding: 4,
  },
  heartIcon: {
    width: 24,
    height: 24,
  },
  /*
  ratingRow: {
    marginTop: 2,
    alignItems: 'flex-start',
  },
  */
});
