import {Layout} from '@ui-kitten/components';
import {FlatList} from 'react-native';
import {FavoriteItemCard} from '../../components/buyer';

export const MyWishlistScreen = () => {
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
