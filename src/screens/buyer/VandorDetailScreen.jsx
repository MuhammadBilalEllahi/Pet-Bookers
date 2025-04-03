import {Button, Input, Layout, Text, useTheme} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {Dimensions, Image, ScrollView} from 'react-native';
import {AirbnbRating} from 'react-native-ratings';
import {ProductCard} from '../../components/product/ProductCard';
import {ThemedIcon} from '../../components/Icon';
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

export const VandorDetailScreen = () => {
  const {t} = useTranslation();
  const theme = useTheme();

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
        <Image
          source={{
            uri: 'https://petbookie.com/storage/app/public/shop/banner/2023-04-30-644e3d653844b.png',
          }}
          style={{
            width: '100%',
            height: (windowWidth - 32) / 2.35,
            resizeMode: 'cover',
          }}
        />
        <Layout
          level="1"
          style={[
            spacingStyles.p16,
            flexeStyles.row,
            flexeStyles.itemsCenter,
            flexeStyles.contentBetween,
            {
              marginVertical: 8,
            },
          ]}>
          <Layout style={flexeStyles.row}>
            <Image
              source={{
                uri: 'https://randomuser.me/api/portraits/thumb/men/75.jpg',
              }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 50,
                marginRight: 8,
              }}
            />
            <Layout>
              <Text category="h6">Store Full Name</Text>
              <Layout
                style={[
                  flexeStyles.row,
                  flexeStyles.itemsCenter,
                  {
                    marginVertical: 4,
                  },
                ]}>
                <AirbnbRating
                  count={5}
                  defaultRating={3.4}
                  showRating={false}
                  size={14}
                  isDisabled={true}
                  selectedColor={theme['color-primary-default']}
                />
                <Text category="h6" style={{fontSize: 16, marginHorizontal: 2}}>
                  3.4
                </Text>
                <Text category="s1">(34)</Text>
              </Layout>
              <Text category="s1">4 Orders</Text>
            </Layout>
          </Layout>
          <Button
            appearance="ghost"
            accessoryLeft={
              <ThemedIcon name="message-square-outline" status="primary" />
            }
            size="small"
          />
        </Layout>
        <Layout
          level="1"
          style={[spacingStyles.p16, flexeStyles.row, flexeStyles.itemsCenter]}>
          <Input
            placeholder="Search in Store"
            style={{flexGrow: 1, marginRight: 4}}
            accessoryRight={<ThemedIcon name="search-outline" />}
          />
          <Button
            appearance="ghost"
            accessoryLeft={<ThemedIcon name="funnel-outline" />}
            size="small"
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
    </Layout>
  );
};
