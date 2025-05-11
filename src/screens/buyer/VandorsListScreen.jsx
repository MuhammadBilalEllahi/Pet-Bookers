import {Layout, Text} from '@ui-kitten/components';
import {Dimensions, Image, ScrollView, View, StyleSheet, TouchableOpacity} from 'react-native';

const {width: windowWidth} = Dimensions.get('screen');

const sellersList = [
  {
    id: 1,
    name: 'Model Pets Farm',
    image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg',
  },
  {
    id: 2,
    name: 'Ali Dastageer',
    image: 'https://randomuser.me/api/portraits/men/44.jpg',
  },
  {
    id: 3,
    name: 'Poultry Heaven',
    image: 'https://images.pexels.com/photos/162240/chicken-poultry-animals-bird-162240.jpeg',
  },
  {
    id: 4,
    name: 'Fish Pond .com',
    image: 'https://images.pexels.com/photos/128756/pexels-photo-128756.jpeg',
  },
  {
    id: 5,
    name: 'Dr. Khalid',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  {
    id: 6,
    name: 'Pet Groomers',
    image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg',
  },
];

export const VandorsListScreen = ({navigation}) => {
  const navigateToVandorDetail = vandorId => {
    navigation.navigate('VandorDetail');
  };

  return (
    <Layout level="3" style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1, justifyContent: 'flex-start', paddingTop: 10, paddingBottom: 90}}>
        <Text style={styles.header}>All Sellers</Text>
        <View style={styles.grid}>
          {sellersList.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.sellerItem}
              onPress={() => navigateToVandorDetail(item.id)}>
              <Image
                source={{uri: item.image}}
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
});
