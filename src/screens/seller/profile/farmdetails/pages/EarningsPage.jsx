import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
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
import { getEarningStatistics, getMonthlyEarning, getMonthlyCommissionGiven, getOrderStatistics } from '../../../../../services/sellerApi';

export default function SellerEarningsPage({ navigation }) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [earnings, setEarnings] = useState({
    total_earn: 0,
    withdrawable_balance: 0,
    orders: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [statsType, setStatsType] = useState('yearEarn');
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState({ seller_earn: [], commission_earn: [] });
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [monthlyCommission, setMonthlyCommission] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [orderStatsLoading, setOrderStatsLoading] = useState(false);

  useEffect(() => {
    // fetchEarnings();
    fetchMonthlyEarnings();
    fetchMonthlyCommission();
    fetchOrderStats();
  }, []);

  useEffect(() => {
    fetchStatistics(statsType);
  }, [statsType]);

  const fetchEarnings = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axiosSellerClient.get(`/earnings?page=${page}`);
      console.log("/earnings?", response.data);
      if (page === 1) {
        setEarnings({
          total_earn: response.data.total_earn || 0,
          withdrawable_balance: response.data.withdrawable_balance || 0,
          orders: response.data.orders || [],
        });
      } else {
        setEarnings(prev => ({
          ...prev,
          orders: [...prev.orders, ...(response.data.orders || [])],
        }));
      }

      setHasMore(response.data.orders && response.data.orders.length === 10);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching earnings:', error?.response?.data || error.message);
      Alert.alert('Error', 'Failed to fetch earnings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStatistics = async (type = 'yearEarn') => {
    setStatsLoading(true);
    try {
      const response = await getEarningStatistics(type);
      setStats(response.data || { seller_earn: [], commission_earn: [] });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStats({ seller_earn: [], commission_earn: [] });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchMonthlyEarnings = async () => {
    try {
      const response = await getMonthlyEarning();
      // Backend returns comma-separated string
      setMonthlyEarnings((response.data || '').split(',').filter(Boolean).map(Number));
    } catch (error) {
      setMonthlyEarnings([]);
    }
  };

  const fetchMonthlyCommission = async () => {
    try {
      const response = await getMonthlyCommissionGiven();
      setMonthlyCommission((response.data || '').split(',').filter(Boolean).map(Number));
    } catch (error) {
      setMonthlyCommission([]);
    }
  };

  const fetchOrderStats = async () => {
    setOrderStatsLoading(true);
    try {
      const response = await getOrderStatistics('this_month');
      setOrderStats(response.data || null);
    } catch (error) {
      setOrderStats(null);
    } finally {
      setOrderStatsLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    // fetchEarnings(1);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      // fetchEarnings(currentPage + 1);
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

  return (
    <View style={[styles.pageContainer, { backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'] }]}>
      <View style={styles.pageHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ThemedIcon name="arrow-back-outline" iconStyle={{ width: 28, height: 28 }} />
        </TouchableOpacity>
        <Text style={[styles.pageTitle, {
          color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
        }]}>
          Earnings
        </Text>
      </View>

      {/* Earnings Statistics Section */}
      <View style={styles.statsSection}>
        <View style={styles.statsTabs}>
          <Button
            size="tiny"
            appearance={statsType === 'yearEarn' ? 'filled' : 'outline'}
            style={styles.statsTabBtn}
            onPress={() => setStatsType('yearEarn')}
          >Year</Button>
          <Button
            size="tiny"
            appearance={statsType === 'MonthEarn' ? 'filled' : 'outline'}
            style={styles.statsTabBtn}
            onPress={() => setStatsType('MonthEarn')}
          >Month</Button>
          <Button
            size="tiny"
            appearance={statsType === 'WeekEarn' ? 'filled' : 'outline'}
            style={styles.statsTabBtn}
            onPress={() => setStatsType('WeekEarn')}
          >Week</Button>
        </View>
        {statsLoading ? (
          <View style={{ alignItems: 'center', marginVertical: 12 }}>
            <Spinner size="small" />
          </View>
        ) : (
          <View style={styles.statsBarContainer}>
            <Text style={styles.statsTitle}>Earnings</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsBarScroll}>
              {stats.seller_earn.map((val, idx) => (
                <View key={idx} style={styles.statsBarItem}>
                  <View style={[styles.statsBar, { height: Math.max(8, Math.min(60, Number(val) / 10)) }]} />
                  <Text style={styles.statsBarLabel}>{val}</Text>
                </View>
              ))}
            </ScrollView>
            <Text style={styles.statsTitle}>Commission</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsBarScroll}>
              {stats.commission_earn.map((val, idx) => (
                <View key={idx} style={styles.statsBarItem}>
                  <View style={[styles.statsBar, { backgroundColor: '#ff9500', height: Math.max(8, Math.min(60, Number(val) / 10)) }]} />
                  <Text style={styles.statsBarLabel}>{val}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
      {/* END Earnings Statistics Section */}

      {/* Earnings Summary */}
      <View style={styles.earningsSummary}>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, {
            color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
          }]}>
            Total Earnings
          </Text>
          <Text style={[styles.summaryAmount, {
            color: theme['color-shadcn-primary']
          }]}>
            ${earnings.total_earn}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, {
            color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
          }]}>
            Withdrawable Balance
          </Text>
          <Text style={[styles.summaryAmount, {
            color: theme['color-shadcn-success']
          }]}>
            ${earnings.withdrawable_balance}
          </Text>
        </View>
      </View>

      {/* Orders List */}
      <View style={styles.ordersSection}>
        <Text style={[styles.sectionTitle, {
          color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
        }]}>
          Order History
        </Text>

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
          {earnings.orders.length > 0 ? (
            earnings.orders.map((order) => (
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
                      {new Date(order.updated_at).toLocaleDateString()}
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

                <View style={styles.orderEarnings}>
                  <View style={styles.earningRow}>
                    <Text style={[styles.earningLabel, {
                      color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                    }]}>
                      Delivery Charge:
                    </Text>
                    <Text style={[styles.earningAmount, {
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
              <ThemedIcon name="trending-up-outline" iconStyle={{ width: 48, height: 48 }} />
              <Text style={[styles.emptyText, {
                color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
              }]}>
                No orders found
              </Text>
              <Text style={[styles.emptySubtext, {
                color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
              }]}>
                No orders have been completed yet
              </Text>
            </View>
          )}

          {loading && earnings.orders.length > 0 && (
            <View style={styles.loadingMore}>
              <Spinner size='small' />
            </View>
          )}
        </ScrollView>
      </View>

      {/* Order Statistics Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Order Statistics (This Month)</Text>
        {orderStatsLoading ? (
          <Spinner size="small" />
        ) : orderStats ? (
          <View style={styles.orderStatsGrid}>
            {Object.entries(orderStats).map(([key, value]) => (
              <View key={key} style={styles.orderStatItem}>
                <Text style={styles.orderStatLabel}>{getStatusText(key)}</Text>
                <Text style={styles.orderStatValue}>{value}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No order statistics available.</Text>
        )}
      </View>
      {/* END Order Statistics Section */}

      {/* Monthly Earnings/Commission Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Monthly Earnings (Current Year)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsBarScroll}>
          {monthlyEarnings.map((val, idx) => (
            <View key={idx} style={styles.statsBarItem}>
              <View style={[styles.statsBar, { height: Math.max(8, Math.min(60, Number(val) / 10)) }]} />
              <Text style={styles.statsBarLabel}>{val}</Text>
            </View>
          ))}
        </ScrollView>
        <Text style={styles.sectionTitle}>Monthly Commission (Current Year)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsBarScroll}>
          {monthlyCommission.map((val, idx) => (
            <View key={idx} style={styles.statsBarItem}>
              <View style={[styles.statsBar, { backgroundColor: '#ff9500', height: Math.max(8, Math.min(60, Number(val) / 10)) }]} />
              <Text style={styles.statsBarLabel}>{val}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
      {/* END Monthly Earnings/Commission Section */}
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    padding: 16,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  earningsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  walletInfo: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  walletDetails: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 12,
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  walletValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  ordersSection: {
    flex: 1,
  },
  ordersList: {
    maxHeight: 300,
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
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
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
  orderEarnings: {
    marginTop: 8,
  },
  earningRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  earningAmount: {
    fontSize: 14,
    fontWeight: 'bold',
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
  statsSection: {
    marginBottom: 16,
  },
  statsTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  statsTabBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
  statsBarContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 12,
  },
  statsBarScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statsBarItem: {
    alignItems: 'center',
    marginRight: 10,
  },
  statsBar: {
    width: 20,
    backgroundColor: '#007aff',
    borderRadius: 4,
    marginBottom: 4,
  },
  statsBarLabel: {
    fontSize: 10,
    color: '#8e8e93',
  },
  orderStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  orderStatItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderStatLabel: {
    fontSize: 12,
    color: '#888',
  },
  orderStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007aff',
  },
});