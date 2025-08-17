import React, { useState } from 'react';
import { FlatList, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { Text, Icon } from '@ui-kitten/components';
import { useTheme } from '../../../../theme/ThemeContext';



export default function SubCategoryGrid({ subcategories: initialSubcategories, onBack, categoryId, categoryName, baseUrl, t, navigation }) {
  const { theme, isDark } = useTheme();
  // console.log("SUB CAt id", categoryId);
  const itemSize = 150;
  const [subcategories, setSubcategories] = useState(initialSubcategories || []);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  // Fetch categories that are not subcategories for the given categoryId

 
  





  const renderSubcategory = ({ item }) => (
    <TouchableOpacity
      style={{ alignItems: 'center', width: itemSize, marginBottom: 24 }}
      activeOpacity={0.8}
      onPress={() => {
        navigation.navigate('SubCategoryProducts', {
          subcategory: item,
          categoryId: categoryId,
          categoryName: categoryName
        });
      }}
    >
              <View
          style={{
            width: 90,
            height: 90,
            borderRadius: 50,
            backgroundColor: isDark ? theme['color-shadcn-secondary'] : '#f5f5f5',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
            borderWidth: 1,
            borderColor: isDark ? theme['color-shadcn-border'] : theme['color-primary-200'],
          }}
        >
        {item.icon ? (
          <Image
            source={{ uri: `${baseUrl}/${item.icon}` }}
            style={{ width: 48, height: 48, resizeMode: 'contain' }}
          />
        ) : (
          <Icon 
            name="grid-outline" 
            fill={isDark ? theme['color-shadcn-muted-foreground'] : "#aaa"} 
            style={{ width: 32, height: 32 }} 
          />
        )}
      </View>
      <Text style={{ 
        fontWeight: 'bold', 
        fontSize: 15, 
        textAlign: 'center',
        color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
      }}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <TouchableOpacity
          onPress={onBack}
          style={{
            marginRight: 8,
            padding: 4,
            borderRadius: 20,
            backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-primary-100'],
          }}
        >
          <Icon 
            name="arrow-back-outline" 
            fill={isDark ? theme['color-shadcn-foreground'] : theme['color-primary-500']} 
            style={{ width: 24, height: 24 }} 
          />
        </TouchableOpacity>
        <Text style={{ 
          fontWeight: 'bold', 
          fontSize: 18,
          color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
        }}>
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
          <Text style={{ 
            textAlign: 'center', 
            color: isDark ? theme['color-shadcn-muted-foreground'] : '#888', 
            marginTop: 32 
          }}>
            {t('No subcategories found')}
          </Text>
        }
        style={{ marginBottom: 16 }}
      />
    </ScrollView>
  );
}
