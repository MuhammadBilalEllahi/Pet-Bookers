import {Layout} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {ScrollView} from 'react-native';
import {FeaturedImages} from '../../components/buyer';
import {HorizontalItemsList} from '../../components/listing';

const categoriesList = [
  {
    id: 1,
    name: 'birds',
    image:
      'https://petbookie.com/storage/app/public/category/2023-04-30-644e25e78f04d.png',
  },
  {
    id: 2,
    name: 'poultry',
    image:
      'https://petbookie.com/storage/app/public/category/2023-04-30-644e261a5a90d.png',
  },
  {
    id: 3,
    name: 'pets',
    image:
      'https://petbookie.com/storage/app/public/category/2023-04-30-644e264ccbd1d.png',
  },
  {
    id: 4,
    name: 'livestock',
    image:
      'https://petbookie.com/storage/app/public/category/2023-04-30-644e268734d19.png',
  },
  {
    id: 5,
    name: 'fish & equarium',
    image:
      'https://petbookie.com/storage/app/public/category/2023-04-30-644e26f775536.png',
  },
  {
    id: 6,
    name: 'pet food',
    image:
      'https://petbookie.com/storage/app/public/category/2023-04-30-644e27fea8a68.png',
  },
];

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
];

const featuredImagesDummy = Array.from({length: 3}).map((_, i) => {
  return {
    id: i,
    image: `https://picsum.photos/1440/2842?random=${i}`,
  };
});

export const SellerHomeMainScreen = ({navigation}) => {
  const {t} = useTranslation();

  const navigateToVandorDetail = vandorId => {
    navigation.navigate('VandorDetail');
  };

  const navigateToProductsSearch = () => {
    navigation.navigate('ProductsSearch');
  };

  const navigateToAllCategoriesScreen = () =>
    navigation.navigate('CategoriesList');
  const navigateToAllVandorsScreen = () => navigation.navigate('VandorsList');

  return (
    <Layout level="3" style={{flex: 1}}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-start',
          paddingTop: 10,
          paddingBottom: 90,
        }}>
        <FeaturedImages slideList={featuredImagesDummy} />
        <HorizontalItemsList
          containerStyle={{marginVertical: 16}}
          list={categoriesList}
          listTitle={t('categories')}
          onItemPress={navigateToProductsSearch}
          onViewAll={navigateToAllCategoriesScreen}
        />
        <HorizontalItemsList
          containerStyle={{marginVertical: 10}}
          list={sellersList}
          listTitle={t('sellers')}
          roundedImage={true}
          onItemPress={navigateToVandorDetail}
          onViewAll={navigateToAllVandorsScreen}
        />
      </ScrollView>
    </Layout>
  );
};
