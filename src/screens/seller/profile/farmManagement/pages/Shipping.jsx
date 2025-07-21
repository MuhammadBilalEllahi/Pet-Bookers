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

export default function Shipping() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Shipping type state
  const [shippingType, setShippingType] = useState('order_wise');
  const [shippingTypeLoading, setShippingTypeLoading] = useState(false);
  
  // Category shipping costs state
  const [categoryCosts, setCategoryCosts] = useState([]);
  const [categoryCostsLoading, setCategoryCostsLoading] = useState(false);
  const [showCategoryCostsModal, setShowCategoryCostsModal] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchShippingType(),
      fetchCategoryCosts(),
    ]);
    setLoading(false);
  };

  const fetchShippingType = async () => {
    try {
      setShippingTypeLoading(true);
      const response = await axiosSellerClient.get('/shipping/get-shipping-method');
      console.log("shipping type", response.data);
      setShippingType(response.data.type || 'order_wise');
    } catch (error) {
      console.error('Error fetching shipping type:', error);
      Alert.alert('Error', 'Failed to fetch shipping type');
    } finally {
      setShippingTypeLoading(false);
    }
  };

  const fetchCategoryCosts = async () => {
    try {
      setCategoryCostsLoading(true);
      const response = await axiosSellerClient.get('/shipping/all-category-cost');
      console.log("category costs", response.data);
      setCategoryCosts(response.data.all_category_shipping_cost || []);
    } catch (error) {
      console.error('Error fetching category costs:', error);
      Alert.alert('Error', 'Failed to fetch category shipping costs');
    } finally {
      setCategoryCostsLoading(false);
    }
  };

  const updateShippingType = async (newType) => {
    try {
      setShippingTypeLoading(true);
      const response = await axiosSellerClient.get('/shipping/selected-shipping-method', {
        params: { shipping_type: newType }
      });
      console.log("shipping type updated", response.data);
      
      Alert.alert('Success', response.data.message || 'Shipping type updated successfully');
      setShippingType(newType);
    } catch (error) {
      console.error('Error updating shipping type:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update shipping type');
    } finally {
      setShippingTypeLoading(false);
    }
  };

  const updateCategoryCosts = async () => {
    try {
      const ids = categoryCosts.map(item => item.id);
      const costs = categoryCosts.map(item => item.cost);
      const multiplyQty = categoryCosts.map(item => item.multiply_qty ? 1 : 0);

      const response = await axiosSellerClient.post('/shipping/set-category-cost', {
        ids: ids,
        cost: costs,
        multiply_qty: multiplyQty,
      });
      console.log("category costs updated", response.data);
      
      Alert.alert('Success', response.data.success || 'Category costs updated successfully');
      setShowCategoryCostsModal(false);
      fetchCategoryCosts();
    } catch (error) {
      console.error('Error updating category costs:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update category costs');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  const getShippingTypeText = (type) => {
    return type === 'order_wise' ? 'Order Wise' : 'Category Wise';
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { 
          color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
        }]}>
          Shipping Configuration
        </Text>
        
        <Button
          size="small"
          onPress={() => setShowCategoryCostsModal(true)}
          style={styles.categoryButton}
        >
          Category Costs
        </Button>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Shipping Type Section */}
        <Card style={[styles.shippingTypeCard, { 
          backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)'
        }]}>
          <View style={styles.shippingTypeHeader}>
            <Text style={[styles.sectionTitle, { 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>
              Shipping Type
            </Text>
            {shippingTypeLoading && <Spinner size='small' />}
          </View>
          
          <View style={styles.shippingTypeContent}>
            <Text style={[styles.shippingTypeText, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              Current: {getShippingTypeText(shippingType)}
            </Text>
            
            <Text style={[styles.shippingTypeDescription, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              {shippingType === 'order_wise' 
                ? 'Fixed shipping cost applied to entire order regardless of items'
                : 'Shipping cost varies based on product categories'
              }
            </Text>
            
            <View style={styles.shippingTypeButtons}>
              <Button
                size="small"
                appearance={shippingType === 'order_wise' ? 'filled' : 'outline'}
                onPress={() => updateShippingType('order_wise')}
                disabled={shippingTypeLoading}
                style={styles.typeButton}
              >
                Order Wise
              </Button>
              <Button
                size="small"
                appearance={shippingType === 'category_wise' ? 'filled' : 'outline'}
                onPress={() => updateShippingType('category_wise')}
                disabled={shippingTypeLoading}
                style={styles.typeButton}
              >
                Category Wise
              </Button>
            </View>
          </View>
        </Card>

        {/* Category Costs Summary */}
        <Card style={[styles.categorySummaryCard, { 
          backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)'
        }]}>
          <View style={styles.categorySummaryHeader}>
            <Text style={[styles.sectionTitle, { 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>
              Category Shipping Costs
            </Text>
            {categoryCostsLoading && <Spinner size='small' />}
          </View>
          
          <View style={styles.categorySummaryContent}>
            <Text style={[styles.categorySummaryText, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              {categoryCosts.length} categories configured
            </Text>
            
            <Text style={[styles.categorySummaryDescription, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              {shippingType === 'category_wise' 
                ? 'Shipping costs are calculated based on product categories'
                : 'Category costs are used when category-wise shipping is enabled'
              }
            </Text>
            
            <Button
              size="small"
              appearance="outline"
              onPress={() => setShowCategoryCostsModal(true)}
              style={styles.manageButton}
            >
              Manage Category Costs
            </Button>
          </View>
        </Card>

        {/* Info Section */}
        <Card style={[styles.infoCard, { 
          backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)'
        }]}>
          <View style={styles.infoHeader}>
            <ThemedIcon name="info-outline" iconStyle={{ width: 24, height: 24 }} />
            <Text style={[styles.infoTitle, { 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>
              How Shipping Works
            </Text>
          </View>
          
          <View style={styles.infoContent}>
            <Text style={[styles.infoText, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              • <Text style={{ fontWeight: 'bold' }}>Order Wise:</Text> A fixed shipping cost is applied to the entire order regardless of the number of items or categories.
            </Text>
            
            <Text style={[styles.infoText, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              • <Text style={{ fontWeight: 'bold' }}>Category Wise:</Text> Shipping costs are calculated based on the product categories in the order. Each category can have its own shipping cost.
            </Text>
            
            <Text style={[styles.infoText, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              • <Text style={{ fontWeight: 'bold' }}>Multiply by Quantity:</Text> When enabled, the shipping cost is multiplied by the quantity of items in that category.
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Category Costs Modal */}
      <Modal
        visible={showCategoryCostsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryCostsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
            maxHeight: '80%',
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>
                Category Shipping Costs
              </Text>
              <TouchableOpacity onPress={() => setShowCategoryCostsModal(false)}>
                <ThemedIcon name="close-outline" iconStyle={{ width: 24, height: 24 }} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {categoryCostsLoading ? (
                <View style={styles.loadingContainer}>
                  <Spinner size='large' />
                </View>
              ) : (
                categoryCosts.map((categoryCost) => (
                  <Card key={categoryCost.id} style={[styles.categoryCostCard, { 
                    backgroundColor: isDark ? theme['color-shadcn-background'] : 'rgba(255,255,255,0.8)'
                  }]}>
                    <View style={styles.categoryCostHeader}>
                      <Text style={[styles.categoryName, { 
                        color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                      }]}>
                        {categoryCost.category?.name || 'Unknown Category'}
                      </Text>
                    </View>
                    
                    <View style={styles.categoryCostInputs}>
                      <Input
                        label="Cost ($)"
                        placeholder="Enter cost"
                        value={categoryCost.cost ? categoryCost.cost.toString() : ''}
                        onChangeText={(text) => {
                          const numericValue = text.replace(/[^0-9]/g, '');
                          const updatedCosts = categoryCosts.map(item => 
                            item.id === categoryCost.id 
                              ? { ...item, cost: numericValue }
                              : item
                          );
                          setCategoryCosts(updatedCosts);
                        }}
                        keyboardType="numeric"
                        style={styles.categoryCostInput}
                      />
                      
                      <View style={styles.multiplyQtyContainer}>
                        <Text style={[styles.multiplyQtyLabel, { 
                          color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                        }]}>
                          Multiply by Quantity
                        </Text>
                        <Switch
                          value={categoryCost.multiply_qty === 1}
                          onValueChange={(checked) => {
                            const updatedCosts = categoryCosts.map(item => 
                              item.id === categoryCost.id 
                                ? { ...item, multiply_qty: checked ? 1 : 0 }
                                : item
                            );
                            setCategoryCosts(updatedCosts);
                          }}
                        />
                      </View>
                    </View>
                  </Card>
                ))
              )}

              <View style={styles.buttonRow}>
                <Button
                  appearance="outline"
                  onPress={() => setShowCategoryCostsModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  onPress={updateCategoryCosts}
                  disabled={categoryCostsLoading}
                  style={styles.submitButton}
                >
                  Update Costs
                </Button>
              </View>
            </ScrollView>
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
  categoryButton: {
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  shippingTypeCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  shippingTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  shippingTypeContent: {
    alignItems: 'flex-start',
  },
  shippingTypeText: {
    fontSize: 14,
    marginBottom: 8,
  },
  shippingTypeDescription: {
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  shippingTypeButtons: {
    flexDirection: 'row',
  },
  typeButton: {
    marginRight: 8,
  },
  categorySummaryCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  categorySummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categorySummaryContent: {
    alignItems: 'flex-start',
  },
  categorySummaryText: {
    fontSize: 14,
    marginBottom: 8,
  },
  categorySummaryDescription: {
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  manageButton: {
    alignSelf: 'flex-start',
  },
  infoCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoContent: {
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
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
  categoryCostCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  categoryCostHeader: {
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryCostInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryCostInput: {
    flex: 1,
    marginRight: 12,
  },
  multiplyQtyContainer: {
    alignItems: 'center',
  },
  multiplyQtyLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
});
