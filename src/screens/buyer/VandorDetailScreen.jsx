import {Button, Input, Layout, Text, useTheme} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {Dimensions, Image, ScrollView, View, StyleSheet} from 'react-native';
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
    <Layout level="3" style={{flex: 1, backgroundColor: '#f9f9f9'}}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-start',
          paddingTop: 10,
          paddingBottom: 90,
        }}>
        {/* Banner */}
        <View style={styles.bannerShadow}>
          <Image
            source={{
              uri: 'https://petbookie.com/storage/app/public/shop/banner/2023-04-30-644e3d653844b.png',
            }}
            style={styles.banner}
          />
        </View>
        {/* Store Info Card */}
        <View style={styles.storeInfoCard}>
          <View style={styles.storeInfoRow}>
            <Image
              source={{
                uri: 'https://randomuser.me/api/portraits/men/75.jpg',
              }}
              style={styles.avatar}
            />
            <View style={{flex: 1}}>
              <Text style={styles.storeName}>Store Full Name</Text>
              <View style={styles.ratingRow}>
                <AirbnbRating
                  count={5}
                  defaultRating={3.4}
                  showRating={false}
                  size={16}
                  isDisabled={true}
                  selectedColor={theme['color-primary-default']}
                  starContainerStyle={{marginRight: 4}}
                />
                <Text style={styles.ratingValue}>3.4</Text>
                <Text style={styles.ratingCount}>(34)</Text>
              </View>
              <Text style={styles.orderCount}>4 Orders</Text>
            </View>
            <Button
              appearance="ghost"
              accessoryLeft={<ThemedIcon name="message-square-outline" status="primary" />}
              size="small"
              style={styles.messageBtn}
            />
          </View>
        </View>
        {/* Search Bar */}
        <View style={styles.searchBarShadow}>
          <View style={styles.searchBarRow}>
            <Input
              placeholder="Search in Store"
              style={styles.searchInput}
              accessoryRight={<ThemedIcon name="search-outline" />}
            />
            <Button
              appearance="ghost"
              accessoryLeft={<ThemedIcon name="funnel-outline" />}
              size="small"
              style={styles.filterBtn}
            />
          </View>
        </View>
        {/* Product Grid */}
        <View style={styles.productGrid}>
          {products.map(item => (
            <View key={item.id} style={styles.productCardWrapper}>
              <ProductCard {...item} cardWidth={(windowWidth - 56) / 2} />
            </View>
          ))}
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  bannerShadow: {
    borderRadius: 18,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  banner: {
    width: '100%',
    height: (windowWidth - 32) / 2.2,
    resizeMode: 'cover',
    borderRadius: 18,
  },
  storeInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  storeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 14,
    backgroundColor: '#eee',
  },
  storeName: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#222',
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  ratingValue: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 14,
    color: '#888',
    marginLeft: 2,
  },
  orderCount: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  messageBtn: {
    marginLeft: 8,
    marginTop: 0,
  },
  searchBarShadow: {
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 2,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 4,
  },
  searchInput: {
    flexGrow: 1,
    marginRight: 4,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    borderWidth: 0,
    paddingHorizontal: 10,
  },
  filterBtn: {
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    borderWidth: 0,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
  },
  productCardWrapper: {
    margin: 8,
  },
});
