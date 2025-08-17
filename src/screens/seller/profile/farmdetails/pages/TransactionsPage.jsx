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
  const [selectedMethod, setSelectedMethod] = useState(null);

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
      Alert.alert(t('transactionsPage.alerts.errorTitle'), t('transactionsPage.alerts.fetchError'));
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
      // Validation
      if (!withdrawForm.amount || parseFloat(withdrawForm.amount) < 1) {
        Alert.alert(t('transactionsPage.alerts.errorTitle'), 'Amount must be at least $1');
        return;
      }
      
      if (!withdrawForm.withdraw_method_id) {
        Alert.alert(t('transactionsPage.alerts.errorTitle'), 'Please select a withdrawal method');
        return;
      }

      // Validate method-specific fields
      if (selectedMethod && selectedMethod.method_fields && selectedMethod.method_fields.length > 0) {
        for (const field of selectedMethod.method_fields) {
          if (!withdrawForm.method_fields[field.input_name]) {
            Alert.alert(t('transactionsPage.alerts.errorTitle'), `Please enter ${field.input_name}`);
            return;
          }
        }
      }

      setLoading(true);
      
      // Prepare request data with method fields
      const requestData = {
        amount: withdrawForm.amount,
        withdraw_method_id: withdrawForm.withdraw_method_id,
        ...withdrawForm.method_fields // Spread method-specific fields
      };

      await submitWithdrawRequest(requestData);
      Alert.alert(t('transactionsPage.alerts.successTitle'), t('transactionsPage.alerts.withdrawalSuccess'));
      setShowWithdrawModal(false);
      setWithdrawForm({ amount: '', withdraw_method_id: '', method_fields: {} });
      setSelectedMethod(null);
      fetchTransactions(1);
    } catch (error) {
      console.error('Error submitting withdrawal request:', error?.response?.data?.message || error?.message || error);
      const errorMessage = error?.response?.data?.message || error?.message || t('transactionsPage.alerts.withdrawalError');
      Alert.alert(t('transactionsPage.alerts.errorTitle'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseWithdrawRequest = async (requestId) => {
    try {
      await closeWithdrawRequest(requestId);
      Alert.alert(t('transactionsPage.alerts.successTitle'), t('transactionsPage.alerts.closeSuccess'));
      fetchTransactions(1);
    } catch (error) {
      console.error('Error closing withdrawal request:', error);
      Alert.alert(t('transactionsPage.alerts.errorTitle'), t('transactionsPage.alerts.closeError'));
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
      case 0: return t('transactionsPage.status.pending');
      case 1: return t('transactionsPage.status.approved');
      case 2: return t('transactionsPage.status.denied');
      default: return t('transactionsPage.status.unknown');
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
          {t('transactionsPage.title')}
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Select
          placeholder={t('transactionsPage.filters.filterByStatus')}
          value={statusFilter}
          onSelect={(index) => {
            const statuses = ['', 'pending', 'approve', 'deny'];
            setStatusFilter(statuses[index.row]);
          }}
          style={styles.filterSelect}
        >
          <SelectItem title={t('transactionsPage.filters.allStatus')} />
          <SelectItem title={t('transactionsPage.filters.pending')} />
          <SelectItem title={t('transactionsPage.filters.approved')} />
          <SelectItem title={t('transactionsPage.filters.denied')} />
        </Select>
      </View>

      {/* Withdraw Button */}
      <Button
        onPress={() => setShowWithdrawModal(true)}
        style={styles.withdrawButton}
        appearance="filled"
        accessoryLeft={(props) => <ThemedIcon name="info-outline" iconStyle={{ width: 16, height: 16 }} />}
      >
        {t('transactionsPage.requestWithdrawal')}
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
            }]}>{t('transactionsPage.noTransactionsFound')}</Text>
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
                  }]}>{formatAmount(transaction.amount)}</Text>
                  <Text style={[styles.transactionMethod, {
                    color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                  }]}>{transaction.method_name || t('transactionsPage.withdrawal')}</Text>
                </View>
                <View style={[styles.statusBadge, {
                  backgroundColor: getStatusColor(transaction.approved) + '20'
                }]}>
                  <Text style={[styles.statusText, {
                    color: getStatusColor(transaction.approved)
                  }]}>{getStatusText(transaction.approved)}</Text>
                </View>
              </View>
              <View style={styles.transactionDetails}>
                <Text style={[styles.transactionDate, {
                  color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                }]}>{formatDate(transaction.created_at)}</Text>
                {transaction.approved === 0 && (
                  <Button
                    size="tiny"
                    appearance="outline"
                    status="danger"
                    onPress={() => handleCloseWithdrawRequest(transaction.id)}
                  >
                    {t('transactionsPage.cancel')}
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
                {t('transactionsPage.requestWithdrawalTitle')}
              </Text>
              <Button
                appearance="ghost"
                size="small"
                onPress={() => setShowWithdrawModal(false)}
                accessoryLeft={(props) => <ThemedIcon name="close-outline" iconStyle={{ width: 20, height: 20 }} />}
              />
            </View>
            <View style={styles.withdrawForm}>
              <Select
                placeholder={t('transactionsPage.selectWithdrawalMethod')}
                value={selectedMethod ? selectedMethod.method_name : ''}
                onSelect={(index) => {
                  const method = withdrawMethods[index.row];
                  setSelectedMethod(method);
                  setWithdrawForm(prev => ({
                    ...prev,
                    withdraw_method_id: method?.id,
                    method_fields: {} // Reset method fields when changing method
                  }));
                }}
                style={styles.formInput}
              >
                {withdrawMethods.map((method, index) => (
                  <SelectItem key={index} title={method.method_name} />
                ))}
              </Select>
              <Input
                placeholder={t('transactionsPage.amount')}
                value={withdrawForm.amount}
                onChangeText={(text) => setWithdrawForm(prev => ({ ...prev, amount: text }))}
                keyboardType="numeric"
                style={styles.formInput}
              />
              
              {/* Dynamic method fields */}
              {selectedMethod && selectedMethod.method_fields && selectedMethod.method_fields.length > 0 && (
                <>
                  {selectedMethod.method_fields.map((field, index) => (
                    <Input
                      key={index}
                      placeholder={field.input_name || field.placeholder || `Enter ${field.input_name}`}
                      value={withdrawForm.method_fields[field.input_name] || ''}
                      onChangeText={(text) => setWithdrawForm(prev => ({
                        ...prev,
                        method_fields: {
                          ...prev.method_fields,
                          [field.input_name]: text
                        }
                      }))}
                      style={styles.formInput}
                      keyboardType={field.input_type === 'number' ? 'numeric' : 'default'}
                    />
                  ))}
                </>
              )}
              <View style={styles.withdrawActions}>
                <Button
                  appearance="outline"
                  onPress={() => setShowWithdrawModal(false)}
                  style={styles.withdrawActionButton}
                >
                  {t('transactionsPage.cancel')}
                </Button>
                <Button
                  onPress={handleWithdrawRequest}
                  disabled={loading || !withdrawForm.amount || !withdrawForm.withdraw_method_id}
                  style={styles.withdrawActionButton}
                  accessoryRight={loading ? () => <Spinner size='small' /> : undefined}
                >
                  {t('transactionsPage.submitRequest')}
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