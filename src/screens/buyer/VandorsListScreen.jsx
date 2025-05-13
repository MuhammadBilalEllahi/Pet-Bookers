import {Layout, Text, Spinner} from '@ui-kitten/components';
import {Dimensions, Image, ScrollView, View, StyleSheet, TouchableOpacity} from 'react-native';
import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {loadSellers, selectSellers} from '../../store/buyersHome';
import {selectBaseUrls} from '../../store/configs';

const {width: windowWidth} = Dimensions.get('screen');

export const VandorsListScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const baseUrls = useSelector(selectBaseUrls);
  const {sellers, sellersLoading, sellersError} = useSelector(selectSellers);

  useEffect(() => {
    dispatch(loadSellers());
  }, []);

  const navigateToVandorDetail = vandorId => {
    navigation.navigate('VandorDetail', {sellerId: vandorId});
  };

  if (sellersLoading) {
    return (
      <Layout level="3" style={styles.loadingContainer}>
        <Spinner size="large" />
      </Layout>
    );
  }

  if (sellersError) {
    return (
      <Layout level="3" style={styles.errorContainer}>
        <Text status="danger">{sellersError}</Text>
      </Layout>
    );
  }

  return (
    <Layout level="3" style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1, justifyContent: 'flex-start', paddingTop: 10, paddingBottom: 90}}>
        <Text style={styles.header}>All Sellers</Text>
        <View style={styles.grid}>
          {sellers.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.sellerItem}
              onPress={() => navigateToVandorDetail(item.id)}>
              <Image
                source={{uri: `${baseUrls['shop_image_url']}/${item.image}`}}
                style={styles.sellerImage}
              />
              <Text style={styles.sellerName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 18,
    marginLeft: 12,
    marginTop: 8,
    color: '#222',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
  },
  sellerItem: {
    width: windowWidth * 0.46,
    alignItems: 'center',
    marginBottom: 24,
  },
  sellerImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#eee',
    marginBottom: 8,
  },
  sellerName: {
    textAlign: 'center',
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
