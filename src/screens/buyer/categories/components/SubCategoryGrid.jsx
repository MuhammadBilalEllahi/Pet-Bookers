import React from 'react';
import { FlatList, TouchableOpacity, View, Image } from 'react-native';
import { Text, Icon, useTheme } from '@ui-kitten/components';

export default function SubCategoryGrid({ subcategories, onBack, categoryName, baseUrl, t }) {
  const theme = useTheme();
  const itemSize = 150; // or calculate as needed

  const renderSubcategory = ({ item }) => (
    <TouchableOpacity
      style={{
        alignItems: 'center',
        width: itemSize,
        marginBottom: 24,
      }}
      activeOpacity={0.8}
      onPress={() => {
        // Handle subcategory click here
      }}
    >
      <View
        style={{
          width: 90,
          height: 90,
          borderRadius: 50,
          backgroundColor: '#f5f5f5',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
          borderWidth: 1,
          borderColor: theme['color-primary-200'],
        }}
      >
        {item.icon ? (
          <Image
            source={{ uri: `${baseUrl}/${item.icon}` }}
            style={{ width: 48, height: 48, resizeMode: 'contain' }}
          />
        ) : (
          <Icon name="grid-outline" fill="#aaa" style={{ width: 32, height: 32 }} />
        )}
      </View>
      <Text style={{ fontWeight: 'bold', fontSize: 15, textAlign: 'center' }}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <TouchableOpacity
          onPress={onBack}
          style={{
            marginRight: 8,
            padding: 4,
            borderRadius: 20,
            backgroundColor: theme['color-primary-100'],
          }}
        >
          <Icon name="arrow-back-outline" fill={theme['color-primary-500']} style={{ width: 24, height: 24 }} />
        </TouchableOpacity>
        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>
          {categoryName} {t('Subcategories')}
        </Text>
      </View>
      <FlatList
        data={subcategories}
        numColumns={2}
        keyExtractor={item => item.id?.toString() || item.name}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={renderSubcategory}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>
            {t('No subcategories found')}
          </Text>
        }
      />
    </>
  );
}
