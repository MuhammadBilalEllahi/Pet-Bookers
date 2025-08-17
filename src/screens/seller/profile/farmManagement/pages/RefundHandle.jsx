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
} from '@ui-kitten/components';

import { useTheme } from '../../../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { axiosSellerClient } from '../../../../../utils/axiosClient';
import { ThemedIcon } from '../../../../../components/Icon';

export const RefundHandle = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refunds, setRefunds] = useState([]);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [refundDetails, setRefundDetails] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const response = await axiosSellerClient.get('/refund/list');
      // console.log("refunds list",response.data);
      setRefunds(response.data || []);
    } catch (error) {
      console.error('Error fetching refunds:', error);
      Alert.alert('Error', 'Failed to fetch refunds');
    } finally {
      setLoading(false);
    }
  };

  const fetchRefundDetails = async (orderDetailsId) => {
    try {
      // console.log("Fetching refund details for order_details_id:", orderDetailsId);
      const response = await axiosSellerClient.get('/refund/refund-details', {
        params: { order_details_id: orderDetailsId }
      });
      // console.log("refund details",response.data);
      setRefundDetails(response.data);
      // console.log("refundDetails state set to:", response.data);
    } catch (error) {
      console.error('Error fetching refund details:', error);
      Alert.alert('Error', 'Failed to fetch refund details');
    }
  };

  const handleRefundPress = async (refund) => {
    // console.log("Selected refund:", refund);
    setSelectedRefund(refund);
    await fetchRefundDetails(refund.order_details_id);
    // setShowDetailModal(true);
    setTimeout(() => {
        setShowStatusModal(true);
      }, 300); 
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !statusNote.trim()) {
      Alert.alert('Error', 'Please select status and add a note');
      return;
    }

    try {
      setUpdatingStatus(true);
      const response = await axiosSellerClient.post('/refund/refund-status-update', {
        refund_status: selectedStatus,
        refund_request_id: selectedRefund.id,
        note: statusNote
      });

      // console.log("refund status updated successfully", response.data);
      Alert.alert('Success', 'Refund status updated successfully');
      setShowStatusModal(false);
      setShowDetailModal(false);
      setStatusNote('');
      setSelectedStatus('');
      fetchRefunds(); // Refresh the list
    } catch (error) {
      console.error('Error updating refund status:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };
  useEffect(() => {
    if (showStatusModal && selectedRefund) {
      setSelectedStatus(selectedRefund.status);
    }
  }, [showStatusModal]);
  

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return theme['color-warning-500'];
      case 'approved': return theme['color-success-500'];
      case 'rejected': return theme['color-danger-500'];
      case 'refunded': return theme['color-info-500'];
      default: return theme['color-basic-600'];
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'refunded': return 'Refunded';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getProductInfo = (refund) => {
    try {
      if (refund.order_details?.product_details) {
        const productDetails = JSON.parse(refund.order_details.product_details);
        return {
          name: productDetails.name || 'Product Name',
          image: productDetails.images ? JSON.parse(productDetails.images)[0] : null,
          price: refund.order_details.price || 0,
        };
      }
      return {
        name: 'Product Name',
        image: null,
        price: refund.order_details?.price || 0,
      };
    } catch (error) {
      console.error('Error parsing product details:', error);
      return {
        name: 'Product Name',
        image: null,
        price: refund.order_details?.price || 0,
      };
    }
  };

  const getProductImageUrl = (imageName) => {
    if (!imageName) return null;
    return `https://petbookers.com.pk/storage/app/public/product/${imageName}`;
  };

  // Only allow these statuses
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

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
      <ScrollView style={styles.scrollView}>
        <Text style={[styles.title, { 
          color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
        }]}>Refund Requests ({refunds.length})</Text>

        {refunds.length === 0 ? (
          <Card style={[styles.emptyCard, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)'
          }]}>
            <Text style={[styles.emptyText, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>No refund requests found</Text>
          </Card>
        ) : (
          refunds.map((refund, index) => {
            const productInfo = getProductInfo(refund);
            return (
              <Card
                key={refund.id}
                style={[styles.refundCard, { 
                  backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)',
                  marginBottom: 12
                }]}
                onPress={() => handleRefundPress(refund)}
              >
                <View style={styles.refundHeader}>
    <View>
                    <Text style={[styles.orderId, { 
                      color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                    }]}>Order #{refund.order_id}</Text>
                    <Text style={[styles.customerName, { 
                      color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                    }]}>
                      {refund.customer?.f_name} {refund.customer?.l_name}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(refund.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(refund.status)}</Text>
                  </View>
                </View>

                <Divider style={{ marginVertical: 8, backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />

                <View style={styles.productInfo}>
                  {productInfo.image && (
                    <Image
                      source={{ uri: getProductImageUrl(productInfo.image) }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.productDetails}>
                    <Text style={[styles.productName, { 
                      color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                    }]} numberOfLines={2}>
                      {productInfo.name}
                    </Text>
                    
                    <Text style={[styles.refundAmount, { 
                      color: theme['color-shadcn-primary'],
                      fontWeight: 'bold'
                    }]}>
                      Refund Amount: ${refund.amount}
                    </Text>
                  </View>
                </View>

                {refund.refund_reason && (
                  <View style={styles.reasonContainer}>
                    <Text style={[styles.reasonLabel, { 
                      color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                    }]}>Reason:</Text>
                    <Text style={[styles.reasonText, { 
                      color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                    }]} numberOfLines={2}>
                      {refund.refund_reason}
                    </Text>
                  </View>
                )}

                {/* Show approval/rejection notes if available */}
                {refund.status === 'approved' && refund.approved_note && (
                  <View style={styles.reasonContainer}>
                    <Text style={[styles.reasonLabel, { 
                      color: theme['color-success-500']
                    }]}>Approval Note:</Text>
                    <Text style={[styles.reasonText, { 
                      color: theme['color-success-500']
                    }]} numberOfLines={2}>
                      {refund.approved_note}
                    </Text>
                  </View>
                )}

                {refund.status === 'rejected' && refund.rejected_note && (
                  <View style={styles.reasonContainer}>
                    <Text style={[styles.reasonLabel, { 
                      color: theme['color-danger-500']
                    }]}>Rejection Note:</Text>
                    <Text style={[styles.reasonText, { 
                      color: theme['color-danger-500']
                    }]} numberOfLines={2}>
                      {refund.rejected_note}
                    </Text>
                  </View>
                )}

                <Text style={[styles.dateText, { 
                  color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                }]}>
                  Requested: {formatDate(refund.created_at)}
                </Text>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Refund Details Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>Refund Details</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <ThemedIcon name="close-outline" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {refundDetails ? (
                <>
                  <Card style={styles.detailCard}>
                    <Text style={[styles.detailTitle, { 
                      color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                    }]}>Order Information</Text>
                    
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>Order ID:</Text>
                      <Text style={[styles.detailValue, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
                        #{selectedRefund?.order_id || 'N/A'}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>Product Price:</Text>
                      <Text style={[styles.detailValue, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
                        ${refundDetails.product_price || 0}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>Quantity:</Text>
                      <Text style={[styles.detailValue, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
                        {refundDetails.quntity || 0}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>Refund Amount:</Text>
                      <Text style={[styles.detailValue, { color: theme['color-shadcn-primary'], fontWeight: 'bold' }]}>
                        ${refundDetails.refund_amount || 0}
                      </Text>
                    </View>
                    
                    {selectedRefund?.refund_reason && (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>Reason:</Text>
                        <Text style={[styles.detailValue, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
                          {selectedRefund.refund_reason}
                        </Text>
                      </View>
                    )}
                    
                    {/* Seller Info */}
                    {refundDetails.data && (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>Seller:</Text>
                        <Text style={[styles.detailValue, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
                          {refundDetails.data.f_name} {refundDetails.data.l_name}
                        </Text>
                      </View>
                    )}
                  </Card>

                  {/* Current Refund Status and Reason */}
                  {refundDetails.refund_request && refundDetails.refund_request.length > 0 && (
                    <Card style={styles.detailCard}>
                      <Text style={[styles.detailTitle, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>Current Status</Text>
                      
                      {refundDetails.refund_request.map((request, index) => (
                        <View key={index}>
                          <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>Status:</Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                              <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
                            </View>
                          </View>
                          
                          {request.refund_reason && (
                            <View style={styles.detailRow}>
                              <Text style={[styles.detailLabel, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>Refund Reason:</Text>
                              <Text style={[styles.detailValue, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
                                {request.refund_reason}
                              </Text>
                            </View>
                          )}
                          
                          {request.status === 'approved' && request.approved_note && (
                            <View style={styles.detailRow}>
                              <Text style={[styles.detailLabel, { color: theme['color-success-500'] }]}>Approval Note:</Text>
                              <Text style={[styles.detailValue, { color: theme['color-success-500'] }]}>
                                {request.approved_note}
                              </Text>
                            </View>
                          )}
                          
                          {request.status === 'rejected' && request.rejected_note && (
                            <View style={styles.detailRow}>
                              <Text style={[styles.detailLabel, { color: theme['color-danger-500'] }]}>Rejection Note:</Text>
                              <Text style={[styles.detailValue, { color: theme['color-danger-500'] }]}>
                                {request.rejected_note}
                              </Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </Card>
                  )}

                  {/* Refund History Section */}
                  {refundDetails.refund_request && refundDetails.refund_request.length > 0 ? (
                    <Card style={styles.detailCard}>
                      <Text style={[styles.detailTitle, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>Refund History</Text>
                      {refundDetails.refund_request.map((request, index) => (
                        <View key={index} style={styles.historyItem}>
                          <View style={styles.historyHeader}>
                            <Text style={[styles.historyStatus, { color: getStatusColor(request.status) }]}>
                              {getStatusText(request.status)}
                            </Text>
                            <Text style={[styles.historyDate, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>
                              {formatDate(request.created_at)}
                            </Text>
                          </View>
                          
                          {/* Show the correct note for each status */}
                          {request.status === 'approved' && request.approved_note && (
                            <Text style={[styles.historyReason, { color: theme['color-success-500'] }]}>
                              Approved Note: {request.approved_note}
                            </Text>
                          )}
                          {request.status === 'rejected' && request.rejected_note && (
                            <Text style={[styles.historyReason, { color: theme['color-danger-500'] }]}>
                              Rejected Note: {request.rejected_note}
                            </Text>
                          )}
                          {request.status === 'pending' && request.message && (
                            <Text style={[styles.historyReason, { color: theme['color-warning-500'] }]}>
                              Pending Note: {request.message}
                            </Text>
                          )}
                          {/* Show refund reason for initial request */}
                          {request.refund_reason && (
                            <Text style={[styles.historyReason, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
                              Refund Reason: {request.refund_reason}
                            </Text>
                          )}
                          {/* Fallback for any message field */}
                          {request.status !== 'approved' && request.status !== 'rejected' && request.status !== 'pending' && request.message && (
                            <Text style={styles.historyReason}>{request.message}</Text>
                          )}
                        </View>
                      ))}
                    </Card>
                  ) : (
                    <Card style={styles.detailCard}>
                      <Text style={[styles.detailTitle, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>Refund History</Text>
                      <Text style={[styles.emptyText, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>
                        No refund history available
                      </Text>
                    </Card>
                  )}

                  {/* Show status update button if not refunded */}
                  {selectedRefund?.status !== 'refunded' && (
                    <Button
                      onPress={() => {
                        setShowDetailModal(false);
                        // setShowStatusModal(true);
                        setTimeout(() => {
                            setShowStatusModal(true);
                          }, 300); 
                      }}
                      style={styles.updateButton}
                    >
                      Update Status
                    </Button>
                  )}
                </>
              ) : (
                <Card style={styles.detailCard}>
                  <Text style={[styles.detailTitle, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>Loading...</Text>
                  <Spinner size='small' />
                </Card>
              )}
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
              }]}>Update Refund Status</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <ThemedIcon name="close-outline" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.statusForm}>
              <Text style={[styles.formLabel, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>New Status</Text>
         <Select
  style={{ marginVertical: 10 }}
  selectedIndex={
    selectedStatus
      ? new IndexPath(statusOptions.findIndex(opt => opt.value === selectedStatus))
      : null
  }
  onSelect={(index) => {
    const selectedValue = statusOptions[index.row].value;
    setSelectedStatus(selectedValue);
  }}
  value={
    statusOptions.find(opt => opt.value === selectedStatus)?.label ?? 'Select Status'
  }
>
  {statusOptions.map((option) => (
    <SelectItem key={option.value} title={option.label} />
  ))}
</Select>



              <Text style={[styles.formLabel, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>Note</Text>
              <Input
                multiline
                textStyle={{ minHeight: 80 }}
                placeholder="Enter a note for this status update..."
                value={statusNote}
                onChangeText={setStatusNote}
                style={styles.noteInput}
              />

              <View style={styles.buttonRow}>
                <Button
                  appearance="outline"
                  onPress={() => setShowStatusModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleStatusUpdate}
                  disabled={updatingStatus || !selectedStatus || !statusNote.trim()}
                  style={styles.submitButton}
                >
                  {updatingStatus ? <Spinner size='small' /> : 'Update Status'}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  refundCard: {
    borderRadius: 12,
  },
  refundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerName: {
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
  productInfo: {
    flexDirection: 'row',
    marginTop: 8,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  refundAmount: {
    fontSize: 14,
    marginTop: 4,
  },
  reasonContainer: {
    marginTop: 8,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  reasonText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  dateText: {
    fontSize: 12,
    marginTop: 8,
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalScroll: {
    flex: 1,
  },
  detailCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
  },
  historyItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyDate: {
    fontSize: 12,
  },
  historyReason: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  updateButton: {
    marginTop: 16,
  },
  statusForm: {
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
  noteInput: {
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
  },
});