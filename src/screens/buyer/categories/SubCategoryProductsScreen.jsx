import React, { useEffect, useState } from 'react';
import { FlatList, View, ActivityIndicator } from 'react-native';
import { Text, Icon } from '@ui-kitten/components';
import { useTheme } from '../../../theme/ThemeContext';
import { createSmartBuyerClient } from '../../../utils/authAxiosClient';
import { ProductCard } from '../../../components/product/ProductCard';
import { TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectBaseUrls } from '../../../store/configs';
import { loadWishlist } from '../../../store/wishlist';
import { useFocusEffect } from '@react-navigation/native';


const smartBuyerClient = createSmartBuyerClient();

export const SubCategoryProductsScreen = ({ route, navigation }) => {
  const { theme, isDark } = useTheme();
  const { subcategory, categoryId, categoryName } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseUrls = useSelector(selectBaseUrls);
  const dispatch = useDispatch();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log("fetching products for subcategory", subcategory.id, categoryId);
      const res = await smartBuyerClient.get(`categories/${categoryId}/subcategories/${subcategory.id}/products`);
      console.log("subcategory products", JSON.stringify(res.data, null, 2));
      setProducts(res.data.products || []);
    } catch (e) {
      console.error("Error fetching products:", e);
      setProducts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    // Load wishlist when component mounts
    dispatch(loadWishlist());
  }, [subcategory.id, categoryId, dispatch]);
  
  // Reload wishlist when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      dispatch(loadWishlist());
    }, [dispatch])
  );

  const renderProduct = ({ item }) => {
    // Transform the product data to match ProductCard expectations
    const productData = {
      id: item.id,
      name: item.name,
      slug: item.slug,
      price: item.unit_price,
      oldPrice: item.discount > 0 ? item.unit_price : 0,
      image: item.thumbnail ? `${baseUrls['product_thumbnail_url']}/${item.thumbnail}` : null,
      discount: item.discount || 0,
      discountType: item.discount_type || 'percent',
      isSoldOut: item.current_stock === 0,
      rating: item.average_review || 0,
      cardWidth: 150,
      isDark: isDark,
      onProductDetail: (productId, slug) => {
        navigation.navigate('ProductDetail', { productId, slug });
      }
    };
    
    return <ProductCard {...productData} />;
  };

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'], 
      padding: 16 
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
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
          {subcategory.name} {categoryName}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator 
          size="large" 
          style={{ marginVertical: 24 }}
          color={isDark ? theme['color-shadcn-primary'] : theme['color-primary-500']}
        />
      ) : products.length === 0 ? (
        <Text style={{ 
          textAlign: 'center', 
          color: isDark ? theme['color-shadcn-muted-foreground'] : '#888', 
          marginTop: 32 
        }}>
          No products found
        </Text>
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={item => item.id?.toString()}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={renderProduct}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}; 