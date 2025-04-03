import {Dimensions, Image, StyleSheet, View} from 'react-native';
import {Card, Layout, Text, useTheme} from '@ui-kitten/components';
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
}) => {
  const theme = useTheme();
  return (
    <Card
      style={[styles.container, {width: cardWidth || windowWidth * 0.6}]}
      onPress={() => onProductDetail(id)}>
      <Layout style={styles.imageContainer}>
        <Image
          source={{
            uri: image,
          }}
          style={styles.image}
        />
        {isSoldOut && (
          <View style={styles.soldOutContainer}>
            <Text
              status="primary"
              category="h6"
              style={{textTransform: 'uppercase'}}>
              Out Of Stock
            </Text>
          </View>
        )}
        {discount > 0 && (
          <View
            style={[
              styles.badgeContainer,
              {backgroundColor: theme['color-primary-default']},
            ]}>
            <Text style={{color: '#fff', fontWeight: '500'}}>
              -{discount}
              {discountType === 'percent' && '%'}
            </Text>
          </View>
        )}
      </Layout>
      <View style={spacingStyles.p16}>
        <Text status="primary" style={styles.title}>
          {name}
        </Text>
        <View>
          <Price amount={price} />
          {oldPrice > 0 && <Price amount={oldPrice} cross={true} />}
        </View>
        <AirbnbRating
          count={5}
          defaultRating={rating}
          showRating={false}
          size={20}
          isDisabled={true}
          starContainerStyle={{marginTop: 8}}
          selectedColor={theme['color-primary-default']}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 4,
    borderRadius: 10,
  },
  imageContainer: {
    position: 'relative',
  },
  soldOutContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffffc7',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  badgeContainer: {
    position: 'absolute',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderBottomRightRadius: 10,
  },
  image: {
    width: '100%',
    resizeMode: 'cover',
    aspectRatio: 4 / 3,
  },
  title: {
    fontWeight: '500',
    fontSize: 18,
    marginBottom: 10,
  },
});
