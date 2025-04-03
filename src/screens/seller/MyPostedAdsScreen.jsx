import {Button, Layout} from '@ui-kitten/components';
import {Dimensions, ScrollView} from 'react-native';
import {ThemedIcon} from '../../components/Icon';
import {ProductCard} from '../../components/product/ProductCard';
import {flexeStyles, spacingStyles} from '../../utils/globalStyles';

const {width: windowWidth} = Dimensions.get('screen');

const products = Array.from({length: 7}).map((_, i) => {
  return {
    id: i,
    title: 'Lorem ipsum dolor sit amet',
    rating: Math.random() * 5,
    discountPercentage: Math.floor(Math.random() * 25),
    isSoldOut: Math.floor(Math.random() * 250) % 3 === 0,
    price: Math.floor(Math.random() * 250 + 75),
    oldPrice: Math.floor(Math.random() * 250) * 1.25,
    image:
      'https://petbookie.com/storage/app/public/product/thumbnail/2023-05-07-645829a70c659.png',
  };
});

export const MyPostedAdsScreen = ({navigation}) => {
  const onProductDetail = productId => {
    navigation.navigate('ProductPreview');
  };

  return (
    <Layout level="3" style={{flex: 1}}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          spacingStyles.px16,
          {
            flexGrow: 1,
            justifyContent: 'flex-start',
            paddingTop: 8,
            paddingBottom: 90,
          },
        ]}>
        <Layout style={[flexeStyles.row, {flexWrap: 'wrap'}]}>
          {products.map(item => (
            <Layout key={item.id} style={{marginVertical: 8}}>
              <ProductCard
                {...item}
                cardWidth={(windowWidth - 48) / 2}
                onProductDetail={onProductDetail}
              />
            </Layout>
          ))}
        </Layout>
      </ScrollView>
    </Layout>
  );
};
