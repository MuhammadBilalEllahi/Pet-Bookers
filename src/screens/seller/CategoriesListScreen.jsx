import {Card, Layout, Text, useTheme} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {Dimensions, FlatList, Image, ScrollView} from 'react-native';
import {flexeStyles} from '../../utils/globalStyles';

const {width: windowWidth} = Dimensions.get('screen');

const sellersList = [
  {
    id: 1,
    name: 'new shop',
    image:
      'https://petbookie.com/storage/app/public/shop/2023-04-01-6427fce278064.png',
  },
  {
    id: 2,
    name: 'new shop 2',
    image:
      'https://petbookie.com/storage/app/public/shop/2023-04-17-643d40afb34e7.png',
  },
  {
    id: 3,
    name: 'model pets farm',
    image:
      'https://petbookie.com/storage/app/public/shop/2023-04-30-644e3d653810e.png',
  },
  {
    id: 4,
    name: 'us pets farm',
    image:
      'https://petbookie.com/storage/app/public/shop/2023-05-01-644fc3645f5ad.png',
  },
  {
    id: 5,
    name: 'us pets farm',
    image:
      'https://petbookie.com/storage/app/public/shop/2023-05-01-644fc3645f5ad.png',
  },
  {
    id: 6,
    name: 'us pets farm',
    image:
      'https://petbookie.com/storage/app/public/shop/2023-05-01-644fc3645f5ad.png',
  },
  {
    id: 7,
    name: 'us pets farm',
    image:
      'https://petbookie.com/storage/app/public/shop/2023-05-01-644fc3645f5ad.png',
  },
  {
    id: 8,
    name: 'us pets farm',
    image:
      'https://petbookie.com/storage/app/public/shop/2023-05-01-644fc3645f5ad.png',
  },
  {
    id: 9,
    name: 'us pets farm',
    image:
      'https://petbookie.com/storage/app/public/shop/2023-05-01-644fc3645f5ad.png',
  },
  {
    id: 11,
    name: 'us pets farm',
    image:
      'https://petbookie.com/storage/app/public/shop/2023-05-01-644fc3645f5ad.png',
  },
  {
    id: 12,
    name: 'us pets farm',
    image:
      'https://petbookie.com/storage/app/public/shop/2023-05-01-644fc3645f5ad.png',
  },
  {
    id: 13,
    name: 'us pets farm',
    image:
      'https://petbookie.com/storage/app/public/shop/2023-05-01-644fc3645f5ad.png',
  },
];

const productCategories = [
  'Electronics',
  'Clothing',
  'Home and Kitchen',
  'Books',
  'Beauty and Personal Care',
  'Toys and Games',
  'Sports and Outdoors',
  'Health and Household',
  'Automotive',
  'Baby',
  'Grocery',
  'Tools and Home Improvement',
  'Pet Supplies',
  'Movies and TV',
  'Office Products',
  'Music',
  'Industrial and Scientific',
  'Arts, Crafts, and Sewing',
  'Patio, Lawn, and Garden',
  'Video Games',
  'Software',
  'Appliances',
  'Jewelry',
  'Handmade',
  'Kindle Store',
  'Baby Products',
  'CDs and Vinyl',
  'Cell Phones and Accessories',
  'Digital Music',
  'Everything Else',
  'Gift Cards',
];

export const CategoriesListScreen = ({navigation}) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const navigateToVandorDetail = vandorId => {
    navigation.navigate('VandorDetail');
  };

  return (
    <Layout
      level="3"
      style={[
        flexeStyles.row,
        flexeStyles.contentBetween,
        {
          flex: 1,
          marginHorizontal: 16,
        },
      ]}>
      <Layout style={{width: windowWidth / 4}}>
        <FlatList
          data={sellersList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingTop: 10, paddingBottom: 90}}
          renderItem={({item, index}) => (
            <Card
              style={[
                {
                  padding: 8,
                  marginVertical: 4,
                },
                index === 2 && {
                  borderWidth: 2,
                  borderColor: theme['color-primary-default'],
                },
              ]}>
              <Image
                source={{uri: item.image}}
                style={{
                  width: '100%',
                  height: 'auto',
                  aspectRatio: 4 / 3,
                  marginBottom: 4,
                }}
              />
              <Text category="s1" style={{textAlign: 'center'}}>
                {item.name}
              </Text>
            </Card>
          )}
        />
      </Layout>
      <Layout style={{width: windowWidth * 0.75 - 52}}>
        <ScrollView
          contentContainerStyle={[
            flexeStyles.row,
            {
              flexWrap: 'wrap',
              paddingTop: 10,
              paddingBottom: 90,
            },
          ]}
          showsVerticalScrollIndicator={false}>
          {productCategories.map((item, index) => (
            <Card key={index} style={{padding: 10, margin: 4}}>
              <Text style={{fontSize: 18}}>{item}</Text>
            </Card>
          ))}
        </ScrollView>
      </Layout>
    </Layout>
  );
};
