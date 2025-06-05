import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Layout, Text, Button, Icon, Spinner } from '@ui-kitten/components';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { axiosSellerClient } from '../../utils/axiosClient';
import { MainScreensHeader } from '../../components/buyer';

const { width: windowWidth } = Dimensions.get('screen');

export const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const { isDark, theme } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);

  console.log('productId in ProductDetailScreen', productId);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosSellerClient.get(`products/details/${productId}`);
      if (response.data) {
        setProduct(response.data);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditProduct', { productId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosSellerClient.delete(`products/delete/${productId}`);
              Alert.alert('Success', 'Product deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <Layout style={[styles.container, { backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }]}>
        <View style={styles.loadingContainer}>
          <Spinner size='large' />
        </View>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout style={[styles.container, { backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }]}>
        <View style={styles.errorContainer}>
          <Text>Product not found</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout style={[styles.container, { backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }]}>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Product Images */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageScroll}
        >
          {product.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: `https://your-api-base-url/${image}` }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={[styles.productName, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
            {product.name}
          </Text>
          <Text style={[styles.price, { color: isDark ? theme['color-shadcn-primary'] : theme['color-primary-500'] }]}>
            Rs {product.unit_price}
          </Text>
          
          {/* Status Badge */}
          <View style={[
            styles.statusBadge,
            { backgroundColor: product.status === 1 ? theme['color-shadcn-primary'] : theme['color-shadcn-muted'] }
          ]}>
            <Text style={[styles.statusText, { color: theme['color-shadcn-primary-foreground'] }]}>
              {product.status === 1 ? t('productDetails.status.active') : t('productDetails.status.inactive')}
            </Text>
          </View>

          {/* Details Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
              {t('productDetails.details')}
            </Text>
            <Text style={[styles.detailsText, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>
              {product.details}
            </Text>
          </View>

          {/* Specifications */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
              {t('productDetails.specifications')}
            </Text>
            <View style={styles.specsContainer}>
              <SpecItem
                label={t('productDetails.stock')}
                value={product.current_stock}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label={t('productDetails.unit')}
                value={product.unit}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label={t('productDetails.minOrder')}
                value={product.minimum_order_qty}
                isDark={isDark}
                theme={theme}
              />
              <SpecItem
                label={t('productDetails.createdAt')}
                value={new Date(product.created_at).toLocaleDateString()}
                isDark={isDark}
                theme={theme}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              style={[styles.editButton, { backgroundColor: theme['color-shadcn-primary'] }]}
              onPress={handleEdit}
            >
              {t('productDetails.edit')}
            </Button>
            <Button
              style={[styles.deleteButton, { backgroundColor: theme['color-shadcn-destructive'] }]}
              onPress={handleDelete}
            >
              {t('productDetails.delete')}
            </Button>
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
};

const SpecItem = ({ label, value, isDark, theme }) => (
  <View style={styles.specItem}>
    <Text style={[styles.specLabel, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>
      {label}
    </Text>
    <Text style={[styles.specValue, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  scrollContent: {
    paddingBottom: 32,
  },
  imageScroll: {
    maxHeight: 300,
  },
  productImage: {
    width: windowWidth,
    height: 300,
  },
  infoContainer: {
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailsText: {
    fontSize: 16,
    lineHeight: 24,
  },
  specsContainer: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 16,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  specLabel: {
    fontSize: 14,
  },
  specValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  editButton: {
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    flex: 1,
    marginLeft: 8,
  },
}); 