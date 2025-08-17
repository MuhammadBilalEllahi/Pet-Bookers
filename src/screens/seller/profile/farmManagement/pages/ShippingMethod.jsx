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
} from '@ui-kitten/components';

import { useTheme } from '../../../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { axiosSellerClient } from '../../../../../utils/axiosClient';
import { ThemedIcon } from '../../../../../components/Icon';

export default function ShippingMethod() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form states
  const [addForm, setAddForm] = useState({
    title: '',
    duration: '',
    cost: '',
  });
  
  const [editForm, setEditForm] = useState({
    title: '',
    duration: '',
    cost: '',
  });

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  const fetchShippingMethods = async () => {
    try {
      setLoading(true);
      const response = await axiosSellerClient.get('/shipping-method/list');
      // console.log("shipping methods", response.data);
      setShippingMethods(response.data || []);
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
      Alert.alert('Error', 'Failed to fetch shipping methods');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const addShippingMethod = async () => {
    try {
      if (!addForm.title || !addForm.duration || !addForm.cost) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }

      // Validate cost is a positive integer
      const costValue = parseInt(addForm.cost);
      if (isNaN(costValue) || costValue <= 0) {
        Alert.alert('Error', 'Please enter a valid positive number for cost');
        return;
      }

      const response = await axiosSellerClient.post('/shipping-method/add', addForm);
      // console.log("shipping method added", response.data);
      
      Alert.alert('Success', response.data.message || 'Shipping method added successfully');
      setShowAddModal(false);
      setAddForm({ title: '', duration: '', cost: '' });
      fetchShippingMethods();
    } catch (error) {
      console.error('Error adding shipping method:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add shipping method');
    }
  };

  const updateShippingMethod = async () => {
    try {
      if (!editForm.title || !editForm.duration || !editForm.cost) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }

      // Validate cost is a positive integer
      const costValue = parseInt(editForm.cost);
      if (isNaN(costValue) || costValue <= 0) {
        Alert.alert('Error', 'Please enter a valid positive number for cost');
        return;
      }

      const response = await axiosSellerClient.put(`/shipping-method/update/${selectedMethod.id}`, editForm);
      // console.log("shipping method updated", response.data);
      
      Alert.alert('Success', response.data.message || 'Shipping method updated successfully');
      setShowEditModal(false);
      setSelectedMethod(null);
      setEditForm({ title: '', duration: '', cost: '' });
      fetchShippingMethods();
    } catch (error) {
      console.error('Error updating shipping method:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update shipping method');
    }
  };

  const updateStatus = async (methodId, newStatus) => {
    try {
      const response = await axiosSellerClient.put('/shipping-method/status', {
        id: methodId,
        status: newStatus ? 1 : 0,
      });
      // console.log("status updated", response.data);
      
      Alert.alert('Success', response.data.message || 'Status updated successfully');
      fetchShippingMethods();
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
    }
  };

  const deleteShippingMethod = async () => {
    try {
      const response = await axiosSellerClient.delete(`/shipping-method/delete/${selectedMethod.id}`);
      // console.log("shipping method deleted", response.data);
      
      Alert.alert('Success', response.data.message || 'Shipping method deleted successfully');
      setShowDeleteModal(false);
      setSelectedMethod(null);
      fetchShippingMethods();
    } catch (error) {
      console.error('Error deleting shipping method:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete shipping method');
    }
  };

  const openEditModal = async (method) => {
    try {
      const response = await axiosSellerClient.get(`/shipping-method/edit/${method.id}`);
      // console.log("method details", response.data);
      
      if (response.data && response.data.id) {
        setSelectedMethod(response.data);
        setEditForm({
          title: response.data.title || '',
          duration: response.data.duration || '',
          cost: response.data.cost ? response.data.cost.toString() : '',
        });
        setShowEditModal(true);
      } else {
        Alert.alert('Error', 'Failed to fetch method details');
      }
    } catch (error) {
      console.error('Error fetching method details:', error);
      Alert.alert('Error', 'Failed to fetch method details');
    }
  };

  const openDeleteModal = (method) => {
    setSelectedMethod(method);
    setShowDeleteModal(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchShippingMethods();
  };

  const getStatusColor = (status) => {
    return status === 1 ? '#34c759' : '#ff3b30';
  };

  const getStatusText = (status) => {
    return status === 1 ? 'Active' : 'Inactive';
  };

  if (loading && shippingMethods.length === 0) {
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
          Shipping Methods
        </Text>
        
        <Button
          size="small"
          onPress={() => setShowAddModal(true)}
          style={styles.addButton}
        >
          Add Shipping Method
        </Button>
      </View>

      {/* Shipping Methods List */}
      <ScrollView 
        style={styles.methodsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {shippingMethods.length > 0 ? (
          shippingMethods.map((method) => (
            <Card key={method.id} style={[styles.methodCard, { 
              backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)'
            }]}>
              <View style={styles.methodHeader}>
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodTitle, { 
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                  }]}>
                    {method.title}
                  </Text>
                  <Text style={[styles.methodDuration, { 
                    color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                  }]}>
                    Duration: {method.duration}
                  </Text>
                  <Text style={[styles.methodCost, { 
                    color: theme['color-shadcn-primary']
                  }]}>
                    Cost: ${method.cost}
                  </Text>
                </View>
                
                <View style={styles.methodStatus}>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: getStatusColor(method.status) 
                  }]}>
                    <Text style={styles.statusText}>
                      {getStatusText(method.status)}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.methodActions}>
                <Switch
                  value={method.status === 1}
                  onValueChange={(checked) => updateStatus(method.id, checked)}
                  style={styles.statusSwitch}
                />
                <Text style={[styles.switchLabel, { 
                  color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                }]}>
                  {method.status === 1 ? 'Active' : 'Inactive'}
                </Text>
                
                <View style={styles.actionButtons}>
                  <Button
                    size="tiny"
                    appearance="outline"
                    onPress={() => openEditModal(method)}
                    style={styles.actionButton}
                  >
                    Edit
                  </Button>
                  <Button
                    size="tiny"
                    appearance="outline"
                    status="danger"
                    onPress={() => openDeleteModal(method)}
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
              No shipping methods found
            </Text>
            <Text style={[styles.emptySubtext, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              Add your first shipping method to get started
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Shipping Method Modal */}
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
                Add Shipping Method
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <ThemedIcon name="close-outline" iconStyle={{ width: 24, height: 24 }} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Input
                label="Method Title"
                placeholder="Enter shipping method title"
                value={addForm.title}
                onChangeText={(text) => setAddForm(prev => ({ ...prev, title: text }))}
                style={styles.formInput}
              />
              
              <Input
                label="Duration"
                placeholder="e.g., 2-3 business days"
                value={addForm.duration}
                onChangeText={(text) => setAddForm(prev => ({ ...prev, duration: text }))}
                style={styles.formInput}
              />
              
              <Input
                label="Cost ($)"
                placeholder="Enter shipping cost (whole numbers only)"
                value={addForm.cost}
                onChangeText={(text) => {
                  // Only allow digits
                  const numericValue = text.replace(/[^0-9]/g, '');
                  setAddForm(prev => ({ ...prev, cost: numericValue }));
                }}
                keyboardType="numeric"
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
                  onPress={addShippingMethod}
                  style={styles.submitButton}
                >
                  Add Method
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Shipping Method Modal */}
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
                Edit Shipping Method
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <ThemedIcon name="close-outline" iconStyle={{ width: 24, height: 24 }} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Input
                label="Method Title"
                placeholder="Enter shipping method title"
                value={editForm.title}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, title: text }))}
                style={styles.formInput}
              />
              
              <Input
                label="Duration"
                placeholder="e.g., 2-3 business days"
                value={editForm.duration}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, duration: text }))}
                style={styles.formInput}
              />
              
              <Input
                label="Cost ($)"
                placeholder="Enter shipping cost (whole numbers only)"
                value={editForm.cost}
                onChangeText={(text) => {
                  // Only allow digits
                  const numericValue = text.replace(/[^0-9]/g, '');
                  setEditForm(prev => ({ ...prev, cost: numericValue }));
                }}
                keyboardType="numeric"
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
                  onPress={updateShippingMethod}
                  style={styles.submitButton}
                >
                  Update Method
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>
                Delete Shipping Method
              </Text>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <ThemedIcon name="close-outline" iconStyle={{ width: 24, height: 24 }} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.deleteMessage, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>
                Are you sure you want to delete "{selectedMethod?.title}"?
              </Text>
              <Text style={[styles.deleteWarning, { 
                color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
              }]}>
                This action cannot be undone.
              </Text>

              <View style={styles.buttonRow}>
                <Button
                  appearance="outline"
                  onPress={() => setShowDeleteModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  status="danger"
                  onPress={deleteShippingMethod}
                  style={styles.submitButton}
                >
                  Delete
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    marginLeft: 12,
  },
  methodsList: {
    flex: 1,
    padding: 16,
  },
  methodCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  methodDuration: {
    fontSize: 14,
    marginBottom: 2,
  },
  methodCost: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  methodStatus: {
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
  methodActions: {
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
  },
  actionButton: {
    marginLeft: 8,
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
    height: '100%',
    width: '100%',
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
  deleteMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  deleteWarning: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
});
