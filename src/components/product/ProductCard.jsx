import {Dimensions, Image, StyleSheet, View, TouchableOpacity} from 'react-native';
import {Text, useTheme} from '@ui-kitten/components';
import {Price} from '../Price';
import {AirbnbRating} from 'react-native-ratings';
import {spacingStyles} from '../../utils/globalStyles';

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
}) => {
  const theme = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={[styles.card, {width: cardWidth || windowWidth * 0.6}]}
      onPress={() => onProductDetail && onProductDetail(id, slug)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image }}
          style={styles.image}
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
        <Text style={styles.title} numberOfLines={2}>{name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>Rs {price}</Text>
          {oldPrice > 0 && (
            <Text style={styles.oldPrice}>Rs {oldPrice}</Text>
          )}
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
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffffcc',
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
    padding: 12,
  },
  title: {
    fontWeight: '700',
    color: '#121212',
    fontSize: 16,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  price: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 16,
    marginRight: 8,
  },
  oldPrice: {
    color: '#888',
    fontSize: 13,
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  /*
  ratingRow: {
    marginTop: 2,
    alignItems: 'flex-start',
  },
  */
});
