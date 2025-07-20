import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  Image,
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
  Toggle,
} from '@ui-kitten/components';

import { useTheme } from '../../../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { axiosSellerClient } from '../../../../../utils/axiosClient';
import { ThemedIcon } from '../../../../../components/Icon';
import { MainScreensHeader } from '../../../../../components/buyer';
import { CustomDateTimePicker } from '../../../../../components/form';

export const CouponHandling = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [checkResult, setCheckResult] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    coupon_type: '',
    customer_id: '',
    limit: '',
    discount_type: '',
    discount: '',
    max_discount: '',
    min_purchase: '',
    code: '',
    title: '',
    start_date: '',
    expire_date: '',
  });

  // Check coupon states
  const [checkData, setCheckData] = useState({
    code: '',
    user_id: '',
    order_amount: '',
  });

  useEffect(() => {
    fetchCoupons();
    fetchCustomers();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axiosSellerClient.get('/coupon/list', {
        params: { limit: 50, offset: 0 }
      });
      console.log("coupons list", response.data);
      setCoupons(response.data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      Alert.alert('Error', 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axiosSellerClient.get('/coupon/customers');
      console.log("customers", response.data);
      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      coupon_type: '',
      customer_id: '',
      limit: '',
      discount_type: '',
      discount: '',
      max_discount: '',
      min_purchase: '',
      code: '',
      title: '',
      start_date: '',
      expire_date: '',
    });
  };

  const handleCreateCoupon = async () => {
    try {
      const response = await axiosSellerClient.post('/coupon/store', formData);
      console.log("coupon created", response.data);
      Alert.alert('Success', 'Coupon created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error('Error creating coupon:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create coupon');
    }
  };

  const handleEditCoupon = async () => {
    try {
      const response = await axiosSellerClient.put(`/coupon/update/${selectedCoupon.id}`, formData);
      console.log("coupon updated", response.data);
      Alert.alert('Success', 'Coupon updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error('Error updating coupon:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update coupon');
    }
  };

  const handleStatusUpdate = async (couponId, newStatus) => {
    try {
      const response = await axiosSellerClient.put(`/coupon/status-update/${couponId}`, {
        status: newStatus
      });
      console.log("status updated", response.data);
      Alert.alert('Success', 'Coupon status updated successfully');
      fetchCoupons();
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this coupon?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axiosSellerClient.delete(`/coupon/delete/${couponId}`);
              console.log("coupon deleted", response.data);
              Alert.alert('Success', 'Coupon deleted successfully');
              fetchCoupons();
            } catch (error) {
              console.error('Error deleting coupon:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete coupon');
            }
          }
        }
      ]
    );
  };

  const handleCheckCoupon = async () => {
    try {
      setCheckLoading(true);
      const response = await axiosSellerClient.post('/coupon/check-coupon', checkData);
      console.log("coupon check result", response.data);
      setCheckResult(response.data);
    } catch (error) {
      console.error('Error checking coupon:', error);
      setCheckResult({ message: error.response?.data?.message || 'Invalid coupon' });
    } finally {
      setCheckLoading(false);
    }
  };

  const openEditModal = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      coupon_type: coupon.coupon_type || '',
      customer_id: coupon.customer_id?.toString() || '',
      limit: coupon.limit?.toString() || '',
      discount_type: coupon.discount_type || '',
      discount: coupon.discount?.toString() || '',
      max_discount: coupon.max_discount?.toString() || '',
      min_purchase: coupon.min_purchase?.toString() || '',
      code: coupon.code || '',
      title: coupon.title || '',
      start_date: coupon.start_date || '',
      expire_date: coupon.expire_date || '',
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status) => {
    return status === 1 ? theme['color-success-500'] : theme['color-danger-500'];
  };

  const getStatusText = (status) => {
    return status === 1 ? 'Active' : 'Inactive';
  };

  const getCouponTypeText = (type) => {
    switch (type) {
      case 'discount_on_purchase': return 'Discount on Purchase';
      case 'free_delivery': return 'Free Delivery';
      case 'first_order': return 'First Order';
      default: return type;
    }
  };

  const getDiscountTypeText = (type) => {
    switch (type) {
      case 'amount': return 'Fixed Amount';
      case 'percentage': return 'Percentage';
      default: return type;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isFormValid = () => {
    const required = ['coupon_type', 'min_purchase', 'code', 'title', 'start_date', 'expire_date'];
    const discountRequired = ['customer_id', 'limit', 'discount_type', 'discount'];
    
    for (const field of required) {
      if (!formData[field]) return false;
    }
    
    if (formData.coupon_type === 'discount_on_purchase') {
      for (const field of discountRequired) {
        if (!formData[field]) return false;
      }
    }
    
    return true;
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
      <MainScreensHeader title="Coupon Management" navigation={navigation} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>Coupons ({coupons.length})</Text>
          <Button
            size="small"
            onPress={() => setTimeout(() => {
                setShowCreateModal(true);
              }, 400)}
            style={styles.addButton}
          >
            Add Coupon
          </Button>
        </View>

        <Button
          appearance="outline"
          onPress={() => setShowCheckModal(true)}
          style={styles.checkButton}
        >
          Check Coupon
        </Button>

        {coupons.length === 0 ? (
          <Card style={[styles.emptyCard, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)'
          }]}>
            <Text style={[styles.emptyText, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>No coupons found</Text>
          </Card>
        ) : (
          coupons.map((coupon) => (
            <Card
              key={coupon.id}
              style={[styles.couponCard, { 
                backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)',
                marginBottom: 12
              }]}
            >
              <View style={styles.couponHeader}>
                <View>
                  <Text style={[styles.couponTitle, { 
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                  }]}>{coupon.title}</Text>
                  <Text style={[styles.couponCode, { 
                    color: theme['color-shadcn-primary'],
                    fontWeight: 'bold'
                  }]}>Code: {coupon.code}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(coupon.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(coupon.status)}</Text>
                </View>
              </View>

              <Divider style={{ marginVertical: 8, backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />

              <View style={styles.couponDetails}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>Type:</Text>
                  <Text style={[styles.detailValue, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
                    {getCouponTypeText(coupon.coupon_type)}
                  </Text>
                </View>

                {coupon.coupon_type === 'discount_on_purchase' && (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>Discount:</Text>
                      <Text style={[styles.detailValue, { color: theme['color-shadcn-primary'] }]}>
                        {coupon.discount}{coupon.discount_type === 'percentage' ? '%' : '$'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>Max Discount:</Text>
                      <Text style={[styles.detailValue, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
                        ${coupon.max_discount}
                      </Text>
                    </View>
                  </>
                )}

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>Min Purchase:</Text>
                  <Text style={[styles.detailValue, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
                    ${coupon.min_purchase}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>Limit:</Text>
                  <Text style={[styles.detailValue, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
                    {coupon.limit} uses
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>Valid:</Text>
                  <Text style={[styles.detailValue, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
                    {formatDate(coupon.start_date)} - {formatDate(coupon.expire_date)}
                  </Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <Button
                  size="tiny"
                  appearance="outline"
                  onPress={() => openEditModal(coupon)}
                  style={styles.actionButton}
                >
                  Edit
                </Button>
                <Button
                  size="tiny"
                  appearance="outline"
                  onPress={() => handleStatusUpdate(coupon.id, coupon.status === 1 ? 0 : 1)}
                  style={styles.actionButton}
                >
                  {coupon.status === 1 ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  size="tiny"
                  appearance="outline"
                  status="danger"
                  onPress={() => handleDeleteCoupon(coupon.id)}
                  style={styles.actionButton}
                >
                  Delete
                </Button>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Create Coupon Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>Create New Coupon</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <ThemedIcon name="close-outline" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={[styles.modalScroll, {maxHeight: '85%'}]}   contentContainerStyle={{ paddingBottom: 40 }}>
              <Input
                label="Coupon Title"
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                style={styles.input}
              />

              <Input
                label="Coupon Code"
                value={formData.code}
                onChangeText={(text) => setFormData(prev => ({ ...prev, code: text }))}
                style={styles.input}
              />

              <Text style={[styles.formLabel, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>Coupon Type</Text>
              <Select
                style={styles.select}
                selectedIndex={formData.coupon_type ? new IndexPath(['discount_on_purchase', 'free_delivery', 'first_order'].indexOf(formData.coupon_type)) : null}
                onSelect={(index) => {
                  const types = ['discount_on_purchase', 'free_delivery', 'first_order'];
                  setFormData(prev => ({ ...prev, coupon_type: types[index.row] }));
                }}
                value={getCouponTypeText(formData.coupon_type) || 'Select Type'}
              >
                <SelectItem title="Discount on Purchase" />
                <SelectItem title="Free Delivery" />
                <SelectItem title="First Order" />
              </Select>

              <Text style={[styles.formLabel, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>Customer</Text>
              <Select
                style={styles.select}
                selectedIndex={formData.customer_id ? new IndexPath(customers.findIndex(c => c.id.toString() === formData.customer_id)) : null}
                onSelect={(index) => {
                  setFormData(prev => ({ ...prev, customer_id: customers[index.row].id.toString() }));
                }}
                value={customers.find(c => c.id.toString() === formData.customer_id)?.f_name + ' ' + customers.find(c => c.id.toString() === formData.customer_id)?.l_name || 'Select Customer'}
              >
                {customers.map((customer) => (
                  <SelectItem key={customer.id} title={`${customer.f_name} ${customer.l_name}`} />
                ))}
              </Select>

              <Input
                label="Usage Limit"
                value={formData.limit}
                onChangeText={(text) => setFormData(prev => ({ ...prev, limit: text }))}
                keyboardType="numeric"
                style={styles.input}
              />

              {formData.coupon_type === 'discount_on_purchase' && (
                <>
                  <Text style={[styles.formLabel, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>Discount Type</Text>
                  <Select
                    style={styles.select}
                    selectedIndex={formData.discount_type ? new IndexPath(['amount', 'percentage'].indexOf(formData.discount_type)) : null}
                    onSelect={(index) => {
                      const types = ['amount', 'percentage'];
                      setFormData(prev => ({ ...prev, discount_type: types[index.row] }));
                    }}
                    value={getDiscountTypeText(formData.discount_type) || 'Select Type'}
                  >
                    <SelectItem title="Fixed Amount" />
                    <SelectItem title="Percentage" />
                  </Select>

                  <Input
                    label="Discount Value"
                    value={formData.discount}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, discount: text }))}
                    keyboardType="numeric"
                    style={styles.input}
                  />

                  <Input
                    label="Max Discount"
                    value={formData.max_discount}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, max_discount: text }))}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </>
              )}

              <Input
                label="Minimum Purchase"
                value={formData.min_purchase}
                onChangeText={(text) => setFormData(prev => ({ ...prev, min_purchase: text }))}
                keyboardType="numeric"
                style={styles.input}
              />

              <CustomDateTimePicker
                label="Start Date"
                value={formData.start_date}
                onChange={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
                style={styles.input}
              />

              <CustomDateTimePicker
                label="Expire Date"
                value={formData.expire_date}
                onChange={(date) => setFormData(prev => ({ ...prev, expire_date: date }))}
                minimumDate={formData.start_date ? new Date(formData.start_date) : new Date()}
                style={styles.input}
              />

              <View style={styles.buttonRow}>
                <Button
                  appearance="outline"
                  onPress={() => setShowCreateModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleCreateCoupon}
                  disabled={!isFormValid()}
                  style={styles.submitButton}
                >
                  Create Coupon
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Coupon Modal */}
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
              }]}>Edit Coupon</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <ThemedIcon name="close-outline" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={[styles.modalScroll, {maxHeight: '85%'}]}   contentContainerStyle={{ paddingBottom: 40 }}>
              <Input
                label="Coupon Title"
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                style={styles.input}
              />

              <Input
                label="Coupon Code"
                value={formData.code}
                onChangeText={(text) => setFormData(prev => ({ ...prev, code: text }))}
                style={styles.input}
              />

              <Text style={[styles.formLabel, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>Coupon Type</Text>
              <Select
                style={styles.select}
                selectedIndex={formData.coupon_type ? new IndexPath(['discount_on_purchase', 'free_delivery', 'first_order'].indexOf(formData.coupon_type)) : null}
                onSelect={(index) => {
                  const types = ['discount_on_purchase', 'free_delivery', 'first_order'];
                  setFormData(prev => ({ ...prev, coupon_type: types[index.row] }));
                }}
                value={getCouponTypeText(formData.coupon_type) || 'Select Type'}
              >
                <SelectItem title="Discount on Purchase" />
                <SelectItem title="Free Delivery" />
                <SelectItem title="First Order" />
              </Select>

              <Text style={[styles.formLabel, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>Customer</Text>
              <Select
                style={styles.select}
                selectedIndex={formData.customer_id ? new IndexPath(customers.findIndex(c => c.id.toString() === formData.customer_id)) : null}
                onSelect={(index) => {
                  setFormData(prev => ({ ...prev, customer_id: customers[index.row].id.toString() }));
                }}
                value={customers.find(c => c.id.toString() === formData.customer_id)?.f_name + ' ' + customers.find(c => c.id.toString() === formData.customer_id)?.l_name || 'Select Customer'}
              >
                {customers.map((customer) => (
                  <SelectItem key={customer.id} title={`${customer.f_name} ${customer.l_name}`} />
                ))}
              </Select>

              <Input
                label="Usage Limit"
                value={formData.limit}
                onChangeText={(text) => setFormData(prev => ({ ...prev, limit: text }))}
                keyboardType="numeric"
                style={styles.input}
              />

              {formData.coupon_type === 'discount_on_purchase' && (
                <>
                  <Text style={[styles.formLabel, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>Discount Type</Text>
                  <Select
                    style={styles.select}
                    selectedIndex={formData.discount_type ? new IndexPath(['amount', 'percentage'].indexOf(formData.discount_type)) : null}
                    onSelect={(index) => {
                      const types = ['amount', 'percentage'];
                      setFormData(prev => ({ ...prev, discount_type: types[index.row] }));
                    }}
                    value={getDiscountTypeText(formData.discount_type) || 'Select Type'}
                  >
                    <SelectItem title="Fixed Amount" />
                    <SelectItem title="Percentage" />
                  </Select>

                  <Input
                    label="Discount Value"
                    value={formData.discount}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, discount: text }))}
                    keyboardType="numeric"
                    style={styles.input}
                  />

                  <Input
                    label="Max Discount"
                    value={formData.max_discount}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, max_discount: text }))}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </>
              )}

              <Input
                label="Minimum Purchase"
                value={formData.min_purchase}
                onChangeText={(text) => setFormData(prev => ({ ...prev, min_purchase: text }))}
                keyboardType="numeric"
                style={styles.input}
              />

              <CustomDateTimePicker
                label="Start Date"
                value={formData.start_date}
                onChange={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
                style={styles.input}
              />

              <CustomDateTimePicker
                label="Expire Date"
                value={formData.expire_date}
                onChange={(date) => setFormData(prev => ({ ...prev, expire_date: date }))}
                minimumDate={formData.start_date ? new Date(formData.start_date) : new Date()}
                style={styles.input}
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
                  onPress={handleEditCoupon}
                  disabled={!isFormValid()}
                  style={styles.submitButton}
                >
                  Update Coupon
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Check Coupon Modal */}
      <Modal
        visible={showCheckModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCheckModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>Check Coupon</Text>
              <TouchableOpacity onPress={() => setShowCheckModal(false)}>
                <ThemedIcon name="close-outline" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.checkForm}>
              <Input
                label="Coupon Code"
                value={checkData.code}
                onChangeText={(text) => setCheckData(prev => ({ ...prev, code: text }))}
                style={styles.input}
              />

              <Input
                label="User ID"
                value={checkData.user_id}
                onChangeText={(text) => setCheckData(prev => ({ ...prev, user_id: text }))}
                keyboardType="numeric"
                style={styles.input}
              />

              <Input
                label="Order Amount"
                value={checkData.order_amount}
                onChangeText={(text) => setCheckData(prev => ({ ...prev, order_amount: text }))}
                keyboardType="numeric"
                style={styles.input}
              />

              {checkResult && (
                <Card style={styles.resultCard}>
                  <Text style={[styles.resultText, { 
                    color: checkResult.coupon_discount_amount ? theme['color-success-500'] : theme['color-danger-500']
                  }]}>
                    {checkResult.coupon_discount_amount 
                      ? `Valid! Discount: $${checkResult.coupon_discount_amount}`
                      : checkResult.message || 'Invalid coupon'
                    }
                  </Text>
                </Card>
              )}

              <View style={styles.buttonRow}>
                <Button
                  appearance="outline"
                  onPress={() => setShowCheckModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleCheckCoupon}
                  disabled={checkLoading || !checkData.code || !checkData.order_amount}
                  style={styles.submitButton}
                >
                  {checkLoading ? <Spinner size='small' /> : 'Check Coupon'}
                </Button>
              </View>
            </View>
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    marginLeft: 8,
  },
  checkButton: {
    marginBottom: 16,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  couponCard: {
    borderRadius: 12,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  couponCode: {
    fontSize: 14,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  couponDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     width: '90%',
//     maxHeight: '80%',
//     borderRadius: 12,
//     padding: 16,
//   },
modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    borderRadius: 12,
    padding: 16,
  },
  modalScroll: {
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  checkForm: {
    padding: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  select: {
    marginBottom: 16,
  },
  input: {
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
  resultCard: {
    marginBottom: 16,
    padding: 12,
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CouponHandling;
