import {Card, Input, Layout, Text, useTheme} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {Dimensions, Image, ScrollView} from 'react-native';
import {ThemedIcon} from '../../components/Icon';
import {flexeStyles, spacingStyles} from '../../utils/globalStyles';

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
];

export const VandorsListScreen = ({navigation}) => {
  const {t} = useTranslation();

  const navigateToVandorDetail = vandorId => {
    navigation.navigate('VandorDetail');
  };

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
        <Layout
          level="1"
          style={[
            spacingStyles.p16,
            flexeStyles.row,
            flexeStyles.itemsCenter,
            {
              marginHorizontal: 16,
              marginBottom: 8,
            },
          ]}>
          <Input
            placeholder="Search Store"
            style={{flexGrow: 1, marginRight: 4}}
            accessoryRight={<ThemedIcon name="search-outline" />}
          />
        </Layout>
        <Layout
          style={[
            flexeStyles.row,
            {
              flexWrap: 'wrap',
              paddingHorizontal: 12,
            },
          ]}>
          {sellersList.map(item => (
            <Card
              key={item.id}
              style={{
                width: (windowWidth - 40) / 2,
                padding: 8,
                margin: 4,
              }}
              onPress={() => navigateToVandorDetail(item.id)}>
              <Image
                source={{
                  uri: item.image,
                }}
                style={{
                  width: (windowWidth - 40) / 2 - 16,
                  height: 'auto',
                  aspectRatio: 4 / 3,
                  resizeMode: 'cover',
                }}
              />
              <Text category="h6" style={{textAlign: 'center', marginTop: 8}}>
                {item.name}
              </Text>
            </Card>
          ))}
        </Layout>
      </ScrollView>
    </Layout>
  );
};
