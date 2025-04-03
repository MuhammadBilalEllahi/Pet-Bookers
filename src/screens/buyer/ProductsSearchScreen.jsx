import {useState} from 'react';
import {Dimensions, ScrollView} from 'react-native';
import {Button, Input, Layout, useTheme} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {ProductCard} from '../../components/product/ProductCard';
import {ThemedIcon} from '../../components/Icon';
import {ProductsFilterModal} from '../../components/modals/ProductsFilterModal';
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

export const ProductsSearchScreen = () => {
  const {t} = useTranslation();
  const theme = useTheme();

  const [filterVisible, setFilterVisible] = useState(false);

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
            paddingTop: 10,
            paddingBottom: 90,
          },
        ]}>
        <Layout
          level="1"
          style={[spacingStyles.p16, flexeStyles.row, flexeStyles.itemsCenter]}>
          <Input
            placeholder="Search Products"
            style={{flexGrow: 1, marginRight: 4}}
            accessoryRight={<ThemedIcon name="search-outline" />}
          />
          <Button
            appearance="ghost"
            accessoryLeft={<ThemedIcon name="funnel-outline" />}
            size="small"
            onPress={() => setFilterVisible(true)}
          />
        </Layout>
        <Layout style={[flexeStyles.row, {flexWrap: 'wrap'}]}>
          {products.map(item => (
            <Layout key={item.id} style={{marginVertical: 8}}>
              <ProductCard {...item} cardWidth={(windowWidth - 48) / 2} />
            </Layout>
          ))}
        </Layout>
      </ScrollView>
      <ProductsFilterModal
        visible={filterVisible}
        onCloseModal={() => setFilterVisible(false)}
      />
    </Layout>
  );
};
