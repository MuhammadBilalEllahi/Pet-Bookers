import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Layout,
  Text,
  Button,
  Spinner,
} from '@ui-kitten/components';

import { useTheme } from '../../../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { axiosSellerClient } from '../../../../../utils/axiosClient';
import { ThemedIcon } from '../../../../../components/Icon';

export default function OrdersPage({ navigation, route }) {
  const deliveryMan = route?.params?.deliveryMan;
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (deliveryMan) {
      fetchOrders();
    }
  }, [deliveryMan]);

  const fetchOrders = async (page = 1) => {
    if (!deliveryMan) return;
    
    try {
      setLoading(true);
      const response = await axiosSellerClient.get(`/delivery-man/order-list/${deliveryMan.id}`, {
        params: {
          limit: 10,
          offset: (page - 1) * 10,
        }
      });
      
      if (page === 1) {
        setOrders(response.data.orders || []);
      } else {
        setOrders(prev => [...prev, ...(response.data.orders || [])]);
      }
      
      setHasMore(response.data.orders && response.data.orders.length === 10);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to fetch orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchOrders(1);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchOrders(currentPage + 1);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9500';
      case 'confirmed': return '#007aff';
      case 'processing': return '#5856d6';
      case 'out_for_delivery': return '#ff2d92';
      case 'delivered': return '#34c759';
      case 'canceled': return '#ff3b30';
      case 'returned': return '#af52de';
      case 'failed': return '#ff3b30';
      default: return '#8e8e93';
    }
  };

  const getStatusText = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!deliveryMan) return (
    <Layout style={styles.modalContent}>
      <Text>No delivery man selected.</Text>
    </Layout>
  );

  return (
    <Layout style={[styles.modalContent, { backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'] }]}> 
      <View style={styles.modalHeader}>
        <Button appearance="ghost" size="small" onPress={() => navigation.goBack()}>
          ← Back
        </Button>
        <Text style={[styles.modalTitle, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}> 
          Orders for {deliveryMan.f_name} {deliveryMan.l_name}
        </Text>
      </View>

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
            {orders.length > 0 ? (
              orders.map((order) => (
                <View key={order.id} style={styles.orderItem}>
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
                        {new Date(order.created_at).toLocaleDateString()}
                      </Text>
                      <Text style={[styles.orderAmount, { 
                        color: theme['color-shadcn-primary']
                      }]}>
                        ${order.order_amount}
                      </Text>
                    </View>
                    <View style={styles.orderStatus}>
                      <View style={[styles.statusBadge, { 
                        backgroundColor: getStatusColor(order.order_status) 
                      }]}>
                        <Text style={styles.statusText}>
                          {getStatusText(order.order_status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.orderDetails}>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { 
                        color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                      }]}>
                        Customer:
                      </Text>
                      <Text style={[styles.detailValue, { 
                        color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                      }]}>
                        {order.customer?.f_name} {order.customer?.l_name}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { 
                        color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                      }]}>
                        Phone:
                      </Text>
                      <Text style={[styles.detailValue, { 
                        color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                      }]}>
                        {order.customer?.phone}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { 
                        color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                      }]}>
                        Address:
                      </Text>
                      <Text style={[styles.detailValue, { 
                        color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                      }]}>
                        {order.shipping_address?.address}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { 
                        color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                      }]}>
                        Delivery Charge:
                      </Text>
                      <Text style={[styles.detailValue, { 
                        color: theme['color-shadcn-primary']
                      }]}>
                        ${order.deliveryman_charge}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <ThemedIcon name="package-outline" iconStyle={{ width: 48, height: 48 }} />
                <Text style={[styles.emptyText, { 
                  color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                }]}>
                  No orders found
                </Text>
                <Text style={[styles.emptySubtext, { 
                  color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                }]}>
                  This delivery man hasn't been assigned any orders yet
                </Text>
              </View>
            )}
            
            {loading && orders.length > 0 && (
              <View style={styles.loadingMore}>
                <Spinner size='small' />
              </View>
            )}
          </ScrollView>

          <View style={styles.buttonRow}>
            <Button
              appearance="outline"
              onPress={() => navigation.goBack()}
              style={styles.closeButton}
            >
              Close
            </Button>
          </View>
        </Layout>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    height: '100%',
    width: '100%',
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
    flex: 1,
  },
  ordersList: {
    flex: 1,
    marginBottom: 16,
  },
  orderItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 12,
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
  orderAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  orderStatus: {
    alignItems: 'flex-end',
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
  orderDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 80,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 12,
    flex: 1,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingMore: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  closeButton: {
    minWidth: 100,
  },
}); 