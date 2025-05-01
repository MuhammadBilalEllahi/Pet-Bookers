import React from 'react';
import { FlatList, TouchableOpacity, View, Image } from 'react-native';
import { Text } from '@ui-kitten/components';

export default function CategoryGrid({ categories, onSelect, itemSize, baseUrl }) {
  return (
    <FlatList
      data={categories}
      numColumns={2}
      keyExtractor={item => item.id?.toString() || item.name}
      columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 24 }}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          style={{
            alignItems: 'center',
            width: itemSize,
          }}
          onPress={() => onSelect(index)}
          activeOpacity={0.7}
        >
          <View
            style={{
              width: 125,
              height: 125,
              borderRadius: 100,
              backgroundColor: '#fafafa',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
              elevation: 2,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <Image
              source={{ uri: `${baseUrl}/${item.icon}` }}
              style={{ width: 90, height: 90, resizeMode: 'contain',  }}
            />
          </View>
          <Text style={{ fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
            {item.name}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}