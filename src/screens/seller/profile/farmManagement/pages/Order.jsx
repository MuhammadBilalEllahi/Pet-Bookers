import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  Image,
  RefreshControl,
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

export default function Order() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Modals
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Form states
  const [statusForm, setStatusForm] = useState({
    order_status: '',
  });
  
  const [deliveryForm, setDeliveryForm] = useState({
    delivery_man_id: '',
    delivery_service_name: '',
    third_party_delivery_tracking_id: '',
    delivery_type: 'self_delivery', // 'self_delivery' or 'third_party_delivery'
  });
  
  const [paymentForm, setPaymentForm] = useState({
    payment_status: '',
  });

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async (page = 1, append = false) => {
    try {
      if (page === 1) setLoading(true);
      
      const params = {
        limit: 20,
        offset: (page - 1) * 20,
        status: selectedStatus,
      };
      
      const response = await axiosSellerClient.get('/orders/list', { params });
      console.log("orders", response.data);
      
      const newOrders = response.data.orders || [];
      
      if (append) {
        setOrders(prev => [...prev, ...newOrders]);
      } else {
        setOrders(newOrders);
      }
      
      setHasMore(newOrders.length === 20);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to fetch orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await axiosSellerClient.get(`/orders/${orderId}`);
      console.log("order details", response.data);
      setOrderDetails(response.data || []);
    } catch (error) {
      console.error('Error fetching order details:', error);
      Alert.alert('Error', 'Failed to fetch order details');
    }
  };

  const updateOrderStatus = async () => {
    try {
      const response = await axiosSellerClient.put(`/orders/order-detail-status/${selectedOrder.id}`, {
        order_status: statusForm.order_status,
      });
      console.log("status updated", response.data);
      
      if (response.data.success) {
        Alert.alert('Success', response.data.message || 'Order status updated successfully');
        setShowStatusModal(false);
        fetchOrders(currentPage, false); // Refresh current page
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update order status');
    }
  };

  const assignDeliveryMan = async () => {
    try {
      const response = await axiosSellerClient.put('/orders/assign-delivery-man', {
        order_id: selectedOrder.id,
        delivery_man_id: deliveryForm.delivery_man_id,
      });
      console.log("delivery assigned", response.data);
      
      if (response.data.success) {
        Alert.alert('Success', response.data.message || 'Delivery man assigned successfully');
        setShowDeliveryModal(false);
        fetchOrders(currentPage, false);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to assign delivery man');
      }
    } catch (error) {
      console.error('Error assigning delivery man:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to assign delivery man');
    }
  };

  const assignThirdPartyDelivery = async () => {
    try {
      const response = await axiosSellerClient.post('/orders/assign-third-party-delivery', {
        order_id: selectedOrder.id,
        delivery_service_name: deliveryForm.delivery_service_name,
        third_party_delivery_tracking_id: deliveryForm.third_party_delivery_tracking_id,
      });
      console.log("third party delivery assigned", response.data);
      
      if (response.data.success) {
        Alert.alert('Success', response.data.message || 'Third party delivery assigned successfully');
        setShowDeliveryModal(false);
        fetchOrders(currentPage, false);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to assign third party delivery');
      }
    } catch (error) {
      console.error('Error assigning third party delivery:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to assign third party delivery');
    }
  };

  const updatePaymentStatus = async () => {
    try {
      const response = await axiosSellerClient.post('/orders/update-payment-status', {
        order_id: selectedOrder.id,
        payment_status: paymentForm.payment_status,
      });
      console.log("payment status updated", response.data);
      
      Alert.alert('Success', response.data.message || 'Payment status updated successfully');
      setShowPaymentModal(false);
      fetchOrders(currentPage, false);
    } catch (error) {
      console.error('Error updating payment status:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update payment status');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(1, false);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchOrders(currentPage + 1, true);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ff9500';
      case 'confirmed':
        return '#007aff';
      case 'processing':
        return '#5856d6';
      case 'out_for_delivery':
        return '#5856d6';
      case 'delivered':
        return '#34c759';
      case 'canceled':
        return '#ff3b30';
      case 'returned':
        return '#ff3b30';
      default:
        return '#8e8e93';
    }
  };

  const getPaymentStatusColor = (status) => {
    return status === 'paid' ? '#34c759' : '#ff3b30';
  };

  const getProductImageUrl = (imageName) => {
    if (!imageName) return null;
    return `https://petbookers.com.pk/storage/app/public/product/${imageName}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    fetchOrderDetails(order.id);
    setShowOrderDetailsModal(true);
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setStatusForm({ order_status: order.order_status });
    setShowStatusModal(true);
  };

  const openDeliveryModal = (order) => {
    setSelectedOrder(order);
    setDeliveryForm({
      delivery_man_id: '',
      delivery_service_name: '',
      third_party_delivery_tracking_id: '',
      delivery_type: 'self_delivery',
    });
    setShowDeliveryModal(true);
  };

  const openPaymentModal = (order) => {
    setSelectedOrder(order);
    setPaymentForm({ payment_status: order.payment_status });
    setShowPaymentModal(true);
  };

  if (loading && orders.length === 0) {
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { 
          color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
        }]}>
          Orders Management
        </Text>
        
        {/* Status Filter */}
        <Select
          style={styles.statusFilter}
          selectedIndex={new IndexPath(['all', 'pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'canceled', 'returned'].indexOf(selectedStatus))}
          onSelect={(index) => {
            const statuses = ['all', 'pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'canceled', 'returned'];
            setSelectedStatus(statuses[index.row]);
          }}
          value={selectedStatus === 'all' ? 'All Orders' : selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
        >
          <SelectItem title="All Orders" />
          <SelectItem title="Pending" />
          <SelectItem title="Confirmed" />
          <SelectItem title="Processing" />
          <SelectItem title="Out for Delivery" />
          <SelectItem title="Delivered" />
          <SelectItem title="Canceled" />
          <SelectItem title="Returned" />
        </Select>
      </View>

      {/* Orders List */}
      <ScrollView 
        style={styles.ordersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {orders.map((order) => (
          <Card key={order.id} style={[styles.orderCard, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)'
          }]}>
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={[styles.orderId, { 
                  color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                }]}>
                  Order #{order.id}
                </Text>
                <Text style={[styles.orderDate, { 
                  color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                }]}>
                  {formatDate(order.created_at)}
                </Text>
                <Text style={[styles.customerName, { 
                  color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                }]}>
                  {order.customer?.f_name} {order.customer?.l_name}
                </Text>
              </View>
              
              <View style={styles.orderStatus}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.order_status) }]}>
                  <Text style={styles.statusText}>
                    {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getPaymentStatusColor(order.payment_status), marginTop: 4 }]}>
                  <Text style={styles.statusText}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.orderAmount}>
              <Text style={[styles.amountLabel, { 
                color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
              }]}>
                Total Amount:
              </Text>
              <Text style={[styles.amountValue, { 
                color: theme['color-shadcn-primary']
              }]}>
                ${order.order_amount}
              </Text>
            </View>
            
            <View style={styles.orderActions}>
              <Button
                size="tiny"
                appearance="outline"
                onPress={() => openOrderDetails(order)}
                style={styles.actionButton}
              >
                Details
              </Button>
              <Button
                size="tiny"
                appearance="outline"
                onPress={() => openStatusModal(order)}
                style={styles.actionButton}
              >
                Update Status
              </Button>
              <Button
                size="tiny"
                appearance="outline"
                onPress={() => openDeliveryModal(order)}
                style={styles.actionButton}
              >
                Delivery
              </Button>
              <Button
                size="tiny"
                appearance="outline"
                onPress={() => openPaymentModal(order)}
                style={styles.actionButton}
              >
                Payment
              </Button>
            </View>
          </Card>
        ))}
        
        {hasMore && (
          <View style={styles.loadMoreContainer}>
            <Spinner size='small' />
            <Text style={[styles.loadMoreText, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              Loading more orders...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Order Details Modal */}
      <Modal
        visible={showOrderDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOrderDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>
                Order #{selectedOrder?.id} Details
              </Text>
              <TouchableOpacity onPress={() => setShowOrderDetailsModal(false)}>
                <ThemedIcon name="close-outline" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {orderDetails.map((item, index) => (
                <Card key={index} style={[styles.detailCard, { 
                  backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200']
                }]}>
                  <View style={styles.productDetail}>
                    <Image
                      source={{ uri: getProductImageUrl(item.product_details?.thumbnail) }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                    <View style={styles.productInfo}>
                      <Text style={[styles.productName, { 
                        color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                      }]}>
                        {item.product_details?.name}
                      </Text>
                      <Text style={[styles.productPrice, { 
                        color: theme['color-shadcn-primary']
                      }]}>
                        ${item.price} x {item.qty}
                      </Text>
                      <Text style={[styles.productTotal, { 
                        color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                      }]}>
                        Total: ${(item.price * item.qty).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>
                Update Order Status
              </Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <ThemedIcon name="close-outline" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Select
                style={styles.formSelect}
                selectedIndex={new IndexPath(['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'canceled', 'returned'].indexOf(statusForm.order_status))}
                onSelect={(index) => {
                  const statuses = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'canceled', 'returned'];
                  setStatusForm({ order_status: statuses[index.row] });
                }}
                value={statusForm.order_status.charAt(0).toUpperCase() + statusForm.order_status.slice(1)}
              >
                <SelectItem title="Pending" />
                <SelectItem title="Confirmed" />
                <SelectItem title="Processing" />
                <SelectItem title="Out for Delivery" />
                <SelectItem title="Delivered" />
                <SelectItem title="Canceled" />
                <SelectItem title="Returned" />
              </Select>

              <View style={styles.buttonRow}>
                <Button
                  appearance="outline"
                  onPress={() => setShowStatusModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  onPress={updateOrderStatus}
                  style={styles.submitButton}
                >
                  Update Status
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delivery Assignment Modal */}
      <Modal
        visible={showDeliveryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeliveryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>
                Assign Delivery
              </Text>
              <TouchableOpacity onPress={() => setShowDeliveryModal(false)}>
                <ThemedIcon name="close-outline" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Select
                style={styles.formSelect}
                selectedIndex={new IndexPath(['self_delivery', 'third_party_delivery'].indexOf(deliveryForm.delivery_type))}
                onSelect={(index) => {
                  const types = ['self_delivery', 'third_party_delivery'];
                  setDeliveryForm(prev => ({ ...prev, delivery_type: types[index.row] }));
                }}
                value={deliveryForm.delivery_type === 'self_delivery' ? 'Self Delivery' : 'Third Party Delivery'}
              >
                <SelectItem title="Self Delivery" />
                <SelectItem title="Third Party Delivery" />
              </Select>

              {deliveryForm.delivery_type === 'self_delivery' ? (
                <Input
                  label="Delivery Man ID"
                  value={deliveryForm.delivery_man_id}
                  onChangeText={(text) => setDeliveryForm(prev => ({ ...prev, delivery_man_id: text }))}
                  style={styles.formInput}
                  keyboardType="numeric"
                />
              ) : (
                <>
                  <Input
                    label="Delivery Service Name"
                    value={deliveryForm.delivery_service_name}
                    onChangeText={(text) => setDeliveryForm(prev => ({ ...prev, delivery_service_name: text }))}
                    style={styles.formInput}
                  />
                  <Input
                    label="Tracking ID"
                    value={deliveryForm.third_party_delivery_tracking_id}
                    onChangeText={(text) => setDeliveryForm(prev => ({ ...prev, third_party_delivery_tracking_id: text }))}
                    style={styles.formInput}
                  />
                </>
              )}

              <View style={styles.buttonRow}>
                <Button
                  appearance="outline"
                  onPress={() => setShowDeliveryModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  onPress={deliveryForm.delivery_type === 'self_delivery' ? assignDeliveryMan : assignThirdPartyDelivery}
                  style={styles.submitButton}
                >
                  Assign Delivery
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Status Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>
                Update Payment Status
              </Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <ThemedIcon name="close-outline" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Select
                style={styles.formSelect}
                selectedIndex={new IndexPath(['paid', 'unpaid'].indexOf(paymentForm.payment_status))}
                onSelect={(index) => {
                  const statuses = ['paid', 'unpaid'];
                  setPaymentForm({ payment_status: statuses[index.row] });
                }}
                value={paymentForm.payment_status.charAt(0).toUpperCase() + paymentForm.payment_status.slice(1)}
              >
                <SelectItem title="Paid" />
                <SelectItem title="Unpaid" />
              </Select>

              <View style={styles.buttonRow}>
                <Button
                  appearance="outline"
                  onPress={() => setShowPaymentModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  onPress={updatePaymentStatus}
                  style={styles.submitButton}
                >
                  Update Payment
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusFilter: {
    marginBottom: 8,
  },
  ordersList: {
    flex: 1,
    padding: 16,
  },
  orderCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderStatus: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 14,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 2,
  },
  loadMoreContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadMoreText: {
    marginTop: 8,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    height: '100%'  ,
    width: '80%'
  },
  modalScroll: {
    height: '100%',
    width: '80%'
  },
  detailCard: {
    marginBottom: 8,
    borderRadius: 8,
  },
  productDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 12,
    marginBottom: 2,
  },
  productTotal: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  formSelect: {
    marginBottom: 16,
  },
  formInput: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
