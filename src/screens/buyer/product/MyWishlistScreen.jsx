import {Layout} from '@ui-kitten/components';
import {FlatList} from 'react-native';
import { axiosBuyerClient } from '../../../utils/axiosClient';
import { useEffect, useState } from 'react';
import { FavoriteItemCard } from '../../../components/buyer';

// wish-list
export const MyWishlistScreen = () => {

  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await axiosBuyerClient.get('customer/wish-list/');
        console.log("wishlist", response.data);
        setWishlist(response.data);
      } catch (error) {
        console.log("error", error?.response?.data?.message || error?.message || error?.response?.data);
      }
    };
    fetchWishlist();
  }, []);  

  return (
    <Layout level="3">
      <FlatList
        showsVerticalScrollIndicator={false}
        data={[
          {id: 1},
          {id: 2},
          {id: 3},
          {id: 4},
          {id: 5},
          {id: 6},
          {id: 7},
          {id: 8},
          {id: 9},
        ]}
        contentContainerStyle={{paddingBottom: 90}}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => <FavoriteItemCard {...item} />}
      />
    </Layout>
  );
};
