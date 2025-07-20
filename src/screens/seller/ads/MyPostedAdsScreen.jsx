import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Button } from '@ui-kitten/components';
import { authSellerClient, handleAuthError, setAuthModalHandlers } from '../../../utils/authAxiosClient';
import { useSelector } from 'react-redux';
import { selectIsSellerAuthenticated, selectIsBuyerAuthenticated } from '../../../store/user';
import { useTheme } from '../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { AppScreens } from '../../../navigators/AppNavigator';

const MyPostedAdsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSellerAuthModal, setShowSellerAuthModal] = useState(false);
  
  // Get authentication states
  const isSellerAuthenticated = useSelector(selectIsSellerAuthenticated);
  const isBuyerAuthenticated = useSelector(selectIsBuyerAuthenticated);

  // Set up auth modal handlers
  useEffect(() => {
    setAuthModalHandlers({
      showSellerAuthModal: () => setShowSellerAuthModal(true),
    });
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await authSellerClient.get(`products/list`);
      console.log('Seller Products:', response.data);
      setProducts(response.data || []);
      
      const checking = await authSellerClient.get(`products/details/49`);
      console.log('Product details check:', checking.data);
    } catch (error) {
      console.error('Error loading products:', error);
      handleAuthError(error, (err) => {
        // Don't show error toast for auth errors, they're handled by handleAuthError
        if (err.type !== 'SELLER_NOT_AUTHENTICATED') {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load products'
          });
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', {
      productId: product.id,
      product: product
    });
  };

  const handleAddProduct = () => {
    if (!isSellerAuthenticated) {
      if (showSellerAuthModal) {
        setShowSellerAuthModal(true);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Authentication Required',
          text2: 'Please sign in as a seller to add products'
        });
      }
      return;
    }
    navigation.navigate(AppScreens.SELLER_ADD_PRODUCT);
  };

  // Check authentication on component mount
  useEffect(() => {
    if (isSellerAuthenticated) {
      loadProducts();
    } else {
      // Show different message based on auth state
      if (isBuyerAuthenticated) {
        Alert.alert(
          'Seller Authentication Required',
          'You are currently signed in as a buyer. To manage your products, please also sign in as a seller.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign in as Seller', onPress: () => {
              // For now, navigate to login with seller mode
              navigation.navigate('Login', { isItSeller: true });
            }}
          ]
        );
      } else {
        Alert.alert(
          'Authentication Required',
          'Please sign in as a seller to view your posted ads.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign in as Seller', onPress: () => {
              navigation.navigate('Login', { isItSeller: true });
            }}
          ]
        );
      }
    }
  }, [isSellerAuthenticated, isBuyerAuthenticated]);

  const handleAuthSuccess = () => {
    setShowSellerAuthModal(false);
    // Load data after successful authentication
    loadProducts();
  };

  if (!isSellerAuthenticated) {
    return (
      <View style={[styles.authContainer, { backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }]}>
        <Text style={[styles.authMessage, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
          {isBuyerAuthenticated 
            ? 'Please sign in as a seller to manage your products'
            : 'Please sign in as a seller to view your posted ads'
          }
        </Text>
        <Button
          onPress={() => navigation.navigate('Login', { isItSeller: true })}
          style={styles.authButton}
        >
          Sign in as Seller
        </Button>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }]}>
        <ActivityIndicator size="large" color={theme['color-primary-500']} />
        <Text style={[styles.loadingText, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
          Loading your products...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
          My Posted Ads ({products.length})
        </Text>
        <Button
          onPress={handleAddProduct}
          style={styles.addButton}
          size="small"
        >
          Add Product
        </Button>
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>
            You haven't posted any ads yet
          </Text>
          <Button
            onPress={handleAddProduct}
            style={styles.addFirstButton}
          >
            Add Your First Product
          </Button>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 18 }}>
              <TouchableOpacity
                style={[
                  {
              backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
                    borderRadius: 14,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                  },
                ]}
                onPress={() => handleProductPress(item)}
                activeOpacity={0.92}
              >
                {/* Avatar/Image */}
                <View style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'], marginRight: 14, justifyContent: 'center', alignItems: 'center' }}>
                  {/* Placeholder icon */}
                </View>
                {/* Info */}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], fontSize: 13, fontWeight: 'bold', marginBottom: 2 }}>Seller</Text>
                  <Text style={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'], fontSize: 16, fontWeight: 'bold', marginBottom: 2 }} numberOfLines={1}>{item.name}</Text>
                  <Text style={{ color: theme['color-shadcn-primary'], fontSize: 15, fontWeight: 'bold', marginBottom: 2 }}>Rs {item.unit_price}</Text>
                  {/* Date, views, messages, featured badge */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                    <Text style={{ color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], fontSize: 12, marginRight: 12 }}>
                      Created on {item.created_at ? new Date(item.created_at).toLocaleDateString() : '01/05/2025'}
                    </Text>
                    <Text style={{ color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], fontSize: 12, marginRight: 8 }}>0 Views</Text>
                    <Text style={{ color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], fontSize: 12, marginRight: 8 }}>0 Messages</Text>
                    <View style={{ backgroundColor: theme['color-warning-default'], borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 4 }}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Featured</Text>
                    </View>
                  </View>
                </View>
                {/* Ellipsis icon */}
                <View style={{ marginLeft: 8, marginTop: 2 }}>
                  <Text style={{ color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], fontSize: 22 }}>⋮</Text>
                </View>
              </TouchableOpacity>
              {/* Try Featured Ads Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: theme['color-shadcn-primary'],
                  borderRadius: 8,
                  marginTop: 8,
                  paddingVertical: 10,
                  alignItems: 'center',
                }}
                onPress={() => Toast.show({ type: 'info', text1: 'Feature Coming Soon', text2: 'Try Featured Ads functionality coming soon!' })}
              >
                <Text style={{ color: theme['color-shadcn-primary-foreground'], fontWeight: 'bold', fontSize: 16 }}>{t('myAds.tryFeatured')}</Text>
              </TouchableOpacity>

          
              
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
        )}
            </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  addButton: {
    minWidth: 100,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  authMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    minWidth: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  addFirstButton: {
    minWidth: 200,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 14,
  },
  productActions: {
    alignItems: 'flex-end',
  },
  productStatus: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default MyPostedAdsScreen;
