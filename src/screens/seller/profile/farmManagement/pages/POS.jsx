import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import {
  Layout,
  Text,
  Button,
  Spinner,
  Card,
  Input,
  Divider,
  Select,
  IndexPath,
  SelectItem,
} from '@ui-kitten/components';

import { useTheme } from '../../../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { axiosSellerClient } from '../../../../../utils/axiosClient';
import { ThemedIcon } from '../../../../../components/Icon';
import { MainScreensHeader } from '../../../../../components/buyer';

export const POS = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'customers', 'cart'
  
  // Modals
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Customer form
  const [customerForm, setCustomerForm] = useState({
    f_name: '',
    l_name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    zip_code: '',
    address: '',
  });
  
  // Order details
  const [orderDetails, setOrderDetails] = useState({
    extra_discount: 0,
    extra_discount_type: 'amount',
    coupon_code: '',
    coupon_discount_amount: 0,
    payment_method: 'cash',
  });

  useEffect(() => {
    fetchCategories();
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCategory || searchQuery) {
      fetchProducts();
    }
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await axiosSellerClient.get('/pos/get-categories');
      // console.log("categories", response.data);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axiosSellerClient.get('/pos/customers');
      // console.log("customers", response.data);
      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const params = {
        limit: 50,
        offset: 0,
        category_id: selectedCategory?.id ? JSON.stringify([selectedCategory.id]) : 0,
        name: searchQuery || '',
      };
      const response = await axiosSellerClient.get('/pos/product-list', { params });
      // console.log("products", response.data);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Show user-friendly error message
      if (error.response?.status === 500) {
        // console.log('Server error occurred while fetching products');
      }
    } finally {
      setProductsLoading(false);
    }
  };

  const searchProductByBarcode = async (code) => {
    try {
      const response = await axiosSellerClient.get('/pos/products', {
        params: { code }
      });
      // console.log("barcode product", response.data);
      if (response.data && response.data.id) {
        addToCart(response.data);
        setBarcodeInput('');
      } else {
        Alert.alert('Product Not Found', 'No product found with this barcode');
      }
    } catch (error) {
      console.error('Error searching product by barcode:', error);
      Alert.alert('Error', 'Failed to search product');
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(prev => prev.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart(prev => [...prev, {
        id: product.id,
        name: product.name,
        price: product.unit_price,
        quantity: 1,
        discount: 0,
        variant: null,
        variation: [],
        images: product.images,
        current_stock: product.current_stock,
      }]);
    }
  };

  const updateCartItem = (productId, field, value) => {
    setCart(prev => prev.map(item => 
      item.id === productId 
        ? { ...item, [field]: value }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const createCustomer = async () => {
    try {
      const response = await axiosSellerClient.post('/pos/customer-store', customerForm);
      // console.log("customer created", response.data);
      Alert.alert('Success', 'Customer created successfully');
      setShowCustomerModal(false);
      setCustomerForm({
        f_name: '',
        l_name: '',
        email: '',
        phone: '',
        country: '',
        city: '',
        zip_code: '',
        address: '',
      });
      fetchCustomers();
    } catch (error) {
      console.error('Error creating customer:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create customer');
    }
  };

  const placeOrder = async () => {
    if (!selectedCustomer) {
      Alert.alert('Error', 'Please select a customer');
      return;
    }
    if (cart.length === 0) {
      Alert.alert('Error', 'Cart is empty');
      return;
    }

    try {
      const orderData = {
        customer_id: selectedCustomer.id,
        cart: cart,
        extra_discount: orderDetails.extra_discount,
        extra_discount_type: orderDetails.extra_discount_type,
        coupon_discount_amount: orderDetails.coupon_discount_amount,
        coupon_code: orderDetails.coupon_code,
        order_amount: calculateTotal(),
        payment_method: orderDetails.payment_method,
      };

      const response = await axiosSellerClient.post('/pos/place-order', orderData);
      // console.log("order placed", response.data);
      Alert.alert('Success', `Order placed successfully! Order ID: ${response.data.order_id}`);
      
      // Clear cart and reset
      setCart([]);
      setSelectedCustomer(null);
      setOrderDetails({
        extra_discount: 0,
        extra_discount_type: 'amount',
        coupon_code: '',
        coupon_discount_amount: 0,
        payment_method: 'cash',
      });
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to place order');
    }
  };

  const getInvoice = async (orderId) => {
    try {
      const response = await axiosSellerClient.get('/pos/get-invoice', {
        params: { id: orderId }
      });
      // console.log("invoice", response.data);
      setSelectedInvoice(response.data);
      setShowInvoiceModal(true);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      Alert.alert('Error', 'Failed to fetch invoice');
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    const itemDiscounts = cart.reduce((total, item) => total + (item.discount * item.quantity), 0);
    const extraDiscount = orderDetails.extra_discount_type === 'percent' 
      ? (calculateSubtotal() * orderDetails.extra_discount / 100)
      : orderDetails.extra_discount;
    return itemDiscounts + extraDiscount + orderDetails.coupon_discount_amount;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const getProductImageUrl = (imageName) => {
    if (!imageName) return null;
    return `https://petbookers.com.pk/storage/app/public/product/${imageName}`;
  };

  if (loading) {
    return (
      <Layout style={styles.loadingContainer}>
        <Spinner size='large' />
      </Layout>
    );
  }

  return (
    <Layout style={[styles.container, { 
      backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']
    }]}>
      
      
      <View style={styles.mainLayout}>
        {/* Main Content Area */}
        <View style={styles.contentArea}>
          {activeTab === 'products' && (
            <View style={styles.tabContent}>
              {/* Search and Barcode */}
              <View style={styles.searchSection}>
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                />
                <Input
                  placeholder="Scan barcode..."
                  value={barcodeInput}
                  onChangeText={setBarcodeInput}
                  onSubmitEditing={() => searchProductByBarcode(barcodeInput)}
                  style={styles.barcodeInput}
                />
              </View>

              {/* Categories */}
              <View style={styles.categoriesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                  <TouchableOpacity
                    onPress={() => setSelectedCategory(null)}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: !selectedCategory 
                          ? theme['color-shadcn-primary'] 
                          : (isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'])
                      }
                    ]}
                  >
                    <Text style={[styles.categoryText, { 
                      color: !selectedCategory ? 'white' : (isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'])
                    }]}>
                      All
                    </Text>
                  </TouchableOpacity>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => setSelectedCategory(category)}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: selectedCategory?.id === category.id 
                            ? theme['color-shadcn-primary'] 
                            : (isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'])
                        }
                      ]}
                    >
                      <Text style={[styles.categoryText, { 
                        color: selectedCategory?.id === category.id ? 'white' : (isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'])
                      }]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Products Grid */}
              <ScrollView style={styles.productsGrid} showsVerticalScrollIndicator={false}>
                {productsLoading ? (
                  <View style={styles.loadingContainer}>
                    <Spinner size='large' />
                    <Text style={[styles.loadingText, { 
                      color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                    }]}>
                      Loading products...
                    </Text>
                  </View>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <TouchableOpacity
                      key={product.id}
                      onPress={() => addToCart(product)}
                      style={[styles.productCard, { 
                        backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)'
                      }]}
                    >
                      <Image
                        source={{ uri: getProductImageUrl(product.thumbnail) }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                      <View style={styles.productInfo}>
                        <Text style={[styles.productName, { 
                          color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                        }]} numberOfLines={2}>
                          {product.name}
                        </Text>
                        <Text style={[styles.productPrice, { 
                          color: theme['color-shadcn-primary']
                        }]}>
                          ${product.unit_price}
                        </Text>
                        <Text style={[styles.productStock, { 
                          color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                        }]}>
                          Stock: {product.current_stock}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { 
                      color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                    }]}>
                      No products found
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}

          {activeTab === 'customers' && (
            <View style={styles.tabContent}>
              <View style={styles.customerSection}>
                <Text style={[styles.sectionTitle, { 
                  color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                }]}>Select Customer</Text>
                <Select
                  style={styles.customerSelect}
                  selectedIndex={selectedCustomer ? new IndexPath(customers.findIndex(c => c.id === selectedCustomer.id)) : null}
                  onSelect={(index) => {
                    setSelectedCustomer(customers[index.row]);
                  }}
                  value={selectedCustomer ? `${selectedCustomer.f_name} ${selectedCustomer.l_name}` : 'Select Customer'}
                >
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} title={`${customer.f_name} ${customer.l_name}`} />
                  ))}
                </Select>
                <Button
                  size="small"
                  appearance="outline"
                  onPress={() => setShowCustomerModal(true)}
                  style={styles.addCustomerButton}
                >
                  Add New Customer
                </Button>
              </View>

              <ScrollView style={styles.customersList} showsVerticalScrollIndicator={false}>
                {customers.map((customer) => (
                  <TouchableOpacity
                    key={customer.id}
                    onPress={() => setSelectedCustomer(customer)}
                    style={[
                      styles.customerCard,
                      {
                        backgroundColor: selectedCustomer?.id === customer.id 
                          ? theme['color-shadcn-primary'] 
                          : (isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)')
                      }
                    ]}
                  >
                    <View style={styles.customerInfo}>
                      <Text style={[styles.customerName, { 
                        color: selectedCustomer?.id === customer.id ? 'white' : (isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'])
                      }]}>
                        {customer.f_name} {customer.l_name}
                      </Text>
                      <Text style={[styles.customerPhone, { 
                        color: selectedCustomer?.id === customer.id ? 'rgba(255,255,255,0.8)' : (isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'])
                      }]}>
                        {customer.phone}
                      </Text>
                      <Text style={[styles.customerEmail, { 
                        color: selectedCustomer?.id === customer.id ? 'rgba(255,255,255,0.8)' : (isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'])
                      }]}>
                        {customer.email}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {activeTab === 'cart' && (
            <View style={styles.tabContent}>
              <View style={styles.cartSection}>
                <Text style={[styles.sectionTitle, { 
                  color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                }]}>Cart ({cart.length})</Text>
                
                <ScrollView style={styles.cartItems} showsVerticalScrollIndicator={false}>
                  {cart.map((item) => (
                    <Card key={item.id} style={[styles.cartItem, { 
                      backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)'
                    }]}>
                      <View style={styles.cartItemHeader}>
                        <Image
                          source={{ uri: getProductImageUrl(item.images?.[0]) }}
                          style={styles.cartItemImage}
                          resizeMode="cover"
                        />
                        <View style={styles.cartItemInfo}>
                          <Text style={[styles.cartItemName, { 
                            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                          }]} numberOfLines={2}>
                            {item.name}
                          </Text>
                          <Text style={[styles.cartItemPrice, { 
                            color: theme['color-shadcn-primary']
                          }]}>
                            ${item.price}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => removeFromCart(item.id)}
                          style={styles.removeButton}
                        >
                          <ThemedIcon name="close-outline" size={20} />
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.cartItemControls}>
                        <TouchableOpacity
                          onPress={() => updateCartItem(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                          style={styles.quantityButton}
                        >
                          <ThemedIcon name="minus-outline" size={16} />
                        </TouchableOpacity>
                        <Text style={[styles.quantityText, { 
                          color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                        }]}>
                          {item.quantity}
                        </Text>
                        <TouchableOpacity
                          onPress={() => updateCartItem(item.id, 'quantity', item.quantity + 1)}
                          style={styles.quantityButton}
                        >
                          <ThemedIcon name="plus-outline" size={16} />
                        </TouchableOpacity>
                        
                        <Input
                          placeholder="Discount"
                          value={item.discount.toString()}
                          onChangeText={(text) => updateCartItem(item.id, 'discount', parseFloat(text) || 0)}
                          keyboardType="numeric"
                          style={styles.discountInput}
                        />
                      </View>
                    </Card>
                  ))}
                </ScrollView>
              </View>

              {/* Order Summary */}
              <View style={styles.summarySection}>
                <Text style={[styles.sectionTitle, { 
                  color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                }]}>Order Summary</Text>
                
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { 
                    color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                  }]}>Subtotal:</Text>
                  <Text style={[styles.summaryValue, { 
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                  }]}>${calculateSubtotal().toFixed(2)}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { 
                    color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                  }]}>Discount:</Text>
                  <Text style={[styles.summaryValue, { 
                    color: theme['color-danger-500']
                  }]}>-${calculateDiscount().toFixed(2)}</Text>
                </View>
                
                <Divider style={{ marginVertical: 8, backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
                
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { 
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'],
                    fontWeight: 'bold'
                  }]}>Total:</Text>
                  <Text style={[styles.summaryValue, { 
                    color: theme['color-shadcn-primary'],
                    fontWeight: 'bold',
                    fontSize: 18
                  }]}>${calculateTotal().toFixed(2)}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Button
                  onPress={placeOrder}
                  disabled={cart.length === 0 || !selectedCustomer}
                  style={styles.placeOrderButton}
                >
                  Place Order
                </Button>
              </View>
            </View>
          )}
        </View>

        {/* Bottom Navigation */}
        <View style={[styles.bottomNav, { 
          backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
        }]}>
          <TouchableOpacity
            style={[styles.navTab, activeTab === 'products' && styles.activeNavTab]}
            onPress={() => setActiveTab('products')}
          >
            <ThemedIcon 
              name="cube-outline" 
              size={24} 
              color={activeTab === 'products' ? theme['color-shadcn-primary'] : (isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'])}
            />
            <Text style={[styles.navText, { 
              color: activeTab === 'products' ? theme['color-shadcn-primary'] : (isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'])
            }]}>
              Products
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTab, activeTab === 'customers' && styles.activeNavTab]}
            onPress={() => setActiveTab('customers')}
          >
            <ThemedIcon 
              name="people-outline" 
              size={24} 
              color={activeTab === 'customers' ? theme['color-shadcn-primary'] : (isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'])}
            />
            <Text style={[styles.navText, { 
              color: activeTab === 'customers' ? theme['color-shadcn-primary'] : (isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'])
            }]}>
              Customers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTab, activeTab === 'cart' && styles.activeNavTab]}
            onPress={() => setActiveTab('cart')}
          >
            <ThemedIcon 
              name="shopping-cart-outline" 
              size={24} 
              color={activeTab === 'cart' ? theme['color-shadcn-primary'] : (isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'])}
            />
            <Text style={[styles.navText, { 
              color: activeTab === 'cart' ? theme['color-shadcn-primary'] : (isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'])
            }]}>
              Cart ({cart.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Customer Modal */}
      <Modal
        visible={showCustomerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCustomerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>Add New Customer</Text>
              <TouchableOpacity onPress={() => setShowCustomerModal(false)}>
                <ThemedIcon name="close-outline" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Input
                label="First Name"
                value={customerForm.f_name}
                onChangeText={(text) => setCustomerForm(prev => ({ ...prev, f_name: text }))}
                style={styles.input}
              />
              <Input
                label="Last Name"
                value={customerForm.l_name}
                onChangeText={(text) => setCustomerForm(prev => ({ ...prev, l_name: text }))}
                style={styles.input}
              />
              <Input
                label="Email"
                value={customerForm.email}
                onChangeText={(text) => setCustomerForm(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                style={styles.input}
              />
              <Input
                label="Phone"
                value={customerForm.phone}
                onChangeText={(text) => setCustomerForm(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
                style={styles.input}
              />
              <Input
                label="Country"
                value={customerForm.country}
                onChangeText={(text) => setCustomerForm(prev => ({ ...prev, country: text }))}
                style={styles.input}
              />
              <Input
                label="City"
                value={customerForm.city}
                onChangeText={(text) => setCustomerForm(prev => ({ ...prev, city: text }))}
                style={styles.input}
              />
              <Input
                label="Zip Code"
                value={customerForm.zip_code}
                onChangeText={(text) => setCustomerForm(prev => ({ ...prev, zip_code: text }))}
                style={styles.input}
              />
              <Input
                label="Address"
                value={customerForm.address}
                onChangeText={(text) => setCustomerForm(prev => ({ ...prev, address: text }))}
                multiline
                style={styles.input}
              />

              <View style={styles.buttonRow}>
                <Button
                  appearance="outline"
                  onPress={() => setShowCustomerModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  onPress={createCustomer}
                  style={styles.submitButton}
                >
                  Create Customer
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  mainLayout: {
    flex: 1,
    flexDirection: 'column',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 8,
  },
  tabContent: {
    flex: 1,
    paddingVertical: 8,
  },
  searchSection: {
    marginBottom: 12, // Reduced margin for mobile
  },
  searchInput: {
    marginBottom: 6, // Reduced margin for mobile
  },
  barcodeInput: {
    marginBottom: 6, // Reduced margin for mobile
  },
  categoriesContainer: {
    height: 50, // Fixed height for category section
    marginBottom: 12, // Reduced margin for mobile
  },
  categoriesScroll: {
    flex: 1,
  },
  categoryChip: {
    paddingHorizontal: 12, // Reduced padding for mobile
    paddingVertical: 8, // Slightly increased for better touch
    borderRadius: 16, // Reduced border radius for mobile
    marginRight: 6, // Reduced margin for mobile
    height: 36, // Fixed height for consistency
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12, // Reduced font size for mobile
    fontWeight: '500',
  },
  productsGrid: {
    flex: 1,
  },
  productCard: {
    marginBottom: 8, // Reduced margin for mobile
    borderRadius: 6, // Reduced border radius for mobile
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 80, // Reduced height for mobile
  },
  productInfo: {
    padding: 8, // Reduced padding for mobile
  },
  productName: {
    fontSize: 12, // Reduced font size for mobile
    fontWeight: '500',
    marginBottom: 2, // Reduced margin for mobile
  },
  productPrice: {
    fontSize: 14, // Reduced font size for mobile
    fontWeight: 'bold',
    marginBottom: 2, // Reduced margin for mobile
  },
  productStock: {
    fontSize: 10, // Reduced font size for mobile
  },
  customerSection: {
    marginBottom: 12, // Reduced margin for mobile
  },
  sectionTitle: {
    fontSize: 14, // Reduced font size for mobile
    fontWeight: 'bold',
    marginBottom: 6, // Reduced margin for mobile
  },
  customerSelect: {
    marginBottom: 6, // Reduced margin for mobile
  },
  addCustomerButton: {
    marginTop: 6, // Reduced margin for mobile
  },
  cartSection: {
    flex: 1,
    marginBottom: 12, // Reduced margin for mobile
  },
  cartItems: {
    flex: 1,
  },
  cartItem: {
    marginBottom: 6, // Reduced margin for mobile
    borderRadius: 6, // Reduced border radius for mobile
  },
  cartItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, // Reduced margin for mobile
  },
  cartItemImage: {
    width: 32, // Reduced size for mobile
    height: 32, // Reduced size for mobile
    borderRadius: 4,
    marginRight: 6, // Reduced margin for mobile
  },
  cartItemInfo: {
    // flex: 1,
    width: '80%',
  },
  cartItemName: {
    fontSize: 12, // Reduced font size for mobile
    fontWeight: '500',
    marginBottom: 2,
  },
  cartItemPrice: {
    fontSize: 12, // Reduced font size for mobile
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 3, // Reduced padding for mobile
  },
  cartItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityButton: {
    padding: 6, // Reduced padding for mobile
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  quantityText: {
    fontSize: 14, // Reduced font size for mobile
    fontWeight: 'bold',
    marginHorizontal: 8, // Reduced margin for mobile
  },
  discountInput: {
    flex: 1,
    marginLeft: 6, // Reduced margin for mobile
  },
  summarySection: {
    marginBottom: 12, // Reduced margin for mobile
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3, // Reduced margin for mobile
  },
  summaryLabel: {
    fontSize: 12, // Reduced font size for mobile
  },
  summaryValue: {
    fontSize: 12, // Reduced font size for mobile
    fontWeight: '500',
  },
  actionButtons: {
    marginBottom: 12, // Reduced margin for mobile
  },
  placeOrderButton: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '95%', // Increased width for mobile
    maxHeight: '85%', // Increased height for mobile
    borderRadius: 8, // Reduced border radius for mobile
    padding: 12, // Reduced padding for mobile
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // Reduced margin for mobile
  },
  modalTitle: {
    fontSize: 18, // Reduced font size for mobile
    fontWeight: 'bold',
  },
  modalScroll: {
    // flex: 1,
    height: '100%',
    width: '100%',
  },
  input: {
    marginBottom: 12, // Reduced margin for mobile
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12, // Reduced margin for mobile
  },
  cancelButton: {
    flex: 1,
    marginRight: 6, // Reduced margin for mobile
  },
  submitButton: {
    flex: 1,
    marginLeft: 6, // Reduced margin for mobile
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeNavTab: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  customersList: {
    flex: 1,
    marginTop: 12,
  },
  customerCard: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    marginBottom: 2,
  },
  customerEmail: {
    fontSize: 12,
  },
});

export default POS;