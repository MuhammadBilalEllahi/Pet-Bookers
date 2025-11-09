import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  RefreshControl,
  Switch,
} from 'react-native';
import {
  Layout,
  Text,
  Button,
  Spinner,
  Card,
  Input,
  Avatar,
} from '@ui-kitten/components';

import { useTheme } from '../../../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { axiosSellerClient } from '../../../../../utils/axiosClient';
import { ThemedIcon } from '../../../../../components/Icon';
import ReviewsModal from './ReviewsPage';
import OrdersModal from './OrdersPage';
import EarningsModal from './EarningsPage';

export default function Delivery({ navigation }) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deliveryMen, setDeliveryMen] = useState([]);
  const [selectedDeliveryMan, setSelectedDeliveryMan] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  
  // Form states
  const [addForm, setAddForm] = useState({
    f_name: '',
    l_name: '',
    phone: '',
    email: '',
    country_code: '+92',
    password: '',
    confirm_password: '',
    address: '',
    identity_number: '',
    identity_type: 'passport',
  });
  
  const [editForm, setEditForm] = useState({
    f_name: '',
    l_name: '',
    phone: '',
    email: '',
    country_code: '+92',
    password: '',
    confirm_password: '',
    address: '',
    identity_number: '',
    identity_type: 'passport',
  });

  const [cashForm, setCashForm] = useState({
    amount: '',
  });

  useEffect(() => {
    fetchDeliveryMen();
  }, [currentPage, searchQuery]);

  const fetchDeliveryMen = async () => {
    try {
      setLoading(true);
      const response = await axiosSellerClient.get('/delivery-man/list', {
        params: {
          limit: 10,
          offset: (currentPage - 1) * 10,
          search: searchQuery,
        }
      });
      
      if (currentPage === 1) {
        setDeliveryMen(response.data.delivery_man || []);
      } else {
        setDeliveryMen(prev => [...prev, ...(response.data.delivery_man || [])]);
      }
      
      setTotalPages(Math.ceil(response.data.total_size / 10));
      setHasMore(response.data.delivery_man && response.data.delivery_man.length === 10);
    } catch (error) {
      console.error('Error fetching delivery men:', error);
      Alert.alert('Error', 'Failed to fetch delivery men');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const addDeliveryMan = async () => {
    try {
      if (!addForm.f_name || !addForm.l_name || !addForm.phone || !addForm.email || !addForm.password) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }

      if (addForm.password !== addForm.confirm_password) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      const response = await axiosSellerClient.post('/delivery-man/store', addForm);
      
      Alert.alert('Success', response.data.message || 'Delivery man added successfully');
      setShowAddModal(false);
      setAddForm({
        f_name: '',
        l_name: '',
        phone: '',
        email: '',
        country_code: '+92',
        password: '',
        confirm_password: '',
        address: '',
        identity_number: '',
        identity_type: 'passport',
      });
      setCurrentPage(1);
      fetchDeliveryMen();
    } catch (error) {
      console.error('Error adding delivery man:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add delivery man');
    }
  };

  const updateDeliveryMan = async () => {
    try {
      if (!editForm.f_name || !editForm.l_name || !editForm.phone || !editForm.email) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }

      if (editForm.password && editForm.password !== editForm.confirm_password) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      const response = await axiosSellerClient.put(`/delivery-man/update/${selectedDeliveryMan.id}`, editForm);
      
      Alert.alert('Success', response.data.message || 'Delivery man updated successfully');
      setShowEditModal(false);
      setSelectedDeliveryMan(null);
      setEditForm({
        f_name: '',
        l_name: '',
        phone: '',
        email: '',
        country_code: '+92',
        password: '',
        confirm_password: '',
        address: '',
        identity_number: '',
        identity_type: 'passport',
      });
      fetchDeliveryMen();
    } catch (error) {
      console.error('Error updating delivery man:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update delivery man');
    }
  };

  const updateStatus = async (deliveryManId, newStatus) => {
    try {
      const response = await axiosSellerClient.post('/delivery-man/status-update', {
        id: deliveryManId,
        status: newStatus ? 1 : 0,
      });
      
      Alert.alert('Success', response.data.message || 'Status updated successfully');
      fetchDeliveryMen();
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
    }
  };

  const deleteDeliveryMan = async (deliveryManId) => {
    try {
      const response = await axiosSellerClient.get(`/delivery-man/delete/${deliveryManId}`);
      
      Alert.alert('Success', response.data.message || 'Delivery man deleted successfully');
      fetchDeliveryMen();
    } catch (error) {
      console.error('Error deleting delivery man:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete delivery man');
    }
  };

  const openEditModal = async (deliveryMan) => {
    try {
      const response = await axiosSellerClient.get(`/delivery-man/details/${deliveryMan.id}`);
      
      if (response.data && response.data.delivery_man) {
        setSelectedDeliveryMan(response.data.delivery_man);
        setEditForm({
          f_name: response.data.delivery_man.f_name || '',
          l_name: response.data.delivery_man.l_name || '',
          phone: response.data.delivery_man.phone || '',
          email: response.data.delivery_man.email || '',
          country_code: response.data.delivery_man.country_code || '+92',
          password: '',
          confirm_password: '',
          address: response.data.delivery_man.address || '',
          identity_number: response.data.delivery_man.identity_number || '',
          identity_type: response.data.delivery_man.identity_type || 'passport',
        });
        setShowEditModal(true);
      } else {
        Alert.alert('Error', 'Failed to fetch delivery man details');
      }
    } catch (error) {
      console.error('Error fetching delivery man details:', error);
      Alert.alert('Error', 'Failed to fetch delivery man details');
    }
  };

  const openDetailsModal = async (deliveryMan) => {
    try {
      const response = await axiosSellerClient.get(`/delivery-man/details/${deliveryMan.id}`);
      
      if (response.data && response.data.delivery_man) {
        setSelectedDeliveryMan(response.data.delivery_man);
        setShowDetailsModal(true);
      } else {
        Alert.alert('Error', 'Failed to fetch delivery man details');
      }
    } catch (error) {
      console.error('Error fetching delivery man details:', error);
      Alert.alert('Error', 'Failed to fetch delivery man details');
    }
  };

  const openCashModal = (deliveryMan) => {
    setSelectedDeliveryMan(deliveryMan);
    setCashForm({ amount: '' });
    setShowCashModal(true);
  };

  const openReviewsModal = (deliveryMan) => {
    setSelectedDeliveryMan(deliveryMan);
    navigation.navigate('DeliveryManReviews', { deliveryMan });
  };

  const openOrdersModal = (deliveryMan) => {
    setSelectedDeliveryMan(deliveryMan);
    navigation.navigate('DeliveryManOrders', { deliveryMan });
  };

  const openEarningsModal = (deliveryMan) => {
    setSelectedDeliveryMan(deliveryMan);
    navigation.navigate('DeliveryManEarnings', { deliveryMan });
  };

  const collectCash = async () => {
    try {
      if (!cashForm.amount || parseFloat(cashForm.amount) <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }

      const response = await axiosSellerClient.post('/delivery-man/cash-receive', {
        deliveryman_id: selectedDeliveryMan.id,
        amount: parseFloat(cashForm.amount),
      });
      
      Alert.alert('Success', response.data.message || 'Cash collected successfully');
      setShowCashModal(false);
      setSelectedDeliveryMan(null);
      setCashForm({ amount: '' });
    } catch (error) {
      console.error('Error collecting cash:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to collect cash');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchDeliveryMen();
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const getStatusColor = (status) => {
    return status === 1 ? '#34c759' : '#ff3b30';
  };

  const getStatusText = (status) => {
    return status === 1 ? 'Active' : 'Inactive';
  };

  if (loading && deliveryMen.length === 0) {
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
        <View style={styles.headerLeft}>
          <Button
            appearance="ghost"
            size="small"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            ← Back
          </Button>
          <Text style={[styles.headerTitle, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}> 
            Delivery Management
          </Text>
        </View>
        <Button
          size="small"
          onPress={() => setShowAddModal(true)}
          style={styles.addButton}
        >
          Add Delivery Man
        </Button>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search delivery men..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Delivery Men List */}
      <ScrollView 
        style={styles.deliveryList}
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
        {deliveryMen.length > 0 ? (
          deliveryMen.map((deliveryMan) => (
            <Card key={deliveryMan.id} style={[styles.deliveryCard, { 
              backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)'
            }]}>
              <View style={styles.deliveryHeader}>
                <View style={styles.deliveryInfo}>
                  <Avatar
                    source={{ uri: deliveryMan.image }}
                    style={styles.avatar}
                  />
                  <View style={styles.deliveryDetails}>
                    <Text style={[styles.deliveryName, { 
                      color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                    }]}>
                      {deliveryMan.f_name} {deliveryMan.l_name}
                    </Text>
                    <Text style={[styles.deliveryPhone, { 
                      color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                    }]}>
                      {deliveryMan.country_code} {deliveryMan.phone}
                    </Text>
                    <Text style={[styles.deliveryEmail, { 
                      color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                    }]}>
                      {deliveryMan.email}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.deliveryStatus}>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: getStatusColor(deliveryMan.is_active) 
                  }]}>
                    <Text style={styles.statusText}>
                      {getStatusText(deliveryMan.is_active)}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.deliveryActions}>
                <Switch
                  value={deliveryMan.is_active === 1}
                  onValueChange={(checked) => updateStatus(deliveryMan.id, checked)}
                  style={styles.statusSwitch}
                />
                <Text style={[styles.switchLabel, { 
                  color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                }]}>
                  {deliveryMan.is_active === 1 ? 'Active' : 'Inactive'}
                </Text>
                
                <View style={styles.actionButtons}>
                  <Button
                    size="tiny"
                    appearance="outline"
                    onPress={() => openDetailsModal(deliveryMan)}
                    style={styles.actionButton}
                  >
                    Details
                  </Button>
                  <Button
                    size="tiny"
                    appearance="outline"
                    onPress={() => openCashModal(deliveryMan)}
                    style={styles.actionButton}
                  >
                    Cash
                  </Button>
                  <Button
                    size="tiny"
                    appearance="outline"
                    onPress={() => openReviewsModal(deliveryMan)}
                    style={styles.actionButton}
                  >
                    Reviews
                  </Button>
                  <Button
                    size="tiny"
                    appearance="outline"
                    onPress={() => openOrdersModal(deliveryMan)}
                    style={styles.actionButton}
                  >
                    Orders
                  </Button>
                  <Button
                    size="tiny"
                    appearance="outline"
                    onPress={() => openEarningsModal(deliveryMan)}
                    style={styles.actionButton}
                  >
                    Earnings
                  </Button>
                  <Button
                    size="tiny"
                    appearance="outline"
                    onPress={() => openEditModal(deliveryMan)}
                    style={styles.actionButton}
                  >
                    Edit
                  </Button>
                  <Button
                    size="tiny"
                    appearance="outline"
                    status="danger"
                    onPress={() => deleteDeliveryMan(deliveryMan.id)}
                    style={styles.actionButton}
                  >
                    Delete
                  </Button>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <ThemedIcon name="car-outline" iconStyle={{ width: 48, height: 48 }} />
            <Text style={[styles.emptyText, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              No delivery men found
            </Text>
            <Text style={[styles.emptySubtext, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              Add your first delivery man to get started
            </Text>
          </View>
        )}
        
        {loading && deliveryMen.length > 0 && (
          <View style={styles.loadingMore}>
            <Spinner size='small' />
          </View>
        )}
      </ScrollView>

      {/* Add Delivery Man Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>
                Add Delivery Man
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <ThemedIcon name="close-outline" iconStyle={{ width: 24, height: 24 }} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Input
                label="First Name *"
                placeholder="Enter first name"
                value={addForm.f_name}
                onChangeText={(text) => setAddForm(prev => ({ ...prev, f_name: text }))}
                style={styles.formInput}
              />
              
              <Input
                label="Last Name *"
                placeholder="Enter last name"
                value={addForm.l_name}
                onChangeText={(text) => setAddForm(prev => ({ ...prev, l_name: text }))}
                style={styles.formInput}
              />
              
              <Input
                label="Phone *"
                placeholder="Enter phone number"
                value={addForm.phone}
                onChangeText={(text) => setAddForm(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
                style={styles.formInput}
              />
              
              <Input
                label="Email *"
                placeholder="Enter email address"
                value={addForm.email}
                onChangeText={(text) => setAddForm(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                style={styles.formInput}
              />
              
              <Input
                label="Password *"
                placeholder="Enter password"
                value={addForm.password}
                onChangeText={(text) => setAddForm(prev => ({ ...prev, password: text }))}
                secureTextEntry
                style={styles.formInput}
              />
              
              <Input
                label="Confirm Password *"
                placeholder="Confirm password"
                value={addForm.confirm_password}
                onChangeText={(text) => setAddForm(prev => ({ ...prev, confirm_password: text }))}
                secureTextEntry
                style={styles.formInput}
              />
              
              <Input
                label="Address"
                placeholder="Enter address"
                value={addForm.address}
                onChangeText={(text) => setAddForm(prev => ({ ...prev, address: text }))}
                multiline
                style={styles.formInput}
              />

              <View style={styles.buttonRow}>
                <Button
                  appearance="outline"
                  onPress={() => setShowAddModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  onPress={addDeliveryMan}
                  style={styles.submitButton}
                >
                  Add Delivery Man
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Delivery Man Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>
                Edit Delivery Man
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <ThemedIcon name="close-outline" iconStyle={{ width: 24, height: 24 }} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Input
                label="First Name *"
                placeholder="Enter first name"
                value={editForm.f_name}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, f_name: text }))}
                style={styles.formInput}
              />
              
              <Input
                label="Last Name *"
                placeholder="Enter last name"
                value={editForm.l_name}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, l_name: text }))}
                style={styles.formInput}
              />
              
              <Input
                label="Phone *"
                placeholder="Enter phone number"
                value={editForm.phone}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
                style={styles.formInput}
              />
              
              <Input
                label="Email *"
                placeholder="Enter email address"
                value={editForm.email}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                style={styles.formInput}
              />
              
              <Input
                label="Password (leave blank to keep current)"
                placeholder="Enter new password"
                value={editForm.password}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, password: text }))}
                secureTextEntry
                style={styles.formInput}
              />
              
              <Input
                label="Confirm Password"
                placeholder="Confirm new password"
                value={editForm.confirm_password}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, confirm_password: text }))}
                secureTextEntry
                style={styles.formInput}
              />
              
              <Input
                label="Address"
                placeholder="Enter address"
                value={editForm.address}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, address: text }))}
                multiline
                style={styles.formInput}
              />

              <View style={styles.buttonRow}>
                <Button
                  appearance="outline"
                  onPress={() => setShowEditModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  onPress={updateDeliveryMan}
                  style={styles.submitButton}
                >
                  Update Delivery Man
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Cash Collection Modal */}
      <Modal
        visible={showCashModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCashModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>
                Collect Cash
              </Text>
              <TouchableOpacity onPress={() => setShowCashModal(false)}>
                <ThemedIcon name="close-outline" iconStyle={{ width: 24, height: 24 }} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.cashMessage, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>
                Collect cash from {selectedDeliveryMan?.f_name} {selectedDeliveryMan?.l_name}
              </Text>
              
              <Input
                label="Amount (PKR)"
                placeholder="Enter amount to collect"
                value={cashForm.amount}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^0-9.]/g, '');
                  setCashForm(prev => ({ ...prev, amount: numericValue }));
                }}
                keyboardType="numeric"
                style={styles.formInput}
              />

              <View style={styles.buttonRow}>
                <Button
                  appearance="outline"
                  onPress={() => setShowCashModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  onPress={collectCash}
                  style={styles.submitButton}
                >
                  Collect Cash
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>
                Delivery Man Details
              </Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <ThemedIcon name="close-outline" iconStyle={{ width: 24, height: 24 }} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedDeliveryMan && (
                <View style={styles.detailsContent}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { 
                      color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                    }]}>
                      Name:
                    </Text>
                    <Text style={[styles.detailValue, { 
                      color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                    }]}>
                      {selectedDeliveryMan.f_name} {selectedDeliveryMan.l_name}
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
                      {selectedDeliveryMan.country_code} {selectedDeliveryMan.phone}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { 
                      color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                    }]}>
                      Email:
                    </Text>
                    <Text style={[styles.detailValue, { 
                      color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                    }]}>
                      {selectedDeliveryMan.email}
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
                      {selectedDeliveryMan.address || 'Not provided'}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { 
                      color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                    }]}>
                      Status:
                    </Text>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: getStatusColor(selectedDeliveryMan.is_active) 
                    }]}>
                      <Text style={styles.statusText}>
                        {getStatusText(selectedDeliveryMan.is_active)}
                      </Text>
                    </View>
                  </View>
                  
                  {selectedDeliveryMan.wallet && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { 
                        color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                      }]}>
                        Cash in Hand:
                      </Text>
                      <Text style={[styles.detailValue, { 
                        color: theme['color-shadcn-primary']
                      }]}>
                        ${selectedDeliveryMan.wallet.cash_in_hand || 0}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.buttonRow}>
                <Button
                  appearance="outline"
                  onPress={() => setShowDetailsModal(false)}
                  style={styles.cancelButton}
                >
                  Close
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Reviews Modal */}
      {/* Removed as per edit hint */}

      {/* Orders Modal */}
      {/* Removed as per edit hint */}

      {/* Earnings Modal */}
      {/* Removed as per edit hint */}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    marginRight: 8,
  },
  addButton: {
    marginLeft: 8,
  },
  searchContainer: {
    padding: 16,
    paddingTop: 8,
  },
  searchInput: {
    marginBottom: 0,
  },
  deliveryList: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  deliveryCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deliveryInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  deliveryDetails: {
    flex: 1,
  },
  deliveryName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deliveryPhone: {
    fontSize: 14,
    marginBottom: 2,
  },
  deliveryEmail: {
    fontSize: 14,
  },
  deliveryStatus: {
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
  deliveryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusSwitch: {
    marginRight: 8,
  },
  switchLabel: {
    fontSize: 12,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    marginLeft: 4,
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
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
  },
  modalBody: {
    flex: 1,
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
  cashMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  detailsContent: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
}); 