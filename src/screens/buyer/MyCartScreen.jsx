import {Button, Layout} from '@ui-kitten/components';
import {FlatList} from 'react-native';
import {CartItemCard} from '../../components/buyer';
import {spacingStyles} from '../../utils/globalStyles';

export const MyCartScreen = () => {
  return (
    <Layout level="3" style={{flex: 1}}>
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
        contentContainerStyle={{paddingBottom: 16}}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => <CartItemCard {...item} />}
      />
      <Layout
        level="1"
        style={[
          spacingStyles.px16,
          {
            paddingBottom: 96,
            paddingTop: 16,
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          },
        ]}>
        <Button style={{borderRadius: 100}}>Checkout</Button>
      </Layout>
    </Layout>
  );
};
