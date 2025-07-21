import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Text
} from 'react-native';
import {
  Layout,
  
  Button,
  Spinner,
  Card,
  Select,
  SelectItem,
  Input,
} from '@ui-kitten/components';

import { useTheme } from '../../../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { getTransactions, getWithdrawMethodList, submitWithdrawRequest, closeWithdrawRequest } from '../../../../../services/sellerApi';
import { ThemedIcon } from '../../../../../components/Icon';

export default function TransactionsPage({ navigation }) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [withdrawMethods, setWithdrawMethods] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Withdrawal Modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    withdraw_method_id: '',
    method_fields: {}
  });

  useEffect(() => {
    fetchTransactions();
    fetchWithdrawMethods();
  }, [statusFilter, dateFrom, dateTo]);

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        status: statusFilter,
        from: dateFrom,
        to: dateTo,
      };
      
      const response = await getTransactions(params);
      
      if (page === 1) {
        setTransactions(response.data || []);
      } else {
        setTransactions(prev => [...prev, ...(response.data || [])]);
      }
      
      setHasMore(response.data && response.data.length === 10);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      Alert.alert('Error', 'Failed to fetch transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchWithdrawMethods = async () => {
    try {
      const response = await getWithdrawMethodList();
      setWithdrawMethods(response.data || []);
    } catch (error) {
      console.error('Error fetching withdraw methods:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchTransactions(1);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchTransactions(currentPage + 1);
    }
  };

  const handleWithdrawRequest = async () => {
    try {
      setLoading(true);
      await submitWithdrawRequest(withdrawForm);
      Alert.alert('Success', 'Withdrawal request submitted successfully');
      setShowWithdrawModal(false);
      setWithdrawForm({ amount: '', withdraw_method_id: '', method_fields: {} });
      fetchTransactions(1);
    } catch (error) {
      console.error('Error submitting withdrawal request:', error);
      Alert.alert('Error', 'Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseWithdrawRequest = async (requestId) => {
    try {
      await closeWithdrawRequest(requestId);
      Alert.alert('Success', 'Withdrawal request closed successfully');
      fetchTransactions(1);
    } catch (error) {
      console.error('Error closing withdrawal request:', error);
      Alert.alert('Error', 'Failed to close withdrawal request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return '#ff9500'; // pending
      case 1: return '#34c759'; // approved
      case 2: return '#ff3b30'; // denied
      default: return '#8e8e93';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Approved';
      case 2: return 'Denied';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  // Always render as a page
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? theme['color-shadcn-background'] : '#fff' }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? theme['color-shadcn-background'] : '#fff'}
      />
      {/* Page Header */}
      <View style={[styles.pageHeader, { backgroundColor: isDark ? theme['color-shadcn-background'] : '#fff' }]}> 
        <Button
          appearance="ghost"
          size="small"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ThemedIcon name="arrow-back-outline" iconStyle={{ width: 24, height: 24 }} />
        </Button>
        <Text style={[styles.pageTitle, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
          {t('Transactions')}
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Select
          placeholder="Filter by Status"
          value={statusFilter}
          onSelect={(index) => {
            const statuses = ['', 'pending', 'approve', 'deny'];
            setStatusFilter(statuses[index.row]);
          }}
          style={styles.filterSelect}
        >
          <SelectItem title="All Status" />
          <SelectItem title="Pending" />
          <SelectItem title="Approved" />
          <SelectItem title="Denied" />
        </Select>
      </View>

      {/* Withdraw Button */}
      <Button
        onPress={() => setShowWithdrawModal(true)}
        style={styles.withdrawButton}
        appearance="filled"
      >
        {() => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ThemedIcon name="info-outline" iconStyle={{ width: 16, height: 16, marginRight: 8 }} />
            <Text>{t('Request Withdrawal')}</Text>
          </View>
        )}
      </Button>

      {/* Transactions List */}
      <ScrollView
        style={styles.transactionsList}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {loading && transactions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Spinner size='large' />
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedIcon name="info-outline" iconStyle={{ width: 48, height: 48, marginBottom: 16, opacity: 0.5 }} />
            <Text style={[styles.emptyText, {
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>{t('No transactions found')}</Text>
          </View>
        ) : (
          transactions.map((transaction, index) => (
            <Card key={index} style={[styles.transactionCard, {
              backgroundColor: isDark ? theme['color-shadcn-background'] : 'white'
            }]}> 
              <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionAmount, {
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                  }]}> {formatAmount(transaction.amount)} </Text>
                  <Text style={[styles.transactionMethod, {
                    color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                  }]}> {transaction.method_name || t('Withdrawal')} </Text>
                </View>
                <View style={[styles.statusBadge, {
                  backgroundColor: getStatusColor(transaction.approved) + '20'
                }]}> <Text style={[styles.statusText, {
                  color: getStatusColor(transaction.approved)
                }]}> {getStatusText(transaction.approved)} </Text> </View>
              </View>
              <View style={styles.transactionDetails}>
                <Text style={[styles.transactionDate, {
                  color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                }]}> {formatDate(transaction.created_at)} </Text>
                {transaction.approved === 0 && (
                  <Button
                    size="tiny"
                    appearance="outline"
                    status="danger"
                    onPress={() => handleCloseWithdrawRequest(transaction.id)}
                  >
                    {t('Cancel')}
                  </Button>
                )}
              </View>
            </Card>
          ))
        )}
        {loading && transactions.length > 0 && (
          <View style={styles.loadingMore}>
            <Spinner size='small' />
          </View>
        )}
      </ScrollView>

      {/* Withdrawal Form (as a bottom sheet/inline section) */}
      {showWithdrawModal && (
        <View style={styles.withdrawSheetOverlay}>
          <View style={[styles.withdrawSheet, { backgroundColor: isDark ? theme['color-shadcn-card'] : 'white' }]}> 
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}> 
                {t('RequestWithdrawal')}
              </Text>
              {/* <Button
                appearance="ghost"
                size="small"
                onPress={() => setShowWithdrawModal(false)}
              >
                {() => <ThemedIcon name="close-outline" />}
              </Button> */}
            </View>
            <View style={styles.withdrawForm}>
              <Select
                placeholder={t('Select Withdrawal Method')}
                value={withdrawForm.withdraw_method_id}
                onSelect={(index) => {
                  setWithdrawForm(prev => ({
                    ...prev,
                    withdraw_method_id: withdrawMethods[index.row]?.id
                  }));
                }}
                style={styles.formInput}
              >
                {withdrawMethods.map((method, index) => (
                  <SelectItem key={index} title={method.method_name} />
                ))}
              </Select>
              <Input
                placeholder={t('Amount')}
                value={withdrawForm.amount}
                onChangeText={(text) => setWithdrawForm(prev => ({ ...prev, amount: text }))}
                keyboardType="numeric"
                style={styles.formInput}
              />
              <View style={styles.withdrawActions}>
                <Button
                  appearance="outline"
                  onPress={() => setShowWithdrawModal(false)}
                  style={styles.withdrawActionButton}
                >
                  {() => <Text>{t('Cancel')}</Text>}
                </Button>
                <Button
                  onPress={handleWithdrawRequest}
                  disabled={loading || !withdrawForm.amount || !withdrawForm.withdraw_method_id}
                  style={styles.withdrawActionButton}
                >
                  {() => (
                    loading ? <Spinner size='small' /> : <Text>{t('Submit Request')}</Text>
                  )}
                </Button>
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  filtersContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  filterSelect: {
    marginBottom: 8,
  },
  withdrawButton: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  transactionsList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  transactionCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionMethod: {
    fontSize: 14,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 12,
  },
  loadingMore: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  withdrawSheetOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  withdrawSheet: {
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  withdrawForm: {
    marginTop: 8,
  },
  formInput: {
    marginBottom: 16,
  },
  withdrawActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  withdrawActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
}); 