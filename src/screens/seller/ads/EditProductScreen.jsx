import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Layout, Text, Button, Input, Spinner } from '@ui-kitten/components';
import { useTheme } from '../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { axiosSellerClient } from '../../../utils/axiosClient';
import { MainScreensHeader } from '../../../components/buyer';

export const EditProductScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const { isDark, theme } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState({
    name: '',
    details: '',
    unit_price: '',
    current_stock: '',
    minimum_order_qty: '',
    unit: '',
  });

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosSellerClient.get(`products/details/${productId}`);
      if (response.data) {
        setProduct({
          name: response.data.name || '',
          details: response.data.details || '',
          unit_price: response.data.unit_price?.toString() || '',
          current_stock: response.data.current_stock?.toString() || '',
          minimum_order_qty: response.data.minimum_order_qty?.toString() || '',
          unit: response.data.unit || '',
        });
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedProduct = {
        ...product,
        unit_price: parseFloat(product.unit_price),
        current_stock: parseInt(product.current_stock),
        minimum_order_qty: parseInt(product.minimum_order_qty),
      };

      await axiosSellerClient.put(`products/${productId}`, updatedProduct);
      Alert.alert('Success', 'Product updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', 'Failed to update product');
    } finally {
      setSaving(false);
    }
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

  return (
    <Layout style={[styles.container, { backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }]}>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.formContainer}>
          <Input
            label={t('editProduct.name')}
            value={product.name}
            onChangeText={(text) => setProduct({ ...product, name: text })}
            style={styles.input}
            textStyle={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}
          />

          <Input
            label={t('editProduct.details')}
            value={product.details}
            onChangeText={(text) => setProduct({ ...product, details: text })}
            multiline
            textStyle={{ height: 100, textAlignVertical: 'top', color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}
            style={styles.input}
          />

          <Input
            label={t('editProduct.price')}
            value={product.unit_price}
            onChangeText={(text) => setProduct({ ...product, unit_price: text })}
            keyboardType="numeric"
            style={styles.input}
            textStyle={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}
          />

          <Input
            label={t('editProduct.stock')}
            value={product.current_stock}
            onChangeText={(text) => setProduct({ ...product, current_stock: text })}
            keyboardType="numeric"
            style={styles.input}
            textStyle={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}
          />

          <Input
            label={t('editProduct.minOrder')}
            value={product.minimum_order_qty}
            onChangeText={(text) => setProduct({ ...product, minimum_order_qty: text })}
            keyboardType="numeric"
            style={styles.input}
            textStyle={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}
          />

          <Input
            label={t('editProduct.unit')}
            value={product.unit}
            onChangeText={(text) => setProduct({ ...product, unit: text })}
            style={styles.input}
            textStyle={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}
          />

          <Button
            style={[styles.saveButton, { backgroundColor: theme['color-shadcn-primary'] }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? t('editProduct.saving') : t('editProduct.save')}
          </Button>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  formContainer: {
    gap: 16,
  },
  input: {
    marginBottom: 8,
  },
  saveButton: {
    marginTop: 16,
  },
}); 